import type { namedTypes } from 'ast-types'
import type { ResourceFactory, ResourceFactoryField, ResourceFactoryFieldsMap, ResourceFactoryLazyContext } from '../types/factory.js'
import { builders } from 'ast-types'
import { getReturnNode } from '../ast/fn.js'
import { generateAstFromObject, generateAstFromValue } from '../ast/objectToAst.js'
import { parseCode } from '../ast/parse.js'
import { printCode } from '../ast/print.js'
import { storageVersion } from '../storage/storage.js'

export async function serializeFactory(factory: ResourceFactory): Promise<namedTypes.File> {
  const ast = factory.ast ?? parseCode(`import { defineFactory } from 'moquerie/mocks'

export const version = '${storageVersion}'

export default defineFactory({}, () => ({}))`)

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

  const factoryInfosAst = declaration.arguments[0] as namedTypes.ObjectExpression

  if (factoryInfosAst.type !== 'ObjectExpression') {
    throw new Error('Unexpected factory infos type')
  }

  generateAstFromObject(factory.info, factoryInfosAst, true)

  const factoryBody = declaration.arguments[1] as namedTypes.ArrowFunctionExpression | namedTypes.FunctionExpression

  const contextProps = new Set<string>()

  function parseParams(paramsCode: string) {
    const ast = parseCode(`fn(${paramsCode})`)
    const statement = ast.program.body[0] as namedTypes.ExpressionStatement
    const callExpression = statement.expression as namedTypes.CallExpression
    return callExpression.arguments[0]
  }

  function getLazyContextArgs(code: string) {
    const lazyContextProps = ([
      'item',
      'rootRef',
    ] satisfies Array<keyof ResourceFactoryLazyContext>).filter(prop => code.includes(prop))

    const args = []

    if (lazyContextProps.length) {
      args.push(builders.objectPattern(
        lazyContextProps.map((prop) => {
          const ast = builders.property('init', builders.identifier(prop), builders.identifier(prop))
          ast.shorthand = true
          return ast
        }),
      ))
    }

    return args
  }

  function generateAstField(fieldName: string, field: ResourceFactoryField, _parentField: ResourceFactoryField | null): namedTypes.CallExpression | namedTypes.ObjectExpression | namedTypes.Identifier | namedTypes.Literal | namedTypes.ArrayExpression | namedTypes.ArrowFunctionExpression {
    let resultAst: any
    if (field.type === 'faker') {
      if (!field.fakerFn) {
        throw new Error(`Missing fakerFn for field ${fieldName}`)
      }
      contextProps.add('faker')
      const [cat, fn] = field.fakerFn.split('.')
      const fnIdentifierAst = builders.memberExpression(builders.memberExpression(builders.identifier('faker'), builders.identifier(cat)), builders.identifier(fn))
      resultAst = builders.callExpression(fnIdentifierAst, field.fakerParams ? [parseParams(field.fakerParams)] : [])
    }
    else if (field.type === 'db') {
      if (!field.dbFn && field.dbReferences) {
        contextProps.add('db')

        const children = field.dbReferences.map(ref => ({
          type: 'db',
          dbFn: 'getReference',
          dbResource: ref.__resourceName,
          dbParams: `'${ref.__id}'`,
          value: [ref.__id],
        }) satisfies ResourceFactoryField)

        const elements = children.map(childField => generateAstField(fieldName, childField, field))
        resultAst = builders.arrayExpression(elements)
      }
      else {
        if (!field.dbFn) {
          throw new Error(`Missing dbFn for field ${fieldName}`)
        }
        if (!field.dbResource) {
          throw new Error(`Missing dbResource for field ${fieldName}`)
        }
        contextProps.add('db')
        const fnIdentifierAst = builders.memberExpression(builders.memberExpression(builders.identifier('db'), builders.identifier(field.dbResource)), builders.identifier(field.dbFn))
        const callExpression = builders.callExpression(fnIdentifierAst, field.dbParams ? [parseParams(field.dbParams)] : [])
        resultAst = callExpression
      }
    }
    else if (field.type === 'repeat') {
      if (!field.child) {
        throw new Error(`Missing child for field ${fieldName}`)
      }
      contextProps.add('repeat')
      const ast = generateAstField(fieldName, field.child, field)
      const printed = printCode(ast)
      const args = getLazyContextArgs(printed)
      resultAst = builders.callExpression(builders.identifier('repeat'), [
        builders.arrowFunctionExpression(args, ast),
        builders.literal(field.repeatMin ?? 1),
        builders.literal(field.repeatMax ?? 1),
      ])
    }
    else if (field.type === 'pickRandom') {
      if (!field.pickRandomList) {
        throw new Error(`Missing pickRandomList for field ${fieldName}`)
      }
      contextProps.add('pickRandom')
      resultAst = builders.callExpression(builders.identifier('pickRandom'), [
        parseParams(field.pickRandomList),
      ])
    }
    else if (field.type === 'object') {
      if (!field.children) {
        throw new Error(`Missing children for field ${fieldName}`)
      }
      const properties = Object.keys(field.children).map((key) => {
        const childField = field.children![key]
        return builders.property('init', builders.identifier(key), generateAstField(key, childField, field))
      }) as namedTypes.Property[]
      resultAst = builders.objectExpression(properties)
    }
    else if (field.type === 'array') {
      if (!field.arrayChildren && !field.dbReferences) {
        throw new Error(`Missing arrayChildren for field ${fieldName}`)
      }

      let children = field.arrayChildren ?? []

      if (field.dbReferences?.length) {
        contextProps.add('db')

        // Keep non-getReference children
        children = children.filter(child => child.type !== 'db' || child.dbFn !== 'getReference')

        // Add getReference children from `dbReferences`
        for (const ref of field.dbReferences) {
          children.push({
            type: 'db',
            dbFn: 'getReference',
            dbResource: ref.__resourceName,
            dbParams: `'${ref.__id}'`,
            value: [ref.__id],
          })
        }
      }

      const elements = children.map(childField => generateAstField(fieldName, childField, field))
      resultAst = builders.arrayExpression(elements)
    }
    else if (field.type === 'null') {
      resultAst = builders.nullLiteral()
    }
    else if (!field.lazy) {
      resultAst = field.rawCode ? parseParams(field.rawCode) : generateAstFromValue(field.value)
    }

    if (field.lazy) {
      const printed = resultAst ? printCode(resultAst) : field.lazyBody ?? 'undefined'
      const args = getLazyContextArgs(printed)
      resultAst = builders.arrowFunctionExpression(args, resultAst ?? parseParams(field.lazyBody ?? 'undefined'))
    }

    if (!resultAst) {
      resultAst = field.rawCode ? parseParams(field.rawCode) : generateAstFromValue(field.value)
    }

    return resultAst
  }

  function generateAstReturn(objectExpressionAst: namedTypes.ObjectExpression, fields: ResourceFactoryFieldsMap) {
    for (const name in fields) {
      const field = fields[name]
      const value = generateAstField(name, field, null)

      const objectPropertyAst = objectExpressionAst.properties.find(node =>
        node.type === 'ObjectProperty' && (
          (
            node.key.type === 'Identifier' && node.key.name === name
          ) || (
            node.key.type === 'StringLiteral' && node.key.value === name
          )
        ),
      ) as namedTypes.ObjectProperty
      if (!objectPropertyAst) {
        objectExpressionAst.properties.push(builders.property('init', builders.identifier(name), value))
      }
      else {
        objectPropertyAst.value = value
      }
    }
  }

  generateAstReturn(getReturnNode(factoryBody), factory.fields)

  // Update fn context parameter
  const contextPropsArray = Array.from(contextProps).sort()
  factoryBody.params[0] = builders.objectPattern(contextPropsArray.map((prop) => {
    const property = builders.property('init', builders.identifier(prop), builders.identifier(prop))
    property.shorthand = true
    return property
  }))

  return ast
}
