<script lang="ts" setup>
import { Dropdown } from 'floating-vue'

defineOptions({
  inheritAttrs: false,
})
</script>

<template>
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
      v-bind="$attrs"
    />
  </UFormGroup>
</template>
