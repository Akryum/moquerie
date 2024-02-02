import type { DBLocation } from '@moquerie/core'
import type { LocationQuery, RouteParams, RouteRecordName } from '#vue-router'

interface SavedRoute {
  name: RouteRecordName
  params: RouteParams
  query: LocationQuery
}

const savedRoutes = new Map<string, SavedRoute>()

let lastRoute: SavedRoute | null = null

export interface UseSaveRouteOptions {
  key: string
  /**
   * Path used by the menu link to detect if we need to restore the saved route.
   */
  basePath: string
  /**
   * Default route to use if the saved route is not found.
   */
  defaultRoute?: {
    name: RouteRecordName
    params?: RouteParams
    query?: LocationQuery
  }
}

export function useSaveRoute(options: UseSaveRouteOptions) {
  const route = useRoute()
  const router = useRouter()

  const savedRoute = savedRoutes.get(options.key)
  const isBaseRoute = route.path === options.basePath

  if (savedRoute) {
    if (isBaseRoute) {
      setTimeout(() => {
        router.replace({
          name: savedRoute.name,
          params: {
            ...savedRoute.params,
            // We reuse the params to keep same topic
            ...lastRoute?.params,
          },
          query: savedRoute.query,
        })
      }, 100)
    }
  }
  else {
    const s = {
      name: route.name!,
      params: route.params,
      query: route.query,
    }
    savedRoutes.set(options.key, s)
    if (!lastRoute) {
      lastRoute = s
    }
    if (options.defaultRoute && isBaseRoute) {
      const defaultRoute = options.defaultRoute
      try {
        setTimeout(() => {
          router.replace({
            name: defaultRoute.name,
            params: {
              ...defaultRoute.params,
              // We reuse the params to keep same topic
              ...lastRoute?.params,
            },
            query: defaultRoute.query,
          })
        }, 100)
      }
      catch (e) {
        // Ignore
      }
    }
  }

  watch(() => route.fullPath, () => {
    lastRoute = {
      name: route.name!,
      params: route.params,
      query: route.query,
    }
    savedRoutes.set(options.key, lastRoute)
  })
}

const validDbLocations = ['local', 'repository']

export function getDbLocationFromRouteQuery(key: string) {
  const route = useRoute()
  const rawValue = route.query[key]
  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue
  if (value && validDbLocations.includes(value)) {
    return value as DBLocation
  }
  return null
}
