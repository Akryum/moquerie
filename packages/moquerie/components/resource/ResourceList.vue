<script lang="ts" setup>
import type { ResourceSchemaType } from '~/types/resource.js'

const { data, refresh } = await useFetch('/api/resources')
onWindowFocus(refresh)

const filter = useLocalStorage('db.resources.filter', '')

const displayedTypes = computed(() => {
  if (!data.value) {
    return []
  }

  const list = Object.values(data.value.types)
  if (!filter.value) {
    return list
  }
  return list.filter((type) => {
    return type.name.toLowerCase().includes(filter.value.toLowerCase())
  })
})

// Keyboard navigation

const isHover = ref(false)
const showKeyboardNavigationHints = ref(false)

const route = useRoute()

const hoverIndex = ref(displayedTypes.value.findIndex(type => type.name === route.params.name))

watch(displayedTypes, () => {
  const index = displayedTypes.value.findIndex(type => type.name === route.params.name)
  hoverIndex.value = index === -1 ? 0 : index
})

const router = useRouter()

function openResource(resource: ResourceSchemaType | undefined) {
  if (!resource) {
    return
  }
  router.push({
    name: 'db-resources-name',
    params: {
      name: resource.name,
    },
  })
}
</script>

<template>
  <div
    class="flex flex-col h-full"
    @mouseenter="isHover = true"
    @mouseleave="isHover = false"
  >
    <div class="p-1.5">
      <UInput
        v-model="filter"
        size="xs"
        placeholder="Filter"
        icon="i-ph-magnifying-glass"
        class="w-full"
        autocomplete="off"
        autofocus
        :ui="{ icon: { trailing: { pointer: '' } } }"
        @keydown.up="hoverIndex = Math.max(hoverIndex - 1, 0)"
        @keydown.down="hoverIndex = Math.min(hoverIndex + 1, displayedTypes.length - 1)"
        @keydown.enter="openResource(displayedTypes[hoverIndex])"
        @focus="showKeyboardNavigationHints = true"
        @blur="showKeyboardNavigationHints = false"
      >
        <template #trailing>
          <UButton
            v-show="filter"
            icon="i-ph-backspace"
            color="gray"
            variant="link"
            size="xs"
            :padded="false"
            @click="filter = ''"
          />
        </template>
      </UInput>
    </div>

    <div class="flex-1 overflow-y-auto">
      <ResourceListItem
        v-for="(resource, index) of displayedTypes"
        :key="resource.name"
        :resource-type="resource"
        :hover="(showKeyboardNavigationHints || isHover) && hoverIndex === index"
        @mouseenter="hoverIndex = index"
      />
    </div>
  </div>
</template>
