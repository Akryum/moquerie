<script lang="ts" setup>
import type { ScriptLogItem } from '@moquerie/core'

const props = defineProps<{
  log: ScriptLogItem
}>()

const icons: Record<ScriptLogItem['type'], string> = {
  db: 'i-ph-database',
  faker: 'i-ph-dice-three',
  repeat: 'i-ph-repeat',
  pickRandom: 'i-ph-hand-tap',
  generateId: 'i-ph-text-aa',
  generateResource: 'i-ph-factory',
  pubsub: 'i-ph-broadcast',
}

const typeLabels: Record<ScriptLogItem['type'], string> = {
  db: 'db.',
  faker: 'faker.',
  pubsub: 'pubsub.',
  repeat: 'repeat',
  pickRandom: 'pickRandom',
  generateId: 'Generated ID ',
  generateResource: `Generated ${props.log.data?.resourceName ?? ''} using factory `,
}

const params = computed<string>(() => {
  if (!props.log.data?.params) {
    return ''
  }

  let list = props.log.data.params

  const lastNullIndex = props.log.data.params.findLastIndex((p: any) => p == null)
  if (lastNullIndex !== -1) {
    list = list.slice(0, lastNullIndex)
  }

  list = list.map((p: any) => {
    if (p?.__fn) {
      return p.__fn
    }
    return JSON.stringify(p, null, 2)
  })
  return list.join(', ')
})
</script>

<template>
  <div class="flex items-center gap-2 font-mono text-sm">
    <UIcon :name="icons[log.type]" class="w-4 h-4 flex-none" />
    <div>
      <span class="opacity-50">{{ typeLabels[log.type] }}</span>
      <span>{{ log.label }}</span>
    </div>

    <div v-if="log.data?.params" class="opacity-50 flex-1 w-0 truncate">
      ({{ params }})
    </div>
  </div>
</template>
