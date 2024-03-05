import type { CorsOptions } from 'cors'
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

    /**
     * Enable CORS support
     */
    cors?: CorsOptions
  }

  /**
   * Enable REST support
   */
  rest?: {
    /**
     * Base path for the REST API.
     * @default "/rest"
     */
    basePath?: string
    /**
     * Specify which TypeScript files to scan for REST objects.
     * All exported interfaces from those files will be used to generate RESTful endpoints.
     */
    typeFiles?: string[]
  }

  /**
   * Enable GraphQL support
   */
  graphql?: {
    /**
     * Base path for the GraphQL API.
     * @default "/graphql"
     */
    basePath?: string
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
