<script lang="ts" setup>
const resourceTypeStore = useResourceTypeStore()
await resourceTypeStore.wait()

const selectedResourceName = ref('')

watchEffect(() => {
  if (!selectedResourceName.value && resourceTypeStore.resourceTypes.length) {
    selectedResourceName.value = resourceTypeStore.resourceTypes[0].name
  }
})
</script>

<template>
  <FactoryForm
    :resource-name="selectedResourceName"
  >
    <template #before-form>
      <UFormGroup label="Resource type">
        <USelectMenu
          v-model="selectedResourceName"
          :options="resourceTypeStore.resourceTypes.map(type => ({
            label: type.name,
            value: type.name,
          }))"
          value-attribute="value"
          searchable
        />
      </UFormGroup>
    </template>
  </FactoryForm>
</template>
