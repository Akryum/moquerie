<script lang="ts" setup>
import { Tooltip } from 'floating-vue'
import SuperJSON from 'superjson'
import { isOpen as isFakerGeneratorOpen } from './resourceInstanceValueFaker.js'
import type { DBLocation } from '~/types/db.js'
import type { ResourceFactory } from '~/types/factory.js'
import type { ResourceInstance } from '~/types/resource.js'

const props = defineProps<{
  resourceName: string
}>()

const route = useRoute()
const router = useRouter()

const manual = ref(false)

const error = ref<any>()

const toast = useToast()

// Resource type

const resourceTypeStore = useResourceTypeStore()

const resourceType = await resourceTypeStore.fetchResourceType(props.resourceName)

// Auto open factory select menu

const factorySelectMenu = ref<any>()

function openFactorySelectMenu() {
  setTimeout(() => {
    factorySelectMenu.value?.$refs.trigger?.el.click()
  }, 300) // Timeout to takeover focus from other autofocus elements
}

onMounted(async () => {
  if (!manual.value) {
    openFactorySelectMenu()
  }
})

// Generate

const factoryDbLocation = ref<DBLocation>('local')
const factoryStore = useFactoryStore()

function fetchFactories() {
  return factoryStore.fetchFactories({
    resourceName: route.params.resourceName as string,
    location: factoryDbLocation.value,
  })
}

watchEffect(() => {
  fetchFactories()
})

const selectedFactory = ref<ResourceFactory | undefined>()

const genererateCount = ref(1)

async function generateInstances() {
  try {
    error.value = null
    await $fetch('/api/resources/generate', {
      method: 'POST',
      body: {
        resourceName: props.resourceName,
        factoryId: selectedFactory.value?.id,
        count: genererateCount.value,
      },
    })

    toast.add({
      id: 'resource-instance-generated',
      color: 'green',
      title: `Created ${genererateCount.value} ${props.resourceName} instance${genererateCount.value > 1 ? 's' : ''}`,
      icon: 'i-ph-check-circle',
    })

    router.push({
      name: 'db-resources-resourceName-instances',
      params: {
        resourceName: props.resourceName,
      },
    })
  }
  catch (err) {
    error.value = err
  }
}

// Create factory

const showCreateFactory = ref(false)

async function onFactoryCreated(data: ResourceFactory) {
  showCreateFactory.value = false
  await fetchFactories()
  selectedFactory.value = factoryStore.factories.find(f => f.id === data.id)
}

// Auto focus first input

const form = ref<HTMLElement>()

watch(selectedFactory, async () => {
  if (selectedFactory.value) {
    await nextTick()
    const input = form.value?.querySelector('input')
    if (input) {
      input.focus()
      input.select()
    }
  }
})

// Create manually

async function createInstance(value: any) {
  try {
    error.value = null
    const instance = SuperJSON.parse(await $fetch('/api/resources/create', {
      method: 'POST',
      body: {
        resourceName: props.resourceName,
        value,
      },
    })) as ResourceInstance

    if (!instance) {
      throw new Error('Instance not created')
    }

    toast.add({
      id: 'resource-instance-created',
      color: 'green',
      title: `Created ${props.resourceName} instance`,
      icon: 'i-ph-check-circle',
    })

    router.push({
      name: 'db-resources-resourceName-instances-instanceId',
      params: {
        resourceName: props.resourceName,
        instanceId: instance.id,
      },
    })
  }
  catch (e: any) {
    error.value = e
  }
}

// Cancel

function onCancel() {
  router.push({
    name: 'db-resources-resourceName-instances',
    params: {
      resourceName: props.resourceName,
    },
  })
}

// Shortcuts

