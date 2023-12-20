<script lang="ts" setup>
const props = defineProps<{
  keys: string | string[]
}>()

const { metaSymbol } = useShortcuts()

const keys = computed(() => {
  const list = Array.isArray(props.keys) ? props.keys : props.keys.split('_')
  return list.map((key) => {
    const lowerCaseKey = key.toLowerCase()
    switch (lowerCaseKey) {
      case 'meta':
        return metaSymbol.value
      case 'shift':
        return '⇧'
      case 'space':
        return '␣'
      case 'enter':
        return '↵'
      case 'escape':
        return 'Esc'
      case 'delete':
        return 'Del'
      case 'pageup':
        return 'Page↑'
      case 'pagedown':
        return 'Page↓'
      case 'arrowup':
        return '↑'
      case 'arrowdown':
        return '↓'
      case 'arrowleft':
        return '←'
      case 'arrowright':
        return '→'
      default:
        if (key.length === 1) {
          return key.toUpperCase()
        }
        return key
    }
  })
})
</script>

<template>
  <span class="flex gap-0.5 leading-none">
    <UKbd
      v-for="key in keys"
      :key="key"
    >
      {{ key }}
    </UKbd>
  </span>
</template>
