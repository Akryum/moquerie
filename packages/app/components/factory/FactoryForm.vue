<script lang="ts" setup>
import { Dropdown } from 'floating-vue'
import type { ResourceFactory, ResourceSchemaType } from '@moquerie/core'
import SuperJSON from 'superjson'
import type { FactoryData } from './formTypes.js'
import { useTagModel } from '~/utils/form.js'

const props = defineProps<{
  resourceName: string
  factory?: ResourceFactory
}>()

const emit = defineEmits<{
  cancel: []
  complete: [ResourceFactory]
}>()

const { data: fakerLocales } = await useFetch<Record<string, { name: string, faker: string }>>('/api/faker/locales')

const fakerLocaleOptions = computed(() => {
  return [
    {
      label: 'Default',
      value: undefined,
    },
    ...Object.keys(fakerLocales.value ?? {}).map(key => ({
      label: fakerLocales.value![key].name,
      value: key,
    })),
  ]
})

const { data: resourceType, refresh } = await useFetch<ResourceSchemaType>(() => `/api/resources/${props.resourceName}/`)
onWindowFocus(refresh)

function getStateInitialValues(factory = props.factory): FactoryData {
  return {
    name: factory?.name ?? `${props.resourceName}Factory`,
    resourceName: props.resourceName,
    location: factory?.location ?? getDbLocationFromRouteQuery('factoryLocation') ?? 'local',
    info: {
      description: factory?.info?.description ?? '',
      tags: factory?.info?.tags ? structuredClone(toRaw(factory.info.tags)) : [],
      createPrompts: factory?.info?.createPrompts ? structuredClone(toRaw(factory.info.createPrompts)) : [],
      fakerSeed: factory?.info?.fakerSeed ?? '',
      fakerLocale: factory?.info?.fakerLocale,
      applyTags: factory?.info?.applyTags ? structuredClone(toRaw(factory.info.applyTags)) : [],
      applyComment: factory?.info?.applyComment ?? '',
    },
    fields: factory?.fields
      ? structuredClone(toRaw(factory.fields))
      : {},
  }
}

const state = ref<FactoryData>(getStateInitialValues())

const stateChanged = ref(false)

watch(() => props.factory, (value) => {
  if (!stateChanged.value) {
    state.value = getStateInitialValues(value)
    nextTick(() => {
      stateChanged.value = false
    })
  }
})

watch(state, () => {
  stateChanged.value = true
}, {
  deep: true,
})

async function setDefaultFactoryFields() {
  const data = await $fetch('/api/factories/defaultFields', {
    query: {
      resourceName: props.resourceName,
    },
  })
  state.value.fields = data.fields
}

if (!props.factory) {
  setDefaultFactoryFields()
}

watch(() => props.resourceName, () => {
  state.value = getStateInitialValues()
  if (!props.factory) {
    setDefaultFactoryFields()
  }
  refresh()
})

const tags = useTagModel(state.value.info, 'tags')
const applyTags = useTagModel(state.value.info, 'applyTags')

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

  try {
    let factory: ResourceFactory

    if (props.factory) {
      // Update factory
      factory = SuperJSON.parse(await $fetch(`/api/factories/${props.factory.id}`, {
        method: 'PATCH',
        body: {
          ...state.value,
        },
      }))
      toast.add({
        id: 'factory-updated',
        title: 'Factory updated!',
        icon: 'i-ph-check-circle',
        color: 'green',
      })
    }
    else {
      // Create factory
      factory = SuperJSON.parse(await $fetch(`/api/factories/create`, {
        method: 'POST',
        body: state.value,
      }))
      toast.add({
        id: 'factory-created',
        title: 'Factory created!',
        icon: 'i-ph-check-circle',
        color: 'green',
      })
    }

    emit('complete', factory)

    factoryStore.refreshFactories()

    state.value = getStateInitialValues(factory)
  }
  catch (e: any) {
    toast.add({
      id: 'factory-error',
      title: 'Error',
      description: e.data?.message ?? e.message,
      icon: 'i-ph-x-circle',
      color: 'red',
    })
  }
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

  await $fetch(`/api/factories/${props.factory.id}`, {
    method: 'DELETE',
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

  await factoryStore.refreshFactories()
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
})
</script>

<template>
  <div v-if="resourceType" class="grid grid-cols-2">
    <div class="w-full h-full overflow-y-auto p-4">
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
            <UInput
              v-model="state.name"
              autofocus
              placeholder="Examples: NewUserWithMessages, getNewUser, createEmptyItem"
            />
          </UFormGroup>

          <FormGroupLocationInput v-model="state.location" />

          <UFormGroup name="description" label="Description" hint="What does the factory do?">
            <UTextarea v-model="state.info.description" autoresize :rows="1" />
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
              v-model="state.info.fakerLocale"
              :options="fakerLocaleOptions"
              searchable
              value-attribute="value"
            >
              <template #label>
                {{ fakerLocales?.[state.info.fakerLocale ?? '']?.name ?? 'Default' }}
              </template>
            </USelectMenu>
          </UFormGroup>

          <UFormGroup
            name="fields"
            label="Fields"
          >
            <FactoryFields
              v-model:factory-fields="state.fields"
              :resource-type="resourceType"
              :faker-locale="state.info.fakerLocale"
            />
          </UFormGroup>

          <UFormGroup name="apply-tags" label="Instance tags" hint="Separate tags with commas" description="Those tags will be added to the new resource instance.">
            <UInput v-model="applyTags" placeholder="tag1, tag2, tag3" />
          </UFormGroup>

          <UFormGroup name="apply-comment" label="Instance comment" description="Comment/note added to the instance">
            <UTextarea v-model="state.info.applyComment" />
          </UFormGroup>

          <FormActions class="-bottom-4">
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

              <KbShortcut :keys="['meta', 'enter']" />
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

              <KbShortcut :keys="['meta', 'Del']" />
            </UButton>
          </FormActions>
        </UForm>

        <template v-if="factory">
          <ConfirmModal
            :shown="showConfirmRemove"
            title="Delete factory?"
            icon="i-ph-factory"
            confirm-label="Delete factory"
            confirm-icon="i-ph-trash"
            @cancel="showConfirmRemove = false"
            @confirm="removeFactory()"
          >
            <template #after-title>
              <span class="border border-gray-500/50 rounded-lg px-1.5 font-bold text-primary">{{ factory.name }}</span>
            </template>
          </ConfirmModal>
        </template>
      </div>
    </div>

    <div class="w-full h-full">
      <FactoryPreview
        :factory="state"
        class="h-full p-4"
      />
    </div>
  </div>
</template>
