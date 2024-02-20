import type { fakerLocales } from '../factory/fakerLocales.js'
import type { Plugin } from './plugin.js'

export interface Config {
  /**
   * Options for the API server
   */
  server?: {
    /**
     * Port to listen on
     * You can also use the PORT environment variable
     */
    port?: number
  }

  /**
   * Enable REST support
   */
  rest?: {
    typeFiles: string[]
  }

  /**
   * Enable GraphQL support
   */
  graphql?: {
    /**
     * GraphQL schema
     */
    schema: {
      /**
       * Live URL to the GraphQL server
       */
      url: string
    } | {
      /**
       * Introspection result JSON file
       */
      jsonFile: string
    } | {
      /**
       * `.graphql` files to load, can be a path to a single file or a glob pattern
       */
      graphqlFiles: string
    } | {
      /**
       * Glob pattern of files to scan for `gql` tags
       */
      scanCodeFiles: string
    }
  }

  /**
   * Those resource types will not appear in the resource database explorer in the UI.
   */
  ignoredResourcesInExplorer?: Array<string | RegExp>

  /**
   * Locale used by all calls to faker when not specified. Default is English.
   */
  defaultFakerLocale?: keyof typeof fakerLocales

  /**
   * Plugins
   */
  plugins?: Array<Plugin | Promise<Plugin>>
}
