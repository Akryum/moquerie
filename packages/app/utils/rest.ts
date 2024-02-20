export async function useHasRest() {
  const { data, refresh } = await useFetch('/api/rest/hasRest')
  onWindowFocus(refresh)
  onConfigChange(refresh)

  return data
}
