import type { Faker } from '@faker-js/faker'
import { get } from '../util/object.js'
import { runValueCode } from '../util/vm.js'

export interface GenerateValueFromFakerOptions {
  factory: string
  faker: Faker
  paramsCode?: string
  paramsContext?: Record<string, any>
}

export async function generateValueFromFaker(options: GenerateValueFromFakerOptions): Promise<any> {
  const factory = get(options.faker, options.factory)

  if (!factory) {
    throw new Error(`Faker factory ${options.factory} not found`)
  }

  try {
    // Evaluate params as JS code using vm
    const params = options.paramsCode ? runValueCode(options.paramsCode, options.paramsContext) : undefined

    const result = factory(params)

    return result
  }
  catch (error: any) {
    // eslint-disable-next-line no-console
    console.log(options)
    throw new Error(`Faker factory ${options.factory} failed: ${error.message}`)
  }
}
