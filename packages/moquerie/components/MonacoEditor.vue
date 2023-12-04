<script lang="ts">
import * as monaco from 'monaco-editor'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import GraphQLWorker from 'monaco-graphql/esm/graphql.worker?worker'
import configTypes from '~/types/config.js?raw'

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
    'editor.background': '#1f2937',
    'editorLineNumber.foreground': '#6b7280',
    'editorLineNumber.activeForeground': '#d1d5db',
    'scrollbarSlider.background': '#4b5563',
    'scrollbarSlider.hoverBackground': '#9f1239',
  },
})

const colorMode = useColorMode()
monaco.editor.setTheme(colorMode.value === 'dark' ? 'custom-dark-theme' : 'vs-light')

watch(() => colorMode.value, (val) => {
  monaco.editor.setTheme(val === 'dark' ? 'custom-dark-theme' : 'vs-light')
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
monaco.editor.createModel(embeddedTypes, 'typescript', monaco.Uri.parse('file:///node_modules/moquerie/index.d.ts'))
</script>

<script lang="ts" setup>
const props = defineProps<{
  filename: string
  source: string
  options: monaco.editor.IStandaloneEditorConstructionOptions
}>()

const emit = defineEmits<{
  'update:source': [source: string]
}>()

const el = ref()

onMounted(() => {
  const model = monaco.editor.createModel(props.source, props.options.language ?? 'typescript', monaco.Uri.parse(`file:///${props.filename}`))

  const editor = monaco.editor.create(el.value, {
    minimap: {
      enabled: false,
    },
    ...props.options,
    model,
  })

  // Disable command palette
  editor.addCommand(monaco.KeyCode.F1, () => {
    // Do nothing
  })

  // Handle source

  watch(() => props.source, (val) => {
    if (val !== editor.getValue()) {
      editor.setValue(val)
    }
  })

  editor.onDidChangeModelContent(() => {
    emit('update:source', editor.getValue())
  })

  // Options

  watch(() => props.options, (val) => {
    editor.updateOptions(val)
  }, {
    deep: true,
  })

  // Auto resize

  useResizeObserver(el, () => {
    editor.layout()
  })

  // Dispose

  onBeforeUnmount(() => {
    editor.dispose()
    model.dispose()
  })
})
</script>

<template>
  <div ref="el" />
</template>
