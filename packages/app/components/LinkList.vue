<script lang="ts" setup generic="TItem = any">
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { vTooltip } from 'floating-vue'

const props = defineProps<{
  id?: string
  items: TItem[]
  filter: (item: TItem, filterValue: string) => boolean
  selectedItem: (item: TItem, route: RouteLocationNormalizedLoaded) => boolean
  filterPlaceholder?: string
  ui?: {
    input?: any
  }
}>()

const emit = defineEmits<{
  select: [item: TItem]
  focusFilter: [focused: boolean]
}>()

const filter = props.id ? useLocalStorage(`link-list.${props.id}.filter`, '') : ref('')

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

function selectItem(item: TItem | undefined) {
  if (!item) {
    return
  }
  emit('select', item)
}

// Focus

const filterInput = ref<any | null>(null)

function focusFilterInput() {
  filterInput.value?.input.focus()
  filterInput.value?.input.select()
}

defineExpose({
  focusFilterInput,
  filter,
})

// Enter

function onKeyEnter(event: MouseEvent) {
  if (event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) {
    return
  }
  selectItem(displayedItems.value[hoverIndex.value])
}
</script>

<template>
  <div
    class="flex flex-col h-full"
    @mouseenter="isHover = true"
    @mouseleave="isHover = false"
  >
    <div class="mb-0.5 flex flex-col gap-1">
      <slot name="toolbar" />

      <UInput
        ref="filterInput"
        v-model="filter"
        v-tooltip="filterPlaceholder"
        size="xs"
        :placeholder="filterPlaceholder ?? 'Filter...'"
        icon="i-ph-magnifying-glass"
        class="w-full"
        autocomplete="off"
        autofocus
        :ui="{ trailing: { padding: { xs: 'pe-4' } }, icon: { trailing: { pointer: '' } }, ...ui?.input }"
        @keydown.up="hoverIndex = Math.max(hoverIndex - 1, 0)"
        @keydown.down="hoverIndex = Math.min(hoverIndex + 1, displayedItems.length - 1)"
        @keydown.enter="onKeyEnter"
        @focus="showKeyboardNavigationHints = true; $emit('focusFilter', true)"
        @blur="showKeyboardNavigationHints = false; $emit('focusFilter', false)"
      >
        <template #trailing>
          <slot name="trailing">
            <span />
          </slot>
        </template>
      </UInput>
    </div>

    <slot name="before-items" :filter="filter" />

    <div class="flex-1 overflow-y-auto">
      <template
        v-for="(item, index) of displayedItems"
        :key="index"
      >
        <slot
          :item="item"
          :hover="(showKeyboardNavigationHints || isHover) && hoverIndex === index"
          :show-shortcut="showKeyboardNavigationHints && hoverIndex === index"
          :selected="selectedItem(item, route)"
          @mouseenter="hoverIndex = index"
        />
      </template>

      <template v-if="!displayedItems.length">
        <slot v-if="!filter" name="empty" />

        <slot v-else name="no-results">
          <div class="p-4 text-center opacity-50 text-sm">
            No results
          </div>
        </slot>
      </template>
    </div>
  </div>
</template>
