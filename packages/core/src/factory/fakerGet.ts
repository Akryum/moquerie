export interface GetFakerOptions {
  locale?: string
  seed?: any
}

export async function getFaker(options: GetFakerOptions) {
  const allFakers = await import('@faker-js/faker')

  // @ts-expect-error no index defined
  const locale = allFakers[options.locale ?? 'en']

  const faker = new allFakers.Faker({
    locale,
  })

  if (options.seed) {
    faker.seed(options.seed)
  }

  return faker
}
