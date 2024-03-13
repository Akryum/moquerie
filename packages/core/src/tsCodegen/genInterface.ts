import { builders } from 'ast-types'
import type { namedTypes } from 'ast-types'
import type { ResourceSchemaType } from '../types/resource.js'

export function generateTsInterfaceFromResourceType(type: ResourceSchemaType): namedTypes.TSInterfaceDeclaration {
  const interfaceDeclaration = builders.tsInterfaceDeclaration(builders.identifier(type.name), builders.tsInterfaceBody(
    Object.values(type.fields).map(field =>
      builders.tsPropertySignature(builders.identifier(field.name), builders.tsTypeAnnotation(
        field.type === 'string'
          ? builders.tsStringKeyword()
          : field.type === 'number'
            ? builders.tsNumberKeyword()
            : field.type === 'boolean'
              ? builders.tsBooleanKeyword()
              : field.type === 'date'
                ? builders.tsTypeReference(builders.identifier('Date'))
                : field.type === 'any'
                  ? builders.tsAnyKeyword()
                  : field.type === 'resource'
                    ? builders.tsTypeReference(builders.identifier(field.resourceName))
                    : field.type === 'enum'
                      ? builders.tsUnionType(
                        field.values.map(value => builders.tsLiteralType(
                          typeof value.value === 'string'
                            ? builders.stringLiteral(value.value)
                            : typeof value.value === 'number'
                              ? builders.numericLiteral(value.value)
                              : builders.booleanLiteral(value.value),
                        )),
                      )
                      : builders.tsUnknownKeyword(),
      )),
    ),
  ))
  return interfaceDeclaration
}
