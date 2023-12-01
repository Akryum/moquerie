import createJITI from 'jiti'
import type { Context } from '../context.js'
import { getCwd } from '../env.js'

export async function resolveGraphQLSchema(ctx: Context) {
  if (!ctx.config.graphql?.schema) {
    throw new Error('[moquerie] config.graphql.schema is required for now')
  }

  const jiti = createJITI(getCwd(), {
    requireCache: false,
  })

  const [file, exportName = 'default'] = ctx.config.graphql.schema.split('#')

  const schemaFile = await jiti.resolve(file, {
    paths: [getCwd()],
  })

  if (!schemaFile) {
    throw new Error(`[moquerie] config.graphql.schema: ${ctx.config.graphql.schema} not found`)
  }

  const mod = await jiti(schemaFile)

  if (!(exportName in mod)) {
    throw new Error(`[moquerie] config.graphql.schema: ${ctx.config.graphql.schema} export ${exportName} not found. Did you mean one of: ${Object.keys(mod).map(e => `\`${e}\``).join(', ')}?`)
  }

  const schema = mod[exportName]

  return schema
}

export async function resolveGraphQLSchemaIntrospection(ctx: Context) {
  const schema = await resolveGraphQLSchema(ctx)
  const { introspectionFromSchema } = await import('graphql')
  const introspection = introspectionFromSchema(schema)
  return introspection
}
