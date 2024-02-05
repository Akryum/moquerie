import type { FieldActionBaseDefinitions, ResourceFactoryFn, ResourceFactoryInfo, SchemaTransformAction } from '@moquerie/core'

export function defineFieldActions<TActions extends FieldActionBaseDefinitions>(actions: TActions) {
  return {
    __fieldActions: actions,
  }
}

export function defineSchemaTransforms(handlers: SchemaTransformAction | Array<SchemaTransformAction>) {
  return {
    __schemaTransforms: handlers,
  }
}

export function defineFactory<TInfo extends ResourceFactoryInfo, TFn extends ResourceFactoryFn>(info: TInfo, fn: TFn) {
  return {
    info,
    fn,
  }
}
