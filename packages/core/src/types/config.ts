export interface Config {
  /**
   * Enable GraphQL support
   */
  graphql?: {
    /**
     * File exporting the graphql schema. You can add a `#name` suffix to import a named export. By default it will try to import the default export.
     */
    schema?: string
  }
}