defineShortcuts({
  meta_f: {
    usingInput: true,
    handler: async () => {
      manual.value = !manual.value
      // Auto open factory select menu
      if (!manual.value) {
        openFactorySelectMenu()
      }
    },
    whenever: [() => !isFakerGeneratorOpen.value],
  },

  escape: {
    usingInput: true,
    handler: onCancel,
    whenever: [() => !isFakerGeneratorOpen.value],
  },
})
</script>

<template>
  <div class="p-4 space-y-4 max-w-[600px]">
    <h1 class="flex items-center gap-1">
      <UIcon name="i-ph-database" class="text-primary-500 w-6 h-6" />

      Create resource instance
    </h1>

    <div class="flex items-center gap-2">
      <RadioButtonGroup
        v-model="manual"
        :options="[
          { label: 'Factory', value: false },
          { label: 'Manual', value: true },
        ]"
      />

      <template v-if="!manual">
        <UButtonGroup
          class="flex-1 w-0"
        >
          <USelectMenu
            ref="factorySelectMenu"
            v-model="selectedFactory"
            :options="factoryStore.factories"
            searchable
            :search-attributes="['name', 'description', 'tags']"
            class="w-full"
          >
            <template #label>
              <div v-if="selectedFactory" class="flex items-center gap-2">
                <UIcon name="i-ph-factory" class="text-primary-500 w-4 h-4" />
                {{ selectedFactory?.name }}
              </div>
              <div v-else>
                Select a factory...
              </div>
            </template>

            <template #option="{ option: factory }">
              <Tooltip
                placement="right"
                class="w-full"
              >
                <div class="w-full">
                  <div class="truncate">
                    {{ factory.name }}
                  </div>
                  <div v-if="factory.description" class="text-sm opacity-50 truncate">
                    {{ factory.description }}
                  </div>
                </div>

                <template #popper>
                  <FactoryInfo :factory="factory" />
                </template>
              </Tooltip>
            </template>

            <template #option-empty="{ query }">
              <q>{{ query }}</q> not found
            </template>
          </USelectMenu>

          <UButton
            color="gray"
            @click="showCreateFactory = true"
          >
            New factory
          </UButton>
        </UButtonGroup>
      </template>

      <KbShortcut :keys="['meta', 'F']" />
    </div>

    <div ref="form">
      <div
        v-if="!manual"
        class="space-y-4"
      >
        <template v-if="selectedFactory">
          <!-- Count -->
          <UFormGroup label="Number of instances to generate">
            <div class="flex items-center gap-2">
              <UInput
                v-model.number="genererateCount"
                type="number"
                :min="1"
                class="w-[100px]"
              />
              <URange
                v-model.number="genererateCount"
                :min="1"
                :max="100"
                :step="1"
                class="flex-1"
              />
            </div>
          </UFormGroup>
        </template>

        <div v-else class="flex items-center justify-center p-1">
          <div class="bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center w-12 h-12">
            <UIcon name="i-ph-factory" class="w-6 h-6 opacity-30" />
          </div>
        </div>

        <FormActions>
          <UButton
            color="gray"
            @click="onCancel()"
          >
            Cancel
          </UButton>

          <UButton
            icon="i-ph-plus"
            :disabled="!selectedFactory"
            @click="generateInstances()"
          >
            Create {{ genererateCount }} instance{{ genererateCount > 1 ? 's' : '' }}

            <KbShortcut :keys="['meta', 'enter']" />
          </UButton>
        </FormActions>
      </div>

      <ResourceInstanceValueForm
        v-else-if="resourceType"
        :resource-type="resourceType"
        @cancel="onCancel()"
        @submit="createInstance"
      />

      <ErrorMessage
        v-if="error"
        :error="error"
      />
    </div>

    <UModal
      v-model="showCreateFactory"
      :ui="{
        width: 'sm:max-w-[1200px]',
      }"
    >
      <FactoryForm
        :resource-name="resourceName"
        class="max-h-[calc(100vh-4rem)]"
        @cancel="showCreateFactory = false"
        @complete="onFactoryCreated"
      />
    </UModal>
  </div>
</template>
