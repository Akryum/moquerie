import vm from 'node:vm'
import fs from 'node:fs'
import { nanoid } from 'nanoid'
import { getResolvedContext } from '../context.js'
import type { DefineFactoryReturn, ResourceFactory, ResourceFactoryFn, ResourceFactoryInfo } from '../types/factory.js'
import { createResourceInstance } from '../resource/createInstance.js'
import { executeFactory } from './execute.js'

export interface CreateInstanceFromFactoryOptions {
  factory: ResourceFactory
  inlineCode?: string
  save: boolean
}

export async function createInstanceFromFactory(options: CreateInstanceFromFactoryOptions) {
  const ctx = await getResolvedContext()
  const { factory } = options

  let fn: ResourceFactoryFn

  if (!options.inlineCode && factory.location === 'local') {
    options.inlineCode = await fs.promises.readFile(factory.file, 'utf8')
    options.inlineCode = options.inlineCode.replace(/import /g, '// import ')
  }

  if (options.inlineCode) {
    let code = options.inlineCode
    code = code.replace(/export default /g, '_exports.default = ')
    code = code.replace(/export (const )?/g, '_exports.')
    const _exports: any = {}
    vm.runInNewContext(code, {
      _exports,
      defineFactory: (info: ResourceFactoryInfo, fn: ResourceFactoryFn) => ({
        info,
        fn,
      }),
    })
    fn = _exports.default.fn
  }
  else {
    const mod = await ctx.jiti(factory.file)
    const defaultExport = (mod.default ?? mod) as DefineFactoryReturn

    if (!defaultExport) {
      throw new Error(`Invalid factory file ${factory.file} - missing default export`)
    }
    if (!defaultExport.info || !defaultExport.fn) {
      throw new Error(`Invalid factory file ${factory.file} - missing info or fn - did you forget to call defineFactory?`)
    }
    fn = defaultExport.fn
  }

  const id = nanoid()
  const data = await executeFactory(factory, fn, id)

  const instance = options.save
    ? await ctx.db[factory.resourceName].createInstance(data, {
      id,
      tags: [...(factory.info.applyTags ?? [])],
      comment: factory.info.applyComment,
    })
    : await createResourceInstance({
      id: 'preview',
      resourceName: factory.resourceName,
      value: data,
      tags: [...(factory.info.applyTags ?? [])],
      comment: factory.info.applyComment,
      save: false,
    })

  return instance
}
