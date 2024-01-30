// @ts-nocheck

import vm from 'node:vm'
import util from 'node:util'
import { print } from 'recast'
import { nanoid } from 'nanoid'
import type { ResourceFactory, ResourceFactoryField, ResourceFactoryFieldsMap, ResourceFactoryPrompt } from '../types/factory.js'
import { executeFactory } from './execute.js'
import { deserializeFactory } from './deserialize.js'
import { serializeFactory } from './serialize.js'

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
}, ({ faker, db, repeat, pickRandom }) => {
  return {
    id: faker.string.uuid(),
    name: faker.internet.userName(),
    email: ({ item }) => faker.internet.email({ lastName: item.name }),
    avatarUrl: faker.image.avatar(),
    /*messages: [
      db.Message.pickOneRandom(),
    ],*/
    // messages: repeat(() => db.Message.pickOneRandom(), 1, 5),
    messages: [
      db.Message.getReference('some-message-id'),
    ],
    bestFriend: db.User.getReference('some-user-id'),
    secondBestFriend: null,
    meow: [1, 2, 3],
    meow2: repeat(() => faker.number.int(100), 1, 5),
    meow3: [faker.number.int(100)],
    inlineAvatar: {
      url: faker.image.avatar(),
    },
    type: pickRandom(['a', 'b', 'c']),
    nestedInline: {
      id: faker.string.uuid(),
      user: ({ rootRef }) => rootRef,
    }
  }
});
`

const factory: ResourceFactory = {
  ...await deserializeFactory(factoryCode),
  resourceName: 'User',
}

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

console.log(print(await serializeFactory(factory)).code)

function removeRawCodeFromFields(fields: ResourceFactoryFieldsMap) {
  for (const child of Object.values(fields)) {
    removeRawCodeFromField(child)
  }
}

function removeRawCodeFromField(field: ResourceFactoryField) {
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
  console.log(await executeFactory(factory, _exports.default.fn, nanoid()))
}
