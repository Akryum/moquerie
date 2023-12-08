import type { ResourceFactory } from '~/types/factory.js'

export type FactoryData = Omit<ResourceFactory, 'id' | 'createdAt' | 'lastUsedAt'>
