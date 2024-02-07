import type { MoquerieInstance } from '../instance.js'

export interface GetFakerOptions {
  locale?: string
  seed?: any
}

export async function getFaker(mq: MoquerieInstance, options: GetFakerOptions = {}) {
  const ctx = await mq.getContext()

  const allFakers = await import('@faker-js/faker')

  // @ts-expect-error no index defined
  const locale = allFakers[options.locale ?? ctx.config.defaultFakerLocale ?? 'en']

  const faker = new allFakers.Faker({
    locale,
  })

  if (options.seed) {
    faker.seed(options.seed)
  }

  return faker
}
