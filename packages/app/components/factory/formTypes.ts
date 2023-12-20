import type { ResourceFactory } from '@moquerie/core'

export type FactoryData = Omit<ResourceFactory, 'id' | 'createdAt' | 'lastUsedAt'>
