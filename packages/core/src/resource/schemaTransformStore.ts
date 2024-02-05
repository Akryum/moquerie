import { MockFileHandler } from '../mock/mockFileHandler.js'
import type { SchemaTransform } from '../types/resource.js'

export class SchemaTransformStore extends MockFileHandler<SchemaTransform> {
  constructor() {
    super('__schemaTransforms')
  }

  add(file: string, data: any): void {
    if (Array.isArray(data)) {
      for (const transform of data) {
        this.items.push({
          file,
          action: transform,
        })
      }
    }
    else {
      this.items.push({
        file,
        action: data,
      })
    }
  }
}
