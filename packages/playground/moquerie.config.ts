import { defineConfig } from 'moquerie'

export default defineConfig({
  graphql: {
    schema: './src/schema.ts#schema',
  },
})
