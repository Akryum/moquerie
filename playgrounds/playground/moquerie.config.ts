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

      writeCode: async ({ code, path }) => {
        const { ESLint } = await import('eslint')

        if (!eslint) {
          const configPath = resolve(__dirname, 'eslint.config.js')
          eslint = new ESLint({
            cwd: __dirname,
            overrideConfigFile: configPath,
            fix: true,
            ignore: false,
          })
        }

        const results = await eslint.lintText(code, {
          filePath: path,
        })
        await ESLint.outputFixes(results)
        const [result] = results
        if (result?.output) {
          return result.output
        }
        else if (result?.messages?.length) {
          for (const message of result.messages) {
            console[message.fatal ? 'error' : 'warn'](`[ESLint] ${message.message} - ${path} (${message.line}:${message.column})`)
          }
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
