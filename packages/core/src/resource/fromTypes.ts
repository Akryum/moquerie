import path from 'node:path'
import ts from 'typescript'
import type { MoquerieInstance } from '../instance.js'
import type { ResourceSchemaField, ResourceSchemaType } from '../types/resource.js'

export type PartialResourceSchemaType = Omit<ResourceSchemaType, 'nonNull' | 'array' | 'inline'>

export async function getTypesFromFile(mq: MoquerieInstance, files: string[], baseTags: string[] = []) {
  const types: PartialResourceSchemaType[] = []

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

      const tsType = checker.getTypeAtLocation(member)
      const memberSymbol = tsType.getSymbol()
      let typeName = checker.typeToString(tsType)

      const nameSymbol = checker.getSymbolAtLocation(member.name)

      // Is array
      if (memberSymbol?.name === 'Array') {
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

      const tags = ['field', ...baseTags]

      const jsDoc = nameSymbol?.getJsDocTags()
      let isDeprecated = false
      let deprecationReason: string | undefined
      if (jsDoc) {
        const deprecatedTag = jsDoc.find(t => t.name === 'deprecated')
        if (deprecatedTag) {
          isDeprecated = true
          deprecationReason = deprecatedTag.text?.map(t => t.text).join('\n')
        }
      }

      const resField: ResourceSchemaField = {
        ...type as ResourceSchemaField,
        name: fieldName,
        tags,
        description: nameSymbol?.getDocumentationComment(checker)?.find(c => c.kind === 'text')?.text ?? undefined,
        array,
        nonNull: !nullable,
        isDeprecated,
        deprecationReason,
      }

      fields[fieldName] = resField
    })

    const tags = ['object', ...baseTags]

    const typeSymbol = checker.getTypeAtLocation(node).getSymbol()

    const meta: Record<string, any> = {}

    const jsDocTags = typeSymbol?.getJsDocTags()
    let isDeprecated: boolean | undefined
    let deprecationReason: string | undefined
    if (jsDocTags) {
      for (const tag of jsDocTags) {
        meta[tag.name] = tag.text?.map(t => t.text).join('\n')

        if (tag.name === 'deprecated') {
          isDeprecated = true
          deprecationReason = tag.text?.map(t => t.text).join('\n')
        }
      }
    }

    const resType = {
      name: node.name.text,
      tags,
      description: typeSymbol?.getDocumentationComment(checker)?.find(c => c.kind === 'text')?.text ?? undefined,
      fields,
      isDeprecated,
      deprecationReason,
      meta,
    } satisfies PartialResourceSchemaType

    types.push(resType)
  }

  return {
    types,
  }
}
