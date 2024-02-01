import type { MoquerieInstance } from '@moquerie/core'

let mq: MoquerieInstance

export function getMq() {
  return mq
}

export function setMq(newMq: MoquerieInstance) {
  mq = newMq
}
