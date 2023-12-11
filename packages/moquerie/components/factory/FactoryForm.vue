<script lang="ts" setup>
import { Dropdown } from 'floating-vue'
import type { FactoryData } from './formTypes.js'
import type { ResourceFactory } from '~/types/factory.js'
import { useTagModel } from '~/utils/form.js'

const props = defineProps<{
  resourceName: string
  factory?: ResourceFactory
}>()

const emit = defineEmits<{
  cancel: []
  complete: [ResourceFactory]
}>()

const { data: fakerLocales } = await useFetch('/api/faker/locales')

const fakerLocaleOptions = computed(() => {
  return [
    {
      label: 'Default',
      value: undefined,
    },
    ...Object.keys(fakerLocales.value ?? {}).map(key => ({
      label: fakerLocales.value?.[key].name,
      value: key,
    })),
  ]
})

const { data: resourceType, refresh } = await useFetch(() => `/api/resources/${props.resourceName}`)
onWindowFocus(refresh)

function getStateInitialValues(factory = props.factory): FactoryData {
  return {
    name: factory?.name ?? `${props.resourceName} factory`,
    location: factory?.location ?? getDbLocationFromRouteQuery('factoryLocation') ?? 'local',
    description: factory?.description ?? '',
    tags: factory?.tags ?? [],
    resourceName: props.resourceName,
    createPrompts: factory?.createPrompts ?? [],
    createValue: factory?.createValue ?? {
      generateType: 'static',
      children: {},
    },
    fakerSeed: factory?.fakerSeed ?? '',
    fakerLocale: factory?.fakerLocale,
    applyTags: factory?.applyTags ?? [],
    applyComment: factory?.applyComment ?? '',
  }
}

const state = ref<FactoryData>(getStateInitialValues())

watch(() => props.factory, (value) => {
  state.value = getStateInitialValues(value)
})

const stateChanged = ref(false)

watch(state, () => {
  stateChanged.value = true
}, {
  deep: true,
})

async function setDefaultValueFactory() {
  const data = await $fetch('/api/factories/defaultValueFactory', {
    query: {
      resourceName: props.resourceName,
    },
  })
  state.value.createValue = data.value
}

if (!props.factory) {
  setDefaultValueFactory()
}

watch(() => props.resourceName, () => {
  state.value = getStateInitialValues()
  if (!props.factory) {
    setDefaultValueFactory()
  }
  refresh()
})

const tags = useTagModel(state.value, 'tags')
const applyTags = useTagModel(state.value, 'applyTags')

function validate(state: FactoryData) {
  const errors = []

  if (!state.name) {
    errors.push({ path: 'name', message: 'Name is required' })
  }

  return errors
}

const factoryStore = useFactoryStore()

const toast = useToast()

async function onSubmit() {
  const errors = validate(state.value)
  if (errors.length) {
    return
  }

  let factory: ResourceFactory

  if (props.factory) {
    // Update factory
    factory = await $fetch(`/api/factories/update`, {
      method: 'PATCH',
      body: {
        id: props.factory.id,
        ...state.value,
      },
    })
    toast.add({
      id: 'factory-updated',
      title: 'Factory updated!',
      icon: 'i-ph-check-circle',
      color: 'green',
    })
  }
  else {
    // Create factory
    factory = await $fetch(`/api/factories/create`, {
      method: 'POST',
      body: state.value,
    })
    toast.add({
      id: 'factory-created',
      title: 'Factory created!',
      icon: 'i-ph-check-circle',
      color: 'green',
    })
  }

  emit('complete', factory)

  factoryStore.refresh()

  state.value = getStateInitialValues(factory)
}

// Shortcuts

defineShortcuts({
  meta_enter: {
    usingInput: true,
    handler: () => {
      onSubmit()
    },
  },
})

// Cancel

async function onCancel() {
  emit('cancel')

  if (props.factory) {
    state.value = getStateInitialValues()
    await nextTick()
    stateChanged.value = false
  }
}

// Delete factory

const router = useRouter()
const route = useRoute()

const showConfirmRemove = ref(false)

async function removeFactory() {
  if (!props.factory) {
    return
  }

  await $fetch('/api/factories/remove', {
    method: 'DELETE',
    query: {
      id: props.factory.id,
    },
  })

  toast.add({
    id: 'factory-removed',
    title: 'Factory removed!',
    icon: 'i-ph-trash',
    color: 'green',
  })

  router.replace({
    name: 'db-factories-resourceName',
    params: {
      ...route.params,
    },
    query: {
      ...route.query,
    },
  })
}

// Shortcuts

defineShortcuts({
  meta_delete: {
    usingInput: true,
    handler: () => {
      if (!props.factory) {
        return
      }
      showConfirmRemove.value = true
    },
  },

  escape: {
    usingInput: true,
    handler: () => {
      showConfirmRemove.value = false
    },
    whenever: [showConfirmRemove],
  },

  enter: {
    usingInput: true,
    handler: () => {
      removeFactory()
    },
    whenever: [showConfirmRemove],
  },
})

const { metaSymbol } = useShortcuts()
</script>

