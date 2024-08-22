<script lang="ts">
import './monaco.js'
</script>

<script lang="ts" setup>
import * as monaco from 'monaco-editor'

const props = defineProps<{
  filename: string
  from: string
  to: string
  language?: string
  options?: monaco.editor.IDiffEditorConstructionOptions
}>()

const emit = defineEmits<{
  setup: [editor: monaco.editor.IDiffEditor]
}>()

const colorMode = useColorMode()
monaco.editor.setTheme(colorMode.value === 'dark' ? 'custom-dark-theme' : 'vs-light')

watch(() => colorMode.value, (val) => {
  monaco.editor.setTheme(val === 'dark' ? 'custom-dark-theme' : 'vs-light')
})

const el = ref()

onMounted(() => {
  const uriFrom = monaco.Uri.parse(`file:///diff-from/${props.filename}`)
  const uriTo = monaco.Uri.parse(`file:///diff-to/${props.filename}`)

  // Clear models with same URI
  monaco.editor.getModels().filter(m => m.uri.fsPath === uriFrom.fsPath || m.uri.fsPath === uriTo.fsPath).forEach(m => m.dispose())

  const modelFrom = monaco.editor.createModel(props.from, props.language, uriFrom)
  const modelTo = monaco.editor.createModel(props.to, props.language, uriTo)

  const editor = monaco.editor.createDiffEditor(el.value, {
    minimap: {
      enabled: false,
    },
    automaticLayout: true,
    contextmenu: false,
    readOnly: true,
    hideUnchangedRegions: {
      enabled: true,
    },
    ...props.options,
  })

  editor.setModel({
    original: modelFrom,
    modified: modelTo,
  })

  // // Handle inside a modal with transition

  // setTimeout(() => {
  //   editor.layout()
  // }, 1000)

  // Handle source

  watch(() => props.from, (value) => {
    modelFrom.setValue(value)
  })

  watch(() => props.to, (value) => {
    modelTo.setValue(value)
  })

  // Options

  watch(() => props.options, (val) => {
    if (val) {
      editor.updateOptions(val)
    }
  }, {
    deep: true,
  })

  // Dispose

  onBeforeUnmount(() => {
    editor.dispose()
    modelFrom.dispose()
    modelTo.dispose()
  })

  emit('setup', editor)
})
</script>

<template>
  <!-- Never use intrinsic size of monaco editor -->
  <div style="contain: size;">
    <div ref="el" class="h-full" />
  </div>
</template>
