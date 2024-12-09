<script lang="ts" setup>
import type { User } from '@moquerie/core'
import { Menu } from 'floating-vue'

defineProps<{
  user: User
}>()
</script>

<template>
  <Menu
    placement="right"
    :delay="500"
    :dispose-timeout="0"
  >
    <UAvatar
      :src="user.avatar"
      :alt="user.name"
    />

    <template #popper>
      <div class="p-4 flex items-center gap-4">
        <UAvatar
          v-if="user.avatar"
          :src="user.avatar"
          :alt="user.name"
          size="2xl"
        />

        <div>
          <div class="text-md">
            {{ user.name }}
          </div>
          <div
            v-if="user.email"
            class="text-gray-500"
          >
            {{ user.email }}
          </div>
          <div v-if="user.github" class="flex items-center gap-0.5">
            <UIcon
              name="i-ph-github-logo"
              class="w-4 h-4 flex-none"
            />
            <a
              v-if="user.github.profilePageUrl"
              :href="user.github.profilePageUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary-500 hover:underline"
            >
              {{ user.github.login }}
            </a>
            <span v-else>
              {{ user.github.login }}
            </span>
          </div>
        </div>
      </div>
    </template>
  </Menu>
</template>
