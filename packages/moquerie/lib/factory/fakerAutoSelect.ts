import { splitByCase } from 'scule'

export interface AutoSelectFakerGeneratorOptions {
  name: string
  /**
   * Hint to help select the right faker generator.
   */
  type?: 'string' | 'number' | 'boolean' | 'date'
  /**
   * Available variables in the context of the generation. Used to generate `paramsCode`.
   * For example, an object resource could have other fields that could be used as params.
   */
  variables?: readonly string[]
  /**
   * Hint to help select the right faker generator. For example: 'User', 'team'
   */
  typeName?: string
}

// @TODO enum support

/**
 * Auto select a faker generator based on the name of the field or resource.
 */
export function autoSelectFakerGenerator(options: AutoSelectFakerGeneratorOptions): { factory: string, paramsCode?: string } | null {
  const { type } = options

  // We will add the type name as a prefix to help select the right faker generator
  // For example: User + name => username
  const typeName = options.typeName ? splitByCase(options.typeName).join('') : ''

  // Remove case separators such as '_' or '-'
  const name = typeName + splitByCase(options.name).join('')

  const variables = options.variables?.map(v => ({
    name: v,
    cleanName: splitByCase(v).join(''),
  }))

  /**
   * Get the first variable that match the given regex to find related variables.
   */
  function getVariableName(match: RegExp) {
    return variables?.find(({ cleanName }) => cleanName.match(match))?.name
  }

  // Date

  if (type === 'date') {
    if (name.match(/next|upcoming|soon/i)) {
      return { factory: 'date.soon' }
    }
    if (name.match(/schedule|planned|future/i)) {
      return { factory: 'date.future' }
    }
    if (name.match(/birth|past|create|old|subscribe|register|signup|remove|delete/i)) {
      return { factory: 'date.past' }
    }
    if (name.match(/previous|update|sen(d|t)|recent|login|logged/i)) {
      return { factory: 'date.recent' }
    }
    if (name.match(/ed(at|date)$/i)) { // Example: lockedAt, flaggedDate
      return { factory: 'date.past' }
    }
    return { factory: 'date.anytime' }
  }

  // Boolean

  if (type === 'boolean') {
    return { factory: 'datatype.boolean' }
  }

  // Could be a number or a string
  if (name.match(/zip(code)?/i)) {
    return { factory: 'location.zipCode' }
  }

  // Number

  if (type === 'number') {
    if (name.match(/price|cost|markup|value|pay|paid|fee|charge|tariff|fare/i)) {
      return { factory: 'commerce.price' }
    }
    if (name.match(/rate|percent|ratio/i)) {
      return { factory: 'datatype.float' }
    }
    if (name.match(/lat(itude)?/i)) {
      return { factory: 'location.latitude' }
    }
    if (name.match(/long(itude)?/i)) {
      return { factory: 'location.longitude' }
    }
    if (name.match(/duration/i)) {
      return { factory: 'number.int', paramsCode: '{ min: 5, max: 120 }' }
    }
    return { factory: 'number.int' }
  }

  // Probably a string

  if (name.match(/id/i)) {
    return { factory: 'string.uuid' }
  }
  if (name.match(/sex|gender/i)) {
    return { factory: 'person.sexType' } // We use sexType() to be able to pass it as params to firstName() and lastName()
  }
  if (name.match(/firstname/i)) {
    return { factory: 'person.firstName', paramsCode: getVariableName(/sex|gender/i) }
  }
  if (name.match(/(last|sur)name/i)) {
    return { factory: 'person.lastName', paramsCode: getVariableName(/sex|gender/i) }
  }
  if (name.match(/fullname/i)) {
    const relatedFields = {
      firstName: getVariableName(/firstname/i),
      lastName: getVariableName(/(last|sur)name/i),
      sex: getVariableName(/sex|gender/i),
    }
    return { factory: 'person.fullName', paramsCode: generateObjectParamsCode(relatedFields) }
  }
  if (name.match(/(user|nick|team)name/i)) {
    const relatedFields = {
      firstName: getVariableName(/firstname/i),
      lastName: getVariableName(/(last|sur)name/i),
    }
    return { factory: 'internet.userName', paramsCode: generateObjectParamsCode(relatedFields) }
  }
  if (name.match(/email/i)) {
    const relatedFields = {
      firstName: getVariableName(/firstname/i) ?? getVariableName(/(user|nick)name/i),
      lastName: getVariableName(/(last|sur)name/i) ?? getVariableName(/(full)?name/i),
    }
    return { factory: 'internet.email', paramsCode: generateObjectParamsCode(relatedFields) }
  }
  if (name.match(/avatar/i)) {
    return { factory: 'image.avatar' }
  }
  if (name.match(/image|picture/i)) {
    return { factory: 'image.urlPicsumPhotos' }
  }
  if (name.match(/url|website/i)) {
    return { factory: 'internet.url' }
  }
  if (name.match(/emoji/i)) {
    return { factory: 'internet.emoji' }
  }
  if (name.match(/color/i)) {
    return { factory: 'internet.color' }
  }
  if (name.match(/phone|mobile|tel/i)) {
    return { factory: 'phone.number' }
  }
  if (name.match(/(country|ctry|ctr)code/i)) {
    return { factory: 'location.countryCode' }
  }
  if (name.match(/country/i)) {
    return { factory: 'location.country' }
  }
  if (name.match(/county/i)) {
    return { factory: 'location.county' }
  }
  if (name.match(/city/i)) {
    return { factory: 'location.city' }
  }
  if (name.match(/job(title)/i)) {
    return { factory: 'person.jobTitle' }
  }
  if (name.match(/(company|org(anization))(name)?/i)) {
    return { factory: 'company.name' }
  }
  if (name.match(/mime(type)?/i)) {
    return { factory: 'system.mimeType' }
  }
  if (name.match(/(file)?path/i)) {
    return { factory: 'system.filePath' }
  }
  if (name.match(/file(name)?/i)) {
    return { factory: 'system.commonFileName' }
  }
  if (name.match(/product(name)?/i)) {
    return { factory: 'commerce.productName' }
  }
  if (name.match(/productdescription/i)) {
    return { factory: 'commerce.productDescription' }
  }

  // Low priority
  if (name.match(/title|subject|label|name/i)) {
    return { factory: 'lorem.sentence', paramsCode: '{ min: 1, max: 5 }' }
  }
  if (name.match(/text|description|content/i)) {
    return { factory: 'lorem.paragraph', paramsCode: '{ min: 1, max: 5 }' }
  }
  if (name.match(/slug/i)) {
    const related = getVariableName(/title|subject|label/i)
      ?? getVariableName(/name/i) // Lower priority
    if (related) {
      return { factory: 'helpers.slugify', paramsCode: related }
    }
    else {
      return { factory: 'lorem.slug' }
    }
  }

  // Not so many letters - low priority
  if (name.match(/ip/i)) {
    return { factory: 'internet.ip' }
  }
  if (name.match(/mac/i)) {
    return { factory: 'internet.mac' }
  }

  if (type === 'string') {
    return { factory: 'lorem.word' }
  }

  return null
}

/**
 * Generate a string of object params code, for example: `{ key1: value1, key2: value2 }`
 */
function generateObjectParamsCode(params: Record<string, any>): string | undefined {
  const validParams: { key: string, value: any }[] = []
  for (const key in params) {
    const value = params[key]
    if (value) {
      validParams.push({ key, value })
    }
  }
  if (validParams.length === 0) {
    return undefined
  }
  return `{${validParams.map(({ key, value }) => `${key}: ${value}`).join(', ')}}`
}
