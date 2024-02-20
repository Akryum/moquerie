import path from 'node:path'
import ts from 'typescript'
import type { MoquerieInstance } from '../instance.js'
import type { ResourceSchemaField, ResourceSchemaType } from '../types/resource.js'

export async function getTypesFromFile(mq: MoquerieInstance, files: string[]) {
  const types: ResourceSchemaType[] = []

  const program = ts.createProgram(files.map(f => path.resolve(mq.data.cwd, f)), {})
  const checker = program.getTypeChecker()

  const typeNodes: ts.InterfaceDeclaration[] = []
  const interfaceNames = new Set<string>()

  function visit(node: ts.Node) {
    if (ts.isInterfaceDeclaration(node)) {
      typeNodes.push(node)
      interfaceNames.add(node.name.text)
    }
    ts.forEachChild(node, visit)
  }

  for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.isDeclarationFile) {
      ts.forEachChild(sourceFile, visit)
    }
  }

  for (const node of typeNodes) {
    const fields: Record<string, ResourceSchemaField> = {}

    let inline = true

    node.members.forEach((member) => {
      const fieldName = member.name?.getText()
      if (!fieldName) {
        return
      }

      if (!ts.isPropertySignature(member) || !member.type) {
        return
      }

      let array = false
      let nullable = false
      let type: Partial<ResourceSchemaField> = {}

      let typeName = checker.typeToString(checker.getTypeAtLocation(member))

      const tsType = checker.getTypeAtLocation(member)
      // Is array
      if (tsType.symbol?.name === 'Array') {
        const [elementType] = checker.getTypeArguments(tsType as ts.TypeReference)
        array = true
        typeName = checker.typeToString(elementType)
      }

      // Is nullable
      if (member.questionToken) {
        nullable = true
      }
      else if (ts.isUnionTypeNode(member.type)) {
        const unionTypes = member.type.types.map(t => t.getText())
        if (unionTypes.includes('null') || unionTypes.includes('undefined')) {
          nullable = true
        }
      }

      if (interfaceNames.has(typeName)) {
        type = {
          type: 'resource',
          resourceName: typeName,
        }
      }
      else if (typeName === 'string') {
        type.type = 'string'
      }
      else if (typeName === 'number') {
        type.type = 'number'
      }
      else if (typeName === 'boolean') {
        type.type = 'boolean'
      }
      else if (typeName === 'Date') {
        type.type = 'date'
      }
      else {
        type.type = 'any'
      }

      const tags = ['rest', 'field']

      if (['id', '_id'].includes(fieldName)) {
        inline = false
      }

      const resField: ResourceSchemaField = {
        ...type as ResourceSchemaField,
        name: fieldName,
        tags,
        description: undefined,
        array,
        nonNull: !nullable,
        isDeprecated: false,
        deprecationReason: undefined,
      }

      fields[fieldName] = resField
    })

    const tags = ['rest', 'object']

    // Sort fields
    const sortedFields = Object.values(fields).sort((a, b) => a.name.localeCompare(b.name))
    const sortedFieldsMap: Record<string, ResourceSchemaField> = {}
    for (const field of sortedFields) {
      sortedFieldsMap[field.name] = field
    }

    const resType = {
      name: node.name.text,
      tags,
      description: undefined, // @TODO
      array: true,
      fields: sortedFieldsMap,
      nonNull: false,
      isDeprecated: false,
      inline,
    } satisfies ResourceSchemaType

    types.push(resType)
  }

  return {
    types,
  }
}
