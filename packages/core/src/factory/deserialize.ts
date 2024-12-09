import type { namedTypes } from 'ast-types'
import type { ResourceFactory, ResourceFactoryField, ResourceFactoryFieldsMap } from '../types/factory.js'
import type { ResourceInstanceReference } from '../types/resource.js'
import vm from 'node:vm'
import { getReturnNode } from '../ast/fn.js'
import { parseCode } from '../ast/parse.js'
import { printCode } from '../ast/print.js'
import { createResourceInstanceReference } from '../resource/resourceReference.js'

export async function deserializeFactory(code: string): Promise<Pick<ResourceFactory, 'info' | 'fields' | 'ast'>> {
  const ast = parseCode(code)

  const defaultExport = ast.program.body.find((node: any) => node.type === 'ExportDefaultDeclaration') as namedTypes.ExportDefaultDeclaration

  if (!defaultExport) {
    throw new Error('No default export found')
  }

  const declaration = defaultExport.declaration
  if (declaration.type !== 'CallExpression') {
    throw new Error('Unexpected declaration type')
  }
  if (declaration.callee.type !== 'Identifier') {
    throw new Error('Unexpected declaration callee type')
  }
  if (declaration.callee.name !== 'defineFactory') {
    throw new Error('Unexpected declaration callee name')
  }
  if (declaration.arguments.length !== 2) {
    throw new Error('Unexpected declaration arguments length')
  }

  const factoryInfosAst = declaration.arguments[0]
  const factoryInfosCode = printCode(factoryInfosAst)

  const factoryInfo = vm.runInNewContext(`(${factoryInfosCode})`)

  const factoryBody = declaration.arguments[1]

  const factoryBodyReturn = getReturnNode(factoryBody)

  if (factoryBodyReturn.type !== 'ObjectExpression') {
    throw new Error('Unexpected factory body return type')
  }

  const isResourceField = true

  function getFactoryFieldFromAst(propAst: any): ResourceFactoryField {
    const rawCode = printCode(propAst.type === 'ObjectProperty' ? propAst.value : propAst)
    const result: ResourceFactoryField = {
      type: 'other',
      rawCode,
    }

    if (propAst.type === 'ObjectProperty') {
      result.lazy = propAst.value.type === 'ArrowFunctionExpression' || propAst.value.type === 'FunctionExpression'
      if (result.lazy) {
        result.lazyBody = printCode(propAst.value.body)
        propAst = getReturnNode(propAst.value)
      }
      else {
        propAst = propAst.value
      }
    }

    if (propAst.type === 'CallExpression') {
      const callee = propAst.callee
      if (callee.type === 'MemberExpression') {
        const object = callee.object
        if (object.type === 'MemberExpression') {
          const objectObject = object.object
          if (objectObject.type === 'Identifier') {
            if (objectObject.name === 'faker') {
              result.type = 'faker'

              // Faker fn name
              const objectProperty = object.property
              if (objectProperty.type === 'Identifier') {
                const property = callee.property
                if (callee.property.type === 'Identifier') {
                  result.fakerFn = `${objectProperty.name}.${property.name}`
                }
              }

              // Faker params
              if (propAst.arguments.length > 0) {
                result.fakerParams = printCode(propAst.arguments[0])
              }
            }
            else if (objectObject.name === 'db') {
              result.type = 'db'

              // DB resource name
              const objectProperty = object.property
              if (objectProperty.type === 'Identifier') {
                result.dbResource = objectProperty.name
              }

              // Function name
              const property = callee.property
              if (property.type === 'Identifier') {
                result.dbFn = property.name
              }

              // Params
              if (propAst.arguments.length > 0) {
                result.dbParams = printCode(propAst.arguments[0])
                result.value = propAst.arguments.map((arg: any) => arg.value)
              }
            }
          }
        }
      }
      else if (callee.type === 'Identifier') {
        if (callee.name === 'repeat') {
          result.type = 'repeat'
          const [arrowFnAst, minAst, maxAst] = propAst.arguments
          const childAst = getReturnNode(arrowFnAst)
          result.child = getFactoryFieldFromAst(childAst)
          result.repeatMin = minAst.value
          result.repeatMax = maxAst.value
        }
        else if (callee.name === 'pickRandom') {
          result.type = 'pickRandom'
          result.pickRandomList = printCode(propAst.arguments[0])
        }
      }
    }
    else if (propAst.type === 'ObjectExpression') {
      if (isResourceField) {
        result.type = 'object'
      }
      result.children = processReturnObject(propAst)
    }
    else if (propAst.type === 'ArrayExpression') {
      result.type = 'array'
      const array: ResourceFactoryField[] = []
      for (const itemAst of propAst.elements) {
        array.push(getFactoryFieldFromAst(itemAst))
      }
      result.arrayChildren = array

      const refs: ResourceInstanceReference[] = []
      for (const child of array) {
        if (child.type === 'db' && child.dbFn === 'getReference') {
          refs.push(createResourceInstanceReference(child.dbResource!, child.value[0]))
        }
      }
      if (refs.length) {
        result.dbReferences = refs
        result.dbResource = refs[0].__resourceName

        // Only refs => db
        if (refs.length === array.length) {
          result.type = 'db'
        }
      }
    }
    else if (propAst.type === 'NullLiteral') {
      result.type = 'null'
    }
    else if ('value' in propAst) {
      result.value = propAst.value
    }

    return result
  }

  function processReturnObject(node: any) {
    const result: ResourceFactoryFieldsMap = {}

    for (const propAst of node.properties) {
      const name = propAst.key.name
      result[name] = getFactoryFieldFromAst(propAst)
    }

    return result
  }

  return {
    ast,
    info: factoryInfo,
    fields: processReturnObject(factoryBodyReturn),
  }
}
