import type { LocationQuery, RouteParams, RouteRecordName } from '#vue-router'
import type { DBLocation } from '~/types/db.js'

interface SavedRoute {
  name: RouteRecordName
  params: RouteParams
  query: LocationQuery
}

const savedRoutes = new Map<string, SavedRoute>()

let lastRoute: SavedRoute | null = null

export interface UseSaveRouteOptions {
  key: string
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

  if (savedRoute) {
    router.replace({
      name: savedRoute.name,
      params: {
        ...savedRoute.params,
        // We reuse the params to keep same topic
        ...lastRoute?.params,
      },
      query: savedRoute.query,
    })
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
    if (options.defaultRoute && !route.matched.some(m => m.name === options.defaultRoute!.name)) {
      try {
        router.replace({
          name: options.defaultRoute.name,
          params: {
            ...options.defaultRoute.params,
            // We reuse the params to keep same topic
            ...lastRoute?.params,
          },
          query: options.defaultRoute.query,
        })
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
