export interface Config {
  /**
   * JSON file containing the schema introspection result.
   */
  graphqlSchema?: string
}

export function defineConfig(config: Config): Config {
  return config
}
