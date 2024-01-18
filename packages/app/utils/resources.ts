export async function useFavoriteResources() {
  const { settings } = await useSettings()

  function isFavorite(resourceName: string) {
    return settings.favoriteResources?.includes(resourceName) ?? false
  }

  function setFavorite(resourceName: string, favorite: boolean) {
    const index = settings.favoriteResources?.indexOf(resourceName) ?? -1
    if (favorite) {
      if (index === -1) {
        settings.favoriteResources = [
          ...(settings.favoriteResources ?? []),
          resourceName,
        ]
      }
    }
    else {
      if (index !== -1) {
        settings.favoriteResources = [
          ...(settings.favoriteResources ?? []).slice(0, index),
          ...(settings.favoriteResources ?? []).slice(index + 1),
        ]
      }
    }
  }

  function toggleFavorite(resourceName: string) {
    setFavorite(resourceName, !isFavorite(resourceName))
  }

  const count = computed(() => settings.favoriteResources?.length ?? 0)

  return {
    isFavorite,
    setFavorite,
    toggleFavorite,
    count,
  }
}
