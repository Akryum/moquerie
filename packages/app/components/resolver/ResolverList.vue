<script lang="ts" setup>
const props = defineProps<{
  resourceName: string
}>()

const { data, refresh } = await useFetch('/api/resolvers', {
  query: {
    resourceName: props.resourceName,
    getCode: true,
  },
})
onWindowFocus(refresh)

const filter = ref('')

const resolvers = computed(() => {
  const filtered = (data.value ?? []).filter((item) => {
    return item.fieldName.toLowerCase().includes(filter.value)
  })
  return filtered.sort((a, b) => {
    return a.fieldName.localeCompare(b.fieldName)
  })
})
</script>

<template>
  <div v-if="data" class="flex flex-col">
    <div class="p-4">
      <UInput
        v-model="filter"
        placeholder="Resolvers by name..."
        icon="i-ph-magnifying-glass"
        autofocus
        class="max-w-[400px]"
      />
    </div>

    <div class="flex-1 overflow-auto">
      <ResolverListItem
        v-for="(item, index) in resolvers"
        :key="index"
        :resource-name="props.resourceName"
        :field-name="item.fieldName"
        :file="item.file"
        :code="item.code"
      />
    </div>
  </div>
</template>
