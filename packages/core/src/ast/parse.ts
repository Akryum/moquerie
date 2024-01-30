import { parse } from 'recast'
import babelParser from '@babel/parser'
import type { namedTypes } from 'ast-types'

export function parseCode(code: string): namedTypes.File {
  return parse(code, {
    parser: babelParser,
  })
}
