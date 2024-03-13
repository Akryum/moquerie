import fs from 'node:fs'
import path from 'pathe'
import { builders } from 'ast-types'
import type { MoquerieInstance } from '../instance.js'
import { printCode } from '../ast/print.js'
import { getRepositoryDbFolder } from '../storage/path.js'
import { ensureDir } from '../util/fs.js'
import type { ResourceSchema } from '../types/resource.js'
import { hooks } from '../hooks.js'
import { generateTsInterfaceFromResourceType } from './genInterface.js'

export async function generateTsTypes(mq: MoquerieInstance, schema: ResourceSchema) {
  const folder = path.join(getRepositoryDbFolder(mq), 'types')
  await ensureDir(folder)

  // Schema
  {
    const interfaces = Object.values(schema.types).map(type => generateTsInterfaceFromResourceType(type))
    const exportedInterfaces = interfaces.map(i => builders.exportNamedDeclaration(i))
    const schemaProgram = builders.program(exportedInterfaces)
    let code = printCode(schemaProgram)
    const file = path.join(folder, 'resources.ts')

    try {
      await hooks.callHookWith(async (cbs) => {
        for (const cb of cbs) {
          const result = await cb({ path: file, code, type: 'types' })
          if (typeof result === 'string') {
            code = result
          }
        }
      }, 'writeCode')
    }
    catch (error: any) {
      console.error(`Error in plugin hook "writeCode" (types) (${file})`, error.stack ?? error)
    }

    await fs.promises.writeFile(file, code, 'utf-8')
  }
}
