import type { namedTypes } from 'ast-types'
import { builders } from 'ast-types'

export function generateAstFromObject(object: any): namedTypes.ObjectExpression {
  const ast: namedTypes.ObjectExpression = {
    type: 'ObjectExpression',
    properties: [] as any[],
  }
  for (const key in object) {
    const value = object[key]
    ast.properties.push(builders.property('init', builders.identifier(key), generateAstFromValue(value)))
  }
  return ast
}

export function generateAstFromValue(value: any): namedTypes.ArrayExpression | namedTypes.Literal | namedTypes.NewExpression | namedTypes.ObjectExpression {
  if (Array.isArray(value)) {
    return builders.arrayExpression(value.map(generateAstFromValue))
  }
  else if (typeof value === 'object') {
    if (value === null) {
      return builders.literal(null)
    }
    // Is date
    else if (value instanceof Date) {
      return builders.newExpression(builders.identifier('Date'), [
        builders.literal(value.toISOString()),
      ])
    }
    // Is RegExp
    else if (value instanceof RegExp) {
      return builders.literal(value)
    }
    // @TODO handle more types
    else {
      return generateAstFromObject(value)
    }
  }
  else {
    return builders.literal(value)
  }
}
