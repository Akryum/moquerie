// @ts-nocheck
/* eslint-disable */

import vm from 'node:vm'
import util from 'node:util'
import { parse, print } from 'recast'
import babelParser from '@babel/parser'
import type { namedTypes } from 'ast-types'
import { builders } from 'ast-types'
import { type Faker, faker } from '@faker-js/faker'
import type { DBLocation } from '../types/db.js'
import type { ResourceFactoryPrompt } from '../types/factory.js'
import { storageVersion } from '../storage/storage.js'
import { generateAstFromObject, generateAstFromValue } from '../ast/objectToAst.js'
import type { QueryManagerProxy } from '../resource/queryManagerProxy.js'
import { getResolvedContext } from '../context.js'
import { getReturnNode } from '../ast/fn.js'
import { getFaker } from './fakerGet.js'

function parseCode(code: string) {
  return parse(code, {
    parser: babelParser,
  })
}

const factoryCode = `export const version = "0.0.1";

export default defineFactory({
  "id": "CTtD5t3BBiSeP5X9lOJFU",
  "createdAt": new Date(1702480121366),
  "lastUsedAt": null,
  "name": "User factory",
  "location": "local",
  "description": "",
  "tags": [
    'hello'
  ],
  "resourceName": "User",
  "createPrompts": [],
  "fakerSeed": "",
  "applyTags": [],
  "applyComment": ""
}, ({ faker, db, repeat }) => {
  return {
    id: faker.string.uuid(),
    name: faker.internet.userName(),
    email: (item) => faker.internet.email({ lastName: item.name }),
    avatarUrl: faker.image.avatar(),
    messages: [
      db.Message.pickOneRandom(),
    ],
    meow: [1, 2, 3],
    meow2: repeat(() => faker.number.int(100), 1, 5),
    inlineAvatar: {
      url: faker.image.avatar(),
    },
  }
});
`

interface FactoryInfo {
  id: string
  name: string
  location: DBLocation
  tags: readonly string[]
  description?: string
  createdAt: Date
  lastUsedAt: Date | null
  resourceName: string
  createPrompts: ResourceFactoryPrompt[]
  /**
   * If defined, result will be the same each time.
   */
  fakerSeed?: string | number
  fakerLocale?: string
  /**
   * Tags added to the instance.
   */
  applyTags: string[]
  /**
   * Comment set to the instance.
   */
  applyComment?: string
}

type FactoryObjectFields = Record<string, FactoryField>

interface FactoryField {
  type: 'faker' | 'db' | 'object' | 'repeat' | 'other'
  /**
   * Should be called after the other props are created to reuse them.
   */
  lazy: boolean
  rawCode: string
  fakerFn?: string
  fakerParams?: string
  dbResource?: string
  dbFn?: string
  dbParams?: string
  repeatMin?: number
  repeatMax?: number
  value?: any
  child?: FactoryField
  children?: FactoryObjectFields
  array?: boolean
}

interface Factory {
  info: FactoryInfo
  fields: FactoryObjectFields
  ast?: any
}

