import { defineConfig } from 'moquerie/config'

export default defineConfig({
  graphql: {
    schema: './src/schema.ts#schema',
  },
})
