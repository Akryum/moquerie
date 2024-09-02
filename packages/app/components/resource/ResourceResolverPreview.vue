<script lang="ts" setup>
import type { ResourceSchemaField } from '@moquerie/core'

const props = defineProps<{
  resourceName: string
  instanceId: string
  field: ResourceSchemaField
}>()

const { data, refresh } = await useFetch(`/api/resolvers/preview`, {
  method: 'POST',
  body: {
    resourceName: props.resourceName,
    instanceId: props.instanceId,
    fieldName: props.field.name,
  },
})
onWindowFocus(refresh)

function type() {
  if (props.field.type === 'any' && props.field.originalTypeName?.toLowerCase() === 'json') {
    return 'json'
  }
  return props.field.type
}
</script>

<template>
  <ValuePreview
    :value="data"
    :type="type()"
  />
</template>
