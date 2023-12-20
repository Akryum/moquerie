import path from 'pathe'
import { loadTypedefs } from '@graphql-tools/load'
import { mergeSchemas } from '@graphql-tools/schema'
import type { Source, TypeSource } from '@graphql-tools/utils'
import type { GraphQLSchema, IntrospectionQuery } from 'graphql'
import type { Context } from '../context.js'
import { getCwd } from '../util/env.js'

async function resolveGraphQLTypeDefs(ctx: Context): Promise<Source[]> {
  if (!ctx.config.graphql?.schema) {
    throw new Error('[moquerie] config.graphql.schema is required')
  }

  let target: string
  const loaders = []

  if ('url' in ctx.config.graphql.schema) {
    target = ctx.config.graphql.schema.url
    const Loader = (await import('@graphql-tools/url-loader')).UrlLoader
    loaders.push(new Loader())
  }
  else if ('jsonFile' in ctx.config.graphql.schema) {
    target = ctx.config.graphql.schema.jsonFile
    const Loader = (await import('@graphql-tools/json-file-loader')).JsonFileLoader
    loaders.push(new Loader())
  }
  else if ('graphqlFiles' in ctx.config.graphql.schema) {
    target = ctx.config.graphql.schema.graphqlFiles
    const Loader = (await import('@graphql-tools/graphql-file-loader')).GraphQLFileLoader
    loaders.push(new Loader())
  }
  else if ('scanCodeFiles' in ctx.config.graphql.schema) {
    target = ctx.config.graphql.schema.scanCodeFiles
    const Loader = (await import('@graphql-tools/code-file-loader')).CodeFileLoader
    loaders.push(new Loader())
  }
  else {
    throw new Error('[moquerie] config.graphql.schema must be one of url, jsonFile, graphqlFiles, or scanCodeFiles')
  }

  const typeDefs = await loadTypedefs(path.resolve(getCwd(), target), {
    loaders,
  })
  return typeDefs
}

function getSchemaFromTypeDefs(sources: Source[]) {
  if (
    sources.length === 1
    && sources[0].schema != null
  ) {
    return sources[0].schema
  }
  const { typeDefs } = collectSchemaParts(sources)

  const schema = mergeSchemas({
    typeDefs,
  })

  return schema
}

function collectSchemaParts(sources: Source[]) {
  const typeDefs: TypeSource[] = []

  for (const source of sources) {
    if (source.schema) {
      typeDefs.push(source.schema)
    }
    else {
      const typeDef = source.document || source.rawSDL
      if (typeDef) {
        typeDefs.push(typeDef)
      }
    }
  }

  return {
    typeDefs,
  }
}

async function getGraphQLSchemaIntrospection(schema: GraphQLSchema) {
  const { introspectionFromSchema } = await import('graphql')
  const introspection = introspectionFromSchema(schema)
  return introspection
}

export interface ResolvedGraphQLSchema {
  typeDefs: Source[]
  schema: GraphQLSchema
  introspection: IntrospectionQuery
}

export async function resolveGraphQLSchema(ctx: Context): Promise<ResolvedGraphQLSchema> {
  const typeDefs = await resolveGraphQLTypeDefs(ctx)
  const schema = getSchemaFromTypeDefs(typeDefs)
  const introspection = await getGraphQLSchemaIntrospection(schema)
  return {
    typeDefs,
    schema,
    introspection,
  }
}
