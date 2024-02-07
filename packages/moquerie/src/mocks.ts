import type { FieldActionBaseDefinitions, ResourceFactoryFn, ResourceFactoryInfo, SchemaTransformAction, ScriptFn, ScriptItem } from '@moquerie/core'

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

export type ScriptOption = ScriptFn | {
  description?: string
  fn: ScriptFn
}

export function defineScripts(scripts: Record<string, ScriptOption>) {
  const list: Array<Omit<ScriptItem, 'file'>> = []
  for (const id in scripts) {
    const value = scripts[id]
    const item: Omit<ScriptItem, 'file'> = typeof value === 'function' ? { id, fn: value } : { id, ...value }
    list.push(item)
  }
  return {
    __scripts: list,
  }
}

export function defineFactory<TInfo extends ResourceFactoryInfo, TFn extends ResourceFactoryFn>(info: TInfo, fn: TFn) {
  return {
    info,
    fn,
  }
}
