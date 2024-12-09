import type { MoquerieInstance } from '../instance.js'
import type { ResourceSchema } from '../types/resource.js'
import fs from 'node:fs'
import { builders } from 'ast-types'
import path from 'pathe'
import { printCode } from '../ast/print.js'
import { hooks } from '../hooks.js'
import { getRepositoryDbFolder } from '../storage/path.js'
import { hashContent } from '../util/crypto.js'
import { ensureDir } from '../util/fs.js'
import { generateTsInterfaceFromResourceType } from './genInterface.js'

export async function generateTsTypes(mq: MoquerieInstance, schema: ResourceSchema) {
  const folder = path.join(getRepositoryDbFolder(mq), 'types')
  await ensureDir(folder)

  let shouldWriteDependentOnSchema = true

  // Schema
  {
    const interfaces = Object.values(schema.types).map(type => generateTsInterfaceFromResourceType(type))
    const exportedInterfaces = interfaces.map(i => builders.exportNamedDeclaration(i))
    const schemaProgram = builders.program(exportedInterfaces)
    let code = printCode(schemaProgram)
    const hash = hashContent(code)
    if (hash !== mq.data.fileHashes.tsCodegen.resources) {
      mq.data.fileHashes.tsCodegen.resources = hash
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
    else {
      shouldWriteDependentOnSchema = false
    }
  }

  // Query Manager
  if (shouldWriteDependentOnSchema) {
    const storedTypes = Object.values(schema.types).filter(type => !type.inline && !type.implementations?.length)

    const declaredModule = builders.tsModuleDeclaration(builders.stringLiteral('moquerie'), builders.tsModuleBlock([
      builders.exportNamedDeclaration(builders.tsInterfaceDeclaration(builders.identifier('QueryManagerProxy'), builders.tsInterfaceBody(
        storedTypes.map(type => builders.tsPropertySignature(
          builders.identifier(type.name),
          builders.tsTypeAnnotation(builders.tsTypeReference(builders.identifier('QueryManager'), builders.tsTypeParameterInstantiation([
            builders.tsTypeReference(builders.identifier(type.name)),
          ]))),
        )),
      ))),
    ]))
    declaredModule.declare = true // Add `declare` keyword before `module 'moquerie'`
    const program = builders.program([
      builders.importDeclaration([builders.importSpecifier(builders.identifier('QueryManager'))], builders.stringLiteral('moquerie')),
      builders.importDeclaration(storedTypes.map(type => builders.importSpecifier(builders.identifier(type.name))), builders.stringLiteral('./resources.js')),
      declaredModule,
    ])
    let code = printCode(program)
    const file = path.join(folder, 'queryManager.ts')

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
