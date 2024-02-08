import { defineFactory } from 'moquerie/mocks'

export const version = '0.0.1'

export default defineFactory({
  author: {
    name: 'Guillaume Chau',
    email: 'guillaume.b.chau@gmail.com',
    avatar: 'https://avatars.githubusercontent.com/u/2798204?v=4',

    github: {
      login: 'Akryum',
      profilePageUrl: 'https://github.com/Akryum',
    },
  },

  description: 'Used in script example',
}, (
  {
    db,
    faker,
    pickRandom,
    repeat,
  },
) => ({
  archived: faker.datatype.boolean(),
  content: faker.lorem.paragraph({ min: 1, max: 5 }),
  from: db.User.pickOneRandom(),
  id: faker.string.uuid(),
  tags: repeat(() => faker.lorem.word(), 1, 3),
  to: db.User.pickOneRandom(),
  type: pickRandom(['public', 'private']),
}))
