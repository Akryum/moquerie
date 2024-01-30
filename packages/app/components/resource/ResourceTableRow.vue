<script lang="ts" setup>
import { Menu, Tooltip, vTooltip } from 'floating-vue'
import type { ResourceInstance, ResourceSchemaType } from '@moquerie/core'
import type { Col } from './tableTypes.js'

const props = defineProps<{
  resourceType: ResourceSchemaType
  instance: ResourceInstance
  cols: Col[]
  selected?: boolean
  selectedIds?: string[]
  dim?: boolean
  readonly?: boolean
}>()

const scrollEl = ref<HTMLElement | null>(null)

onMounted(() => {
  watchEffect(() => {
    if (props.selected && (props.selectedIds?.length ?? 0) <= 1) {
      scrollEl.value?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  })
})

// Toggle active

const instanceStore = useResourceInstanceStore()

async function toggleActive() {
  if (props.readonly) {
    return
  }

  await instanceStore.updateInstance({
    resourceName: props.resourceType.name,
    instanceId: props.instance.id,
    data: {
      active: !props.instance.active,
    },
    refetchAll: true,
  })
}

// Open field action file

async function openFieldActionFile(col: Col) {
  if (col.fieldAction) {
    $fetch('/api/openInEditor', {
      params: {
        file: col.fieldAction.file,
      },
    })
  }
}
</script>

<template>
  <div
    class="relative [&:last-child>.scroll-el]:bottom-0 select-none min-w-max"
    :class="[
      selected
        ? 'bg-primary-100 dark:bg-primary-900'
        : 'hover:bg-gray-100 dark:hover:bg-gray-800',
    ]"
    aria-role="button"
  >
    <div
      ref="scrollEl"
      class="scroll-el absolute inset-x-0 -inset-y-10 pointer-events-none"
    />

    <div
      :class="{
        'bg-gray-500/5 dark:bg-gray-700/20': dim,
      }"
    >
      <div
        class="flex divide-x divide-gray-200 dark:divide-gray-800"
        :class="{
          grayscale: dim,
        }"
      >
        <slot name="start" />

        <!-- Active -->
        <Tooltip
          class="w-[42px] opacity-50 hover:opacity-100 flex-none"
          :class="{
            'cursor-pointer': !readonly,
          }"
          aria-role="button"
          aria-label="Toggle active"
          @click.stop="toggleActive()"
        >
          <div class="flex items-center justify-center w-full h-full">
            <UIcon
              :name="instance.active ? 'i-ph-eye' : 'i-ph-eye-slash'"
            />
          </div>

          <template #popper>
            <div>{{ instance.active ? 'Active' : 'Inactive' }}</div>
            <div v-if="!readonly" class="text-sm opacity-50">
              Click to set to {{ instance.active ? 'inactive' : 'active' }}
            </div>
          </template>
        </Tooltip>

        <!-- Comment -->
        <Tooltip
          :disabled="!instance.comment"
          class="w-[42px] opacity-50 hover:opacity-100 flex-none"
          :class="{
            'pointer-events-none': !instance.comment,
          }"
          aria-role="button"
          aria-label="See comment"
        >
          <div class="flex items-center justify-center w-full h-full">
            <UIcon
              name="i-ph-chat-dots"
              :class="{
                'opacity-20': !instance.comment,
              }"
            />
          </div>

          <template #popper>
            <div class="text-sm opacity-50">
              Comment
            </div>
            <div class="whitespace-pre-wrap max-w-[400px]" v-text="instance.comment" />
          </template>
        </Tooltip>

        <!-- Tags -->
        <Tooltip
          :disabled="!instance.tags.length"
          class="w-[42px] opacity-50 hover:opacity-100 flex-none"
          :class="{
            'pointer-events-none': !instance.tags.length,
          }"
          aria-role="button"
          aria-label="See comment"
        >
          <div class="flex items-center justify-center w-full h-full">
            <div
              class="text-xs font-mono border border-gray-500 px-1 rounded"
              :class="{
                'opacity-20': !instance.tags.length,
              }"
            >
              {{ instance.tags.length }}
            </div>
          </div>

          <template #popper>
            <div class="text-sm opacity-50">
              Tags
            </div>
            <div class="flex flex-wrap gap-1">
              <UBadge
                v-for="tag in instance.tags"
                :key="tag"
                color="gray"
              >
                {{ tag }}
              </UBadge>
            </div>
          </template>
        </Tooltip>

        <!-- Columns -->
        <div
          v-for="col in props.cols"
          :key="col.field"
          class="px-2 h-[40px] flex items-center break-all flex-none"
          :class="{
            'opacity-50': dim,
          }"
          :style="{
            width: `${col.size}px`,
          }"
        >
          <template v-if="col.fieldAction && col.fieldData">
            <Menu
              placement="top"
              :delay="500"
              :dispose-timeout="0"
              class="w-full h-full flex-none cursor-default"
            >
              <template #default="{ shown }">
                <div
                  class="w-full h-full flex"
                  :class="[
                    shown
                      ? 'text-primary-500'
                      : 'opacity-50 hover:opacity-100',
                  ]"
                >
                  <UIcon :name="shown ? 'i-ph-lightning-fill' : 'i-ph-lightning'" class="w-4 h-4 m-auto" />
                </div>
              </template>

              <template #popper>
                <div class="p-4">
                  <div class="font-mono text-gray-500">
                    {{ col.field }}
                  </div>

                  <div class="mb-2 flex items-center gap-2">
                    <div>
                      Field action
                    </div>

                    <UButton
                      v-tooltip="`Open ${col.fieldAction.file}`"
                      icon="i-ph-file-arrow-up"
                      variant="link"
                      :padded="false"
                      @click="openFieldActionFile(col)"
                    />
                  </div>

                  <div
                    v-if="instance.active"
                    class="flex mt-4"
                  >
                    <ResourceFieldActionPreview
                      :resource-name="resourceType.name"
                      :instance-id="instance.id"
                      :field="col.fieldData"
                      class="px-4 py-2 border border-gray-500/10 rounded m-auto"
                    />
                  </div>
                  <div v-else class="flex items-center gap-2">
                    <UIcon name="i-ph-eye-slash" class="w-4 h-4 opacity-50" />
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Instance is inactive, preview is not available.
                    </p>
                  </div>
                </div>
              </template>
            </Menu>
          </template>
          <template v-else-if="col.fieldData?.type === 'resource'">
            <Menu
              v-if="col.childResourceType?.inline"
              :delay="500"
              :dispose-timeout="0"
              popper-class="!z-[10002]"
            >
              <template #default="{ shown }">
                <div
                  class="flex items-center gap-1 border border-primary/20 px-2 py-1 rounded-lg text-xs"

                  :class="{
                    'ring-2 ring-gray-500/50': shown,
                  }"
                >
                  <UIcon name="i-ph-brackets-curly" class="w-4 h-4 flex-none" />
                  Inline
                </div>
              </template>

              <template #popper>
                <MonacoEditor
                  :filename="`field-${resourceType.name}-${col.field}-inline-view.js`"
                  :source="JSON.stringify(instance.value[col.field as keyof typeof instance], null, 2)"
                  :options="{
                    language: 'json',
                    lineNumbers: 'off',
                    folding: false,
                    wordWrap: 'on',
                    readOnly: true,
                  }"
                  class="w-[300px] h-[200px]"
                />
              </template>
            </Menu>
            <Menu
              v-else
              :delay="500"
              :dispose-timeout="0"
              popper-class="!z-[10002]"
            >
              <template #default="{ shown }">
                <ResourceReferencesSummary
                  :field="col.fieldData"
                  :value="instance.value[col.field as keyof typeof instance]"
                  class="border border-primary/20 px-2 py-1 rounded-lg"
                  :class="{
                    'ring-2 ring-gray-500/50': shown,
                  }"
                />
              </template>

              <template #popper>
                <ResourceReferencesPreview
                  :field="col.fieldData"
                  :value="instance.value[col.field as keyof typeof instance]"
                  class="max-w-[600px] min-h-[200px] max-h-[600px]"
                />
              </template>
            </Menu>
          </template>
          <template v-else>
            <div v-if="col.fieldData?.array" class="flex items-center h-full overflow-hidden gap-1">
              <ValuePreview
                v-for="(item, index) in instance.value[col.field as keyof typeof instance]"
                :key="index"
                :value="item"
                :type="col.fieldData?.type"
                class="leading-tight text-xs line-clamp-2 px-1 py-0.5 border border-gray-500/10 rounded flex-none"
                :class="{
                  'font-mono': col.fieldData?.type === 'number' || col.field.match(/id/),
                }"
              />
            </div>
            <ValuePreview
              v-else
              :value="instance.value[col.field as keyof typeof instance]"
              :type="col.fieldData?.type"
              class="leading-tight text-xs line-clamp-2"
              :class="{
                'font-mono': col.fieldData?.type === 'number' || col.field.match(/id/),
              }"
            />
          </template>
        </div>

        <slot name="end" />
      </div>
    </div>
  </div>
</template>
