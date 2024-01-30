import type { namedTypes } from 'ast-types'
import { builders } from 'ast-types'

/**
 * Transform a JS object into an AST tree representing it in JavaScript code.
 * @param object JS Object
 * @param ast If specified, this AST tree will be modified instead of creating a new one.
 */
export function generateAstFromObject(object: any, ast: namedTypes.ObjectExpression | null = null, cleanup = false): namedTypes.ObjectExpression {
  const finalAst: namedTypes.ObjectExpression = ast ?? {
    type: 'ObjectExpression',
    properties: [] as any[],
  }
  for (const key in object) {
    const value = object[key]
    const objectPropertyNode = finalAst.properties.find(node =>
      node.type === 'ObjectProperty' && (
        (
          node.key.type === 'Identifier' && node.key.name === key
        ) || (
          node.key.type === 'StringLiteral' && node.key.value === key
        )
      ),
    ) as namedTypes.ObjectProperty

    const shouldRemove = cleanup && (
      value == null
      || (Array.isArray(value) && value.length === 0)
      || (typeof value === 'object' && Object.keys(value).length === 0)
      || (typeof value === 'string' && value.length === 0)
    )

    if (shouldRemove) {
      if (objectPropertyNode) {
        finalAst.properties.splice(finalAst.properties.indexOf(objectPropertyNode), 1)
      }
    }
    else {
      if (!objectPropertyNode) {
        finalAst.properties.push(builders.property('init', builders.identifier(key), generateAstFromValue(value)))
      }
      else {
        objectPropertyNode.value = generateAstFromValue(value, objectPropertyNode.value)
      }
    }
  }
  return finalAst
}

export function generateAstFromValue(value: any, ast: any = null): namedTypes.ArrayExpression | namedTypes.Literal | namedTypes.NewExpression | namedTypes.ObjectExpression | namedTypes.Identifier {
  if (Array.isArray(value)) {
    return builders.arrayExpression(value.map(v => generateAstFromValue(v)))
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
      return generateAstFromObject(value, ast)
    }
  }
  else if (value === undefined) {
    return builders.identifier('undefined')
  }
  else {
    return builders.literal(value)
  }
}