async function deserializeFactory(code: string): Promise<Factory> {
  const ast = parseCode(code)

  const defaultExport = ast.program.body.find((node: any) => node.type === 'ExportDefaultDeclaration')

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
  const factoryInfosCode = print(factoryInfosAst).code

  const factoryInfo = vm.runInNewContext(`(${factoryInfosCode})`)

  const factoryBody = declaration.arguments[1]

  const factoryBodyReturn = getReturnNode(factoryBody)

  if (factoryBodyReturn.type !== 'ObjectExpression') {
    throw new Error('Unexpected factory body return type')
  }

  const isResourceField = true

  function getFactoryFieldFromAst(propAst: any): FactoryField {
    const rawCode = print(propAst.value).code
    let type: FactoryField['type'] = 'other'
    let fakerFn: FactoryField['fakerFn'] | undefined
    let fakerParams: FactoryField['fakerParams'] | undefined
    let dbResource: FactoryField['dbResource'] | undefined
    let dbFn: FactoryField['dbFn'] | undefined
    let dbParams: FactoryField['dbParams'] | undefined
    let repeatMin: FactoryField['repeatMin'] | undefined
    let repeatMax: FactoryField['repeatMax'] | undefined
    let value: FactoryField['value'] | undefined
    let child: FactoryField['child'] | undefined
    let children: FactoryField['children'] | undefined
    let lazy = false

    if (propAst.type === 'ObjectProperty') {
      lazy = propAst.value.type === 'ArrowFunctionExpression' || propAst.value.type === 'FunctionExpression'
      if (lazy) {
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
              type = 'faker'

              // Faker fn name
              const objectProperty = object.property
              if (objectProperty.type === 'Identifier') {
                const property = callee.property
                if (callee.property.type === 'Identifier') {
                  fakerFn = `${objectProperty.name}.${property.name}`
                }
              }

              // Faker params
              if (propAst.arguments.length > 0) {
                fakerParams = print(propAst.arguments[0]).code
              }
            }
            else if (objectObject.name === 'db') {
              type = 'db'

              // DB resource name
              const objectProperty = object.property
              if (objectProperty.type === 'Identifier') {
                dbResource = objectProperty.name
              }

              // Function name
              const property = callee.property
              if (property.type === 'Identifier') {
                dbFn = property.name
              }

              // Params
              if (propAst.arguments.length > 0) {
                dbParams = print(propAst.arguments[0]).code
              }
            }
          }
        }
      }
      else if (callee.type === 'Identifier') {
        if (callee.name === 'repeat') {
          type = 'repeat'
          const [arrowFnAst, minAst, maxAst] = propAst.arguments
          const childAst = getReturnNode(arrowFnAst)
          child = getFactoryFieldFromAst(childAst)
          repeatMin = minAst.value
          repeatMax = maxAst.value
        }
      }
    }
    else if (propAst.type === 'ObjectExpression') {
      if (isResourceField) {
        type = 'object'
      }
      children = processReturnObject(propAst)
    }
    else if ('value' in propAst) {
      value = propAst.value
    }

    return {
      type,
      rawCode,
      lazy,
      fakerFn,
      fakerParams,
      dbResource,
      dbFn,
      dbParams,
      repeatMin,
      repeatMax,
      value,
      child,
      children,
    }
  }

  function processReturnObject(node: any) {
    const result: FactoryObjectFields = {}

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

const factory = await deserializeFactory(factoryCode)

console.log(util.inspect(factory.fields, true, null, true))

// Create

// const newFactory: Factory = {
//   ast: null,
//   info: {
//     id: 'CTtD5t3BBiSeP5X9lOJFU',
//     createdAt: new Date(1702480121366),
//     lastUsedAt: null,
//     name: 'User factory',
//     location: 'local',
//     description: '',
//     tags: [
//       'hello',
//     ],
//     resourceName: 'User',
//     createPrompts: [],
//     fakerSeed: '',
//     applyTags: [],
//     applyComment: '',
//   },
//   fields: {
//     id: {
//       type: 'faker',
//       rawCode: 'faker.string.uuid()',
//       lazy: false,
//       fakerFn: 'string.uuid',
//       fakerParams: undefined,
//       dbResource: undefined,
//       dbFn: undefined,
//       dbParams: undefined,
//       value: undefined,
//       child: undefined,
//     },
//     name: {
//       type: 'faker',
//       rawCode: 'faker.internet.userName()',
//       lazy: false,
//       fakerFn: 'internet.userName',
//       fakerParams: undefined,
//       dbResource: undefined,
//       dbFn: undefined,
//       dbParams: undefined,
//       value: undefined,
//       child: undefined,
//     },
//     email: {
//       type: 'faker',
//       rawCode: '(item) => faker.internet.email({ lastName: item.name })',
//       lazy: true,
//       fakerFn: 'internet.email',
//       fakerParams: '{ lastName: item.name }',
//       dbResource: undefined,
//       dbFn: undefined,
//       dbParams: undefined,
//       value: undefined,
//       child: undefined,
//     },
//     avatarUrl: {
//       type: 'faker',
//       rawCode: 'faker.image.avatar()',
//       lazy: false,
//       fakerFn: 'image.avatar',
//       fakerParams: undefined,
//       dbResource: undefined,
//       dbFn: undefined,
//       dbParams: undefined,
//       value: undefined,
//       child: undefined,
//     },
//     messages: {
//       type: 'db',
//       rawCode: 'db.Message.pickRandom()',
//       lazy: false,
//       fakerFn: undefined,
//       fakerParams: undefined,
//       dbResource: 'Message',
//       dbFn: 'pickRandom',
//       dbParams: undefined,
//       value: undefined,
//       child: undefined,
//     },
//     meow: {
//       type: 'other',
//       rawCode: '[1, 2, 3]',
//       lazy: false,
//       fakerFn: undefined,
//       fakerParams: undefined,
//       dbResource: undefined,
//       dbFn: undefined,
//       dbParams: undefined,
//       value: undefined,
//       child: undefined,
//     },
//     inlineAvatar: {
//       type: 'resource-new',
//       rawCode: '{\n  url: faker.image.avatar(),\n}',
//       lazy: false,
//       fakerFn: undefined,
//       fakerParams: undefined,
//       dbResource: undefined,
//       dbFn: undefined,
//       dbParams: undefined,
//       value: undefined,
//       child: {
//         url: {
//           type: 'faker',
//           rawCode: 'faker.image.avatar()',
//           lazy: false,
//           fakerFn: 'image.avatar',
//           fakerParams: undefined,
//           dbResource: undefined,
//           dbFn: undefined,
//           dbParams: undefined,
//           value: undefined,
//           child: undefined,
//         },
//       },
//     },
//   },
// }

async function serializeFactory(factory: Factory) {
  const ast = factory.ast ?? parseCode(`export const version = '${storageVersion}'

export default defineFactory({}, () => ({}))`)

  const defaultExport = ast.program.body.find((node: any) => node.type === 'ExportDefaultDeclaration')

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

  generateAstFromObject(factory.info, factoryInfosAst, true)

  const factoryBody = declaration.arguments[1]

  const contextProps: string[] = []

  function parseParams(paramsCode: string) {
    const ast = parse(`fn(${paramsCode})`)
    return ast.program.body[0].expression.arguments[0]
  }

  function generateAstField(fieldName: string, field: FactoryField): namedTypes.CallExpression | namedTypes.ObjectExpression | namedTypes.Identifier | namedTypes.Literal | namedTypes.ArrayExpression | namedTypes.ArrowFunctionExpression {
    let resultAst
    if (field.type === 'faker') {
      contextProps.push('faker')
      if (!field.fakerFn) {
        throw new Error(`Missing fakerFn for field ${fieldName}`)
      }
      const [cat, fn] = field.fakerFn.split('.')
      const fnIdentifierAst = builders.memberExpression(builders.memberExpression(builders.identifier('faker'), builders.identifier(cat)), builders.identifier(fn))
      resultAst = builders.callExpression(fnIdentifierAst, field.fakerParams ? [parseParams(field.fakerParams)] : [])
    }
    else if (field.type === 'db') {
      if (!field.dbFn) {
        throw new Error(`Missing dbFn for field ${fieldName}`)
      }
      if (!field.dbResource) {
        throw new Error(`Missing dbResource for field ${fieldName}`)
      }
      const fnIdentifierAst = builders.memberExpression(builders.memberExpression(builders.identifier('db'), builders.identifier(field.dbResource)), builders.identifier(field.dbFn))
      resultAst = builders.callExpression(fnIdentifierAst, field.dbParams ? parseParams(field.dbParams) : [])
    }
    else if (field.type === 'repeat') {
      if (!field.child) {
        throw new Error(`Missing child for field ${fieldName}`)
      }
      resultAst = builders.callExpression(builders.identifier('repeat'), [
        builders.arrowFunctionExpression([builders.identifier('item')], generateAstField(fieldName, field.child)),
        builders.literal(field.repeatMin ?? 1),
        builders.literal(field.repeatMax ?? 1),
      ])
    }
    else if (field.type === 'object') {
      if (!field.children) {
        throw new Error(`Missing children for field ${fieldName}`)
      }
      const properties = Object.keys(field.children).map((key) => {
        const childField = field.children![key]
        return builders.property('init', builders.identifier(key), generateAstField(key, childField))
      }) as namedTypes.Property[]
      resultAst = builders.objectExpression(properties)
    }
    else {
      resultAst = field.rawCode ? parseParams(field.rawCode) : generateAstFromValue(field.value)
    }

    if (field.lazy) {
      resultAst = builders.arrowFunctionExpression([builders.identifier('item')], resultAst)
    }
    // console.log(fieldName, field, resultAst.type, print(resultAst).code)
    return resultAst
  }

  function generateAstReturn(objectExpressionAst: namedTypes.ObjectExpression, fields: FactoryObjectFields) {
    for (const name in fields) {
      const field = fields[name]
      const value = generateAstField(name, field)

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

  return ast
}

console.log(print(await serializeFactory(factory)).code)

function removeRawCodeFromFields(fields: FactoryObjectFields) {
  for (const child of Object.values(fields)) {
    removeRawCodeFromField(child)
  }
}

function removeRawCodeFromField(field: FactoryField) {
  if (field.type === 'other') {
    return
  }
  field.rawCode = ''
  if (field.child) {
    removeRawCodeFromField(field.child)
  }
  if (field.children) {
    removeRawCodeFromFields(field.children)
  }
}

removeRawCodeFromFields(factory.fields)

console.log(print(await serializeFactory({
  ...factory,
  ast: null,
})).code)

function repeat<T>(item: any, fn: (item: any) => T, min: number, max: number) {
  const list: T[] = []
  const number = faker.number.int({
    min,
    max,
  })
  for (let i = 0; i < number; i++) {
    list.push(fn(item))
  }
  return list
}

interface FactoryContext {
  faker: Faker
  db: QueryManagerProxy
  repeat: (fn: (item: any) => any, min: number, max: number) => any
}

async function executeFactory(factory: Factory, fn: (context: FactoryContext) => any) {
  const ctx = await getResolvedContext()

  const result: Record<string, any> = {}

  const factoryContext: FactoryContext = {
    faker: await getFaker({
      locale: factory.info.fakerLocale,
      seed: factory.info.fakerSeed,
    }),
    db: ctx.db,
    repeat: repeat.bind(null, result),
  }

  const rawResult = fn(factoryContext)
  const tasks: Array<[key: string, task: (item: any) => Promise<any>]> = []
  for (const key in rawResult) {
    const value = rawResult[key]
    if (typeof value?.then === 'function') {
      tasks.unshift([key, async () => await value])
    }
    else if (typeof value === 'function') {
      tasks.push([key, value])
    }
    else {
      result[key] = value
    }
  }
  for (const [key, task] of tasks) {
    const value = await task(result)
    if (typeof value === 'function') {
      tasks.push(value)
    }
    else {
      result[key] = value
    }
  }

  return result
}

{
  const ast = await serializeFactory(factory)
  let code = print(ast).code
  code = code.replace(/export default /g, '_exports.default = ')
  code = code.replace(/export (const )?/g, '_exports.')
  const _exports: any = {}
  vm.runInNewContext(code, {
    _exports,
    defineFactory: (info, fn) => ({
      info,
      fn,
    }),
  })
  console.log(await executeFactory(factory, _exports.default.fn))
}
