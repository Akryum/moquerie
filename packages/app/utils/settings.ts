import type { Settings } from '@moquerie/core'

export async function useSettings() {
  const { data, refresh } = await useFetch('/api/settings', {
    key: 'settings',
  })
  onWindowFocus(refresh)

  const settings = reactive<Settings>(data.value ?? {})

  let autoUpdate = true

  async function applyWithoutAutoUpdate(value: Partial<Settings>) {
    autoUpdate = false
    Object.assign(settings, value)
    await nextTick()
    autoUpdate = true
  }

  watch(data, () => {
    if (data.value) {
      const value = data.value
      applyWithoutAutoUpdate(value)
    }
  })

  async function updateSettings() {
    const result = await $fetch('/api/settings', {
      method: 'PATCH',
      body: {
        settings,
      },
    })
    if (result) {
      data.value = result
    }
  }

  watch(settings, () => {
    if (autoUpdate) {
      updateSettings()
    }
  }, {
    deep: true,
  })

  return {
    settings,
  }
}
