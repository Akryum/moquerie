<script lang="ts" setup generic="TItem = any">
import type { RouteLocationNormalizedLoaded } from 'vue-router'

const props = defineProps<{
  id: string
  items: TItem[]
  filter: (item: TItem, filterValue: string) => boolean
  selectedItem: (item: TItem, route: RouteLocationNormalizedLoaded) => boolean
  filterPlaceholder?: string
}>()

const emit = defineEmits<{
  open: [item: TItem]
}>()

const filter = useLocalStorage(`link-list.${props.id}.filter`, '')

const displayedItems = computed(() => {
  if (!props.items) {
    return []
  }

  const list = props.items
  if (!filter.value) {
    return list
  }
  const filterValue = filter.value.toLowerCase()
  return list.filter((item) => {
    return props.filter(item, filterValue)
  })
})

// Keyboard navigation

const isHover = ref(false)
const showKeyboardNavigationHints = ref(false)

const route = useRoute()

const hoverIndex = ref(displayedItems.value.findIndex(item => props.selectedItem(item, route)))

watch(displayedItems, () => {
  const index = displayedItems.value.findIndex(item => props.selectedItem(item, route))
  hoverIndex.value = index === -1 ? 0 : index
})

function openItem(item: TItem | undefined) {
  if (!item) {
    return
  }
  emit('open', item)
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
        :placeholder="filterPlaceholder ?? 'Filter...'"
        icon="i-ph-magnifying-glass"
        class="w-full"
        autocomplete="off"
        autofocus
        :ui="{ icon: { trailing: { pointer: '' } } }"
        @keydown.up="hoverIndex = Math.max(hoverIndex - 1, 0)"
        @keydown.down="hoverIndex = Math.min(hoverIndex + 1, displayedItems.length - 1)"
        @keydown.enter="openItem(displayedItems[hoverIndex])"
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
      <template
        v-for="(item, index) of displayedItems"
        :key="index"
      >
        <slot
          :item="item"
          :hover="(showKeyboardNavigationHints || isHover) && hoverIndex === index"
          :show-shortcut="showKeyboardNavigationHints && hoverIndex === index"
          @mouseenter="hoverIndex = index"
        />
      </template>
    </div>
  </div>
</template>
