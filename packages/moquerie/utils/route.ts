export function useSaveRoute(key: string) {
  const route = useRoute()
  const router = useRouter()

  const lastRoute = useLocalStorage<string>(key, '')

  if (lastRoute.value && lastRoute.value !== route.fullPath) {
    router.replace(lastRoute.value)
  }

  watch(() => route.fullPath, (value) => {
    lastRoute.value = value
  })
}
