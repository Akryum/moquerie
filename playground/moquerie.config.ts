import { resolve } from 'node:path'
import { defineConfig } from 'moquerie/config'
import type { ESLint } from 'eslint'

let eslint: ESLint

export default defineConfig({
  graphql: {
    schema: {
      scanCodeFiles: './src/**/*.ts',
    },
  },

  rest: {
    typeFiles: [
      'src/rest/types.ts',
    ],
  },

  ignoredResourcesInExplorer: [
    /Payload$/,
  ],

  plugins: [
    {
      name: 'eslint-autofix',

      saveFactory: async ({ content }) => {
        // @ts-expect-error no types
        const { FlatESLint } = await import('eslint/use-at-your-own-risk')

        if (!eslint) {
          const configPath = resolve(__dirname, '../eslint.config.js')
          eslint = new FlatESLint({
            fix: true,
            overrideConfigFile: configPath,
            ignore: false,
          })
        }

        const results = await eslint.lintText(content)
        await FlatESLint.outputFixes(results)
        const [result] = results
        if (result?.output) {
          return result.output
        }
      },
    },
  ],
})
