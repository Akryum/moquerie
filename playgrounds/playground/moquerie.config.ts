import type { ESLint } from 'eslint'
import { resolve } from 'node:path'
import { defineConfig } from 'moquerie/config'

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

  extendTypes: {
    typeFiles: [
      'src/extend/types.ts',
    ],
  },

  ignoredResourcesInExplorer: [
    /Payload$/,
  ],

  plugins: [
    {
      name: 'eslint-autofix',

      writeCode: async ({ code }) => {
        // @ts-expect-error no types
        const { FlatESLint } = await import('eslint/use-at-your-own-risk')

        if (!eslint) {
          const configPath = resolve(__dirname, 'eslint.config.js')
          console.log(configPath)
          eslint = new FlatESLint({
            fix: true,
            overrideConfigFile: configPath,
            ignore: false,
          })
        }

        console.log('ESLint autofixing', code)

        const results = await eslint.lintText(code)
        await FlatESLint.outputFixes(results)
        const [result] = results
        console.log(result)
        if (result?.output) {
          console.log('ESLint autofix applied', result.output)
          return result.output
        }
      },
    },

    {
      name: 'JSDoc restPath',

      resolveResourceFromRequest: async ({ path, schema }) => {
        for (const key in schema.types) {
          const type = schema.types[key]
          /**
           * `restPath` is extracted from the JSDoc of the interface
           */
          if (path.startsWith(type.meta?.restPath)) {
            return type.name
          }
        }
      },
    },

    {
      name: 'transform-responses',

      beforeSendResponse: async ({ type, response, generatedResolver }) => {
        if (type === 'rest' && generatedResolver) {
          return {
            data: response,
          }
        }
      },
    },
  ],
})
