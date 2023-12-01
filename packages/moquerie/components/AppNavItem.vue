<script lang="ts" setup>
defineProps<{
  to: any
  icon: string
  title: string
}>()
</script>

<template>
  <UTooltip
    :text="title"
    :popper="{
      placement: 'right',
    }"
  >
    <NuxtLink
      :to="to"
      class="leading-[0] p-2.5 rounded-md"
      active-class="bg-rose-800 text-rose-100"
    >
      <UIcon :name="icon" class="w-5 h-5" />
    </NuxtLink>
  </UTooltip>
</template>
