<script lang="ts">
let handlerSetup = false
const handlers: Array<() => void> = []
</script>

<script lang="ts" setup>
const error = shallowRef<any>(null)

onErrorCaptured((err) => {
  // eslint-disable-next-line no-console
  console.log('error', err)
  error.value = err
  return false
})

const router = useRouter()

async function clearError(options: { redirect?: any } = {}) {
  if (options.redirect) {
    await router.push(options.redirect)
  }
  error.value = null
}

if (!handlerSetup) {
  router.beforeEach(() => {
    handlers.forEach(handler => handler())
  })
  handlerSetup = true
}

handlers.push(clearError)

onBeforeUnmount(() => {
  const index = handlers.indexOf(clearError)
  if (index !== -1) {
    handlers.splice(index, 1)
  }
})
</script>

<template>
  <slot
    v-if="!error"
  />

  <slot
    v-else
    name="error"
    :error="error"
    :clear-error="clearError"
  />
</template>
