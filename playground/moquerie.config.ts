import { defineConfig } from 'moquerie/config'

export default defineConfig({
  graphql: {
    schema: {
      scanCodeFiles: './src/**/*.ts',
    },
  },
  ignoredResourcesInExplorer: [
    'Mutation',
  ],
})
