export async function useHasGraphql() {
  const { data, refresh } = await useFetch('/api/graphql/hasGraphql')
  onWindowFocus(refresh)
  onConfigChange(refresh)

  return data
}
