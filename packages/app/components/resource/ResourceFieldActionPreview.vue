<script lang="ts" setup>
import type { ResourceSchemaField } from '@moquerie/core'

const props = defineProps<{
  resourceName: string
  instanceId: string
  field: ResourceSchemaField
}>()

const { data, refresh } = await useFetch(`/api/fieldActions/preview`, {
  method: 'POST',
  body: {
    resourceName: props.resourceName,
    instanceId: props.instanceId,
    fieldName: props.field.name,
  },
})
onWindowFocus(refresh)
</script>

<template>
  <ValuePreview
    :value="data"
    :type="field.type"
  />
</template>
