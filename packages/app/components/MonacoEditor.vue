<script lang="ts">
import './monaco.js'
</script>

<script lang="ts" setup>
import * as monaco from 'monaco-editor'

const props = defineProps<{
  filename: string
  source: string
  options?: monaco.editor.IStandaloneEditorConstructionOptions
  wrapCode?: {
    start: string
    end: string
    visible?: boolean
  }
}>()

const emit = defineEmits<{
  'update:source': [source: string]
  'setup': [editor: monaco.editor.IStandaloneCodeEditor]
}>()

const colorMode = useColorMode()
monaco.editor.setTheme(colorMode.value === 'dark' ? 'custom-dark-theme' : 'vs-light')

watch(() => colorMode.value, (val) => {
  monaco.editor.setTheme(val === 'dark' ? 'custom-dark-theme' : 'vs-light')
})

const el = ref()

onMounted(() => {
  function getWrappedSource() {
    let val = props.source
    if (props.wrapCode) {
      val = `${props.wrapCode.start}\n${val}\n${props.wrapCode.end}`
    }
    return val
  }

  const uri = monaco.Uri.parse(`file:///${props.filename}`)

  // Clear models with same URI
  monaco.editor.getModels().filter(m => m.uri.fsPath === uri.fsPath).forEach(m => m.dispose())

  const model = monaco.editor.createModel(getWrappedSource(), props.options?.language ?? 'typescript', uri)

  const editor = monaco.editor.create(el.value, {
    minimap: {
      enabled: false,
    },
    automaticLayout: true,
    contextmenu: false,
    tabSize: 2,
    ...props.options,
    model,
  })

  // // Handle inside a modal with transition

  // setTimeout(() => {
  //   editor.layout()
  // }, 1000)

  // Hidden areas

  const wrapCodeLines = computed(() => props.wrapCode
    ? ({
        start: props.wrapCode.start.split('\n').length,
        end: props.wrapCode.end.split('\n').length,
      })
    : null)

  function updateHiddenAreas() {
    if (!props.wrapCode || props.wrapCode.visible) {
      return
    }
    const lineCount = model.getLineCount()
    const { start, end } = wrapCodeLines.value!
    const areas = []
    if (start > 0) {
      areas.push({
        startLineNumber: 1,
        endLineNumber: start,
      })
    }
    if (end > 0) {
      areas.push({
        startLineNumber: lineCount - end + 1,
        endLineNumber: lineCount,
      })
    }
    // @ts-expect-error private API
    editor.setHiddenAreas([]) // Reset to force update
    // @ts-expect-error private API
    editor.setHiddenAreas(areas)
  }

  updateHiddenAreas()

  // We prevent selecting the wrapping code
  // by overriding the selection
  editor.onDidChangeCursorSelection((e) => {
    if (!props.wrapCode) {
      return
    }
    const { start, end } = wrapCodeLines.value!
    const lineCount = model.getLineCount()
    let selection = {
      startLineNumber: e.selection.startLineNumber,
      endLineNumber: e.selection.endLineNumber,
      startColumn: e.selection.startColumn,
      endColumn: e.selection.endColumn,
    }
    let changed = false
    if (selection.startLineNumber <= start) {
      selection = {
        ...selection,
        startLineNumber: start + 1,
      }
      if (selection.endLineNumber < selection.startLineNumber) {
        selection.endLineNumber = selection.startLineNumber
      }
      changed = true
    }
    if (selection.endLineNumber >= lineCount - end + 1) {
      selection = {
        ...selection,
        endLineNumber: lineCount - end,
        endColumn: model.getLineLength(lineCount - end) + 1,
      }
      if (selection.startLineNumber > selection.endLineNumber) {
        selection.startLineNumber = selection.endLineNumber
      }
      changed = true
    }
    if (changed) {
      editor.setSelection(selection)
    }
    updateHiddenAreas()
  })

  // On wrap code update
  watch(() => props.wrapCode, () => {
    updateModelSource()
  }, {
    deep: true,
  })

  // Handle source

  function updateModelSource() {
    const val = getWrappedSource()
    if (val !== editor.getValue()) {
      editor.setValue(val)
      updateHiddenAreas()
    }
  }

  watch(() => props.source, () => {
    updateModelSource()
  })

  editor.onDidChangeModelContent(() => {
    updateHiddenAreas()
    let value = editor.getValue()
    if (props.wrapCode) {
      const lines = value.split('\n')
      const { start, end } = wrapCodeLines.value!
      value = lines.slice(start, lines.length - end).join('\n')
    }
    if (props.source !== value) {
      emit('update:source', value)
    }
  })

  // Options

  watch(() => props.options, (val) => {
    if (val) {
      editor.updateOptions(val)
      updateHiddenAreas()
    }
  }, {
    deep: true,
  })

  // Dispose

  onBeforeUnmount(() => {
    editor.dispose()
    model.dispose()
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