<template>
  <div class="flex items-stretch">
    <div class="w-1/2 h-full overflow-y-auto p-4">
      <div class="space-y-4">
        <h1 class="flex items-center gap-1">
          <UIcon name="i-ph-factory" class="text-primary-500 w-6 h-6" />

          <template v-if="factory">
            Update factory
            <span class="border border-gray-500/50 rounded-lg px-1.5 font-bold text-primary">{{ factory.name }}</span>
          </template>
          <template v-else>
            Create new factory
          </template>
        </h1>

        <slot name="before-form" />

        <UForm
          :state="state"
          :validate="validate"
          class="flex flex-col gap-4"
          @submit="onSubmit()"
        >
          <UFormGroup name="name" label="Factory name" required>
            <UInput v-model="state.name" autofocus />
          </UFormGroup>

          <UFormGroup name="location" label="Location">
            <template #label>
              <div class="flex items-center gap-2">
                Location

                <Dropdown class="h-4" placement="top">
                  <UIcon
                    name="i-ph-info"
                    class="text-gray-500 dark:text-gray-300 w-4 h-4 cursor-pointer"
                    aria-role="button"
                    aria-label="More info"
                  />

                  <template #popper>
                    <div class="text-sm p-4 max-w-[300px]">
                      <p>
                        <b>Local</b>: save on your computer<br>
                        <b>Repository</b>: save on the repository to be committed and shared with others
                      </p>
                      <p class="italic opacity-50">
                        You can change this later.
                      </p>
                    </div>
                  </template>
                </Dropdown>
              </div>
            </template>

            <RadioButtonGroup
              v-model="state.location"
              :button-attrs="{
                color: 'gray',
              }"
              :options="[
                {
                  value: 'local',
                  label: 'Local',
                },
                {
                  value: 'repository',
                  label: 'Repository',
                },
              ]"
            />
          </UFormGroup>

          <UFormGroup name="description" label="Description" hint="What does the factory do?">
            <UInput v-model="state.description" />
          </UFormGroup>

          <UFormGroup name="tags" label="Factory tags" hint="Separate tags with commas">
            <UInput v-model="tags" placeholder="tag1, tag2, tag3" />
          </UFormGroup>

          <!-- @TODO investigate if it's working -->
          <!-- <UFormGroup name="fakerSeed">
            <template #label>
              <div class="flex items-center gap-2">
                Faker seed

                <UPopover class="h-4" :popper="{ placement: 'top' }">
                  <UIcon name="i-ph-info" class="text-gray-500 dark:text-gray-300 w-4 h-4" />

                  <template #panel>
                    <p class="text-sm p-4 max-w-[300px]">
                      Faker uses a seed to generate random data. If you want to generate the same data every time, you can set a seed here.
                    </p>
                  </template>
                </UPopover>
              </div>
            </template>

            <UInput v-model="state.fakerSeed" />
          </UFormGroup> -->

          <UFormGroup name="fakerLocale" label="Faker locale">
            <USelectMenu
              v-model="state.fakerLocale"
              :options="fakerLocaleOptions"
              searchable
              value-attribute="value"
            >
              <template #label>
                {{ fakerLocales?.[state.fakerLocale ?? '']?.name ?? 'Default' }}
              </template>
            </USelectMenu>
          </UFormGroup>

          <UFormGroup
            v-if="resourceType?.type === 'object'"
            name="createValue"
            label="Fields"
          >
            <FactoryFields
              v-model:value="state.createValue"
              :resource-type="resourceType"
              :faker-locale="state.fakerLocale"
            />
          </UFormGroup>

          <UFormGroup name="apply-tags" label="Instance tags" hint="Separate tags with commas" description="Those tags will be added to the new resource instance.">
            <UInput v-model="applyTags" placeholder="tag1, tag2, tag3" />
          </UFormGroup>

          <UFormGroup name="apply-comment" label="Instance comment" description="Comment/note added to the instance">
            <UTextarea v-model="state.applyComment" />
          </UFormGroup>

          <!-- Form actions -->
          <div class="flex items-center gap-4 sticky -bottom-4 bg-white dark:bg-gray-950 py-2">
            <UButton
              color="gray"
              @click="onCancel()"
            >
              Cancel
            </UButton>

            <UButton
              type="submit"
              icon="i-ph-check"
              :disabled="factory && !stateChanged"
            >
              {{ factory ? 'Update factory' : 'Create factory' }}

              <span>
                <UKbd>{{ metaSymbol }}</UKbd>
                <UKbd>↵</UKbd>
              </span>
            </UButton>

            <div class="flex-1" />

            <Dropdown>
              <UButton
                color="gray"
                variant="ghost"
                icon="i-ph-code"
              />

              <template #popper>
                <div class="p-6 overflow-auto max-w-[400px] max-h-[400px] text-xs">
                  <pre>{{ state }}</pre>
                </div>
              </template>
            </Dropdown>

            <UButton
              v-if="factory"
              color="gray"
              icon="i-ph-trash"
              @click="showConfirmRemove = true"
            >
              Delete factory

              <span>
                <UKbd>{{ metaSymbol }}</UKbd>
                <UKbd>Del</UKbd>
              </span>
            </UButton>
          </div>
        </UForm>

        <UModal v-model="showConfirmRemove">
          <UCard v-if="factory">
            <template #header>
              <h2 class="text-lg font-bold flex items-center gap-2">
                <UIcon name="i-ph-factory" class="w-6 h-6" />
                Delete factory
                <span class="border border-gray-500/50 rounded-lg px-1.5 font-bold text-primary">{{ factory.name }}</span>
              </h2>
            </template>

            <div class="flex items-center gap-2">
              <UButton
                color="gray"
                @click="showConfirmRemove = false"
              >
                Cancel

                <UKbd>Esc</UKbd>
              </UButton>

              <UButton
                color="red"
                icon="i-ph-trash"
                @click="removeFactory()"
              >
                Delete factory

                <UKbd>↵</UKbd>
              </UButton>
            </div>
          </UCard>
        </UModal>
      </div>
    </div>

    <div class="w-1/2 h-full">
      <FactoryPreview
        :factory="state"
        class="h-full p-4"
      />
    </div>
  </div>
</template>
