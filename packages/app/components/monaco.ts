import configTypes from '@moquerie/core/src/types/config.js?raw'
import * as monaco from 'monaco-editor'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import GraphQLWorker from 'monaco-graphql/esm/graphql.worker?worker'

// Language support

// eslint-disable-next-line no-restricted-globals
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new JsonWorker()
    }

    if (label === 'typescript' || label === 'javascript') {
      return new TsWorker()
    }

    if (label === 'graphql') {
      return new GraphQLWorker()
    }

    return new EditorWorker()
  },
}

// Theme

monaco.editor.defineTheme('custom-dark-theme', {
  base: 'vs-dark',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#111827',
    'editorLineNumber.foreground': '#6b7280',
    'editorLineNumber.activeForeground': '#d1d5db',
  },
})

// Types

monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  target: monaco.languages.typescript.ScriptTarget.ESNext,
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
})

const embeddedTypes = `${configTypes}
export function defineConfig(config: Config): Config {
  return config
}`

monaco.editor.getModels().forEach(m => m.dispose())
monaco.editor.createModel(embeddedTypes, 'typescript', monaco.Uri.parse('file:///node_modules/moquerie/config.d.ts'))

// Auto-completion

monaco.languages.registerCompletionItemProvider('json', {
  provideCompletionItems(model, position) {
    const word = model.getWordUntilPosition(position)
    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn,
    }

    return {
      suggestions: [
        {
          label: 'Reference to a resource',
          documentation: 'Reference a resource instance with its resource name and instance id',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: '{ "__resourceName": "$1", "__id": "$2" }',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
      ],
    }
  },
})
