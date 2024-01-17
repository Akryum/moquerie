<script lang="ts" setup>
import type { DatabaseSnapshot } from '@moquerie/core'

const props = defineProps<{
  snapshot: DatabaseSnapshot
}>()

const ago = useTimeAgo(() => props.snapshot.date)
</script>

<template>
  <div class="flex gap-2">
    <UAvatar
      :src="snapshot.author.avatar"
      :alt="snapshot.author.name"
      size="md"
    />

    <div>
      <div>
        {{ snapshot.id }}
      </div>
      <div
        v-if="snapshot.description"
        class="text-sm opacity-75"
      >
        {{ snapshot.description }}
      </div>
      <div class="flex items-center gap-2 text-sm opacity-50">
        <div>
          Created by {{ snapshot.author.name }}
        </div>
        <div class="w-1 h-1 bg-primary-500/60 rounded-full" />
        <div class="first-letter:uppercase">
          {{ ago }}
        </div>
      </div>
      <div v-if="snapshot.tags?.length" class="flex gap-1 mt-2">
        <UBadge
          v-for="tag in snapshot.tags"
          :key="tag"
          variant="soft"
        >
          {{ tag }}
        </UBadge>
      </div>
    </div>
  </div>
</template>
