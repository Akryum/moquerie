import type { FieldActionBaseDefinitions } from '@moquerie/core'

export function defineFieldActions<TActions extends FieldActionBaseDefinitions>(actions: TActions) {
  return {
    __fieldActions: actions,
  }
}
