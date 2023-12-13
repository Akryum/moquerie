export function createExportedVariable(name: string, raw: string) {
  return {
    type: 'ExportNamedDeclaration',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name,
        },
        init: {
          type: 'Literal',
          raw,
        },
      },
    ],
  }
}
