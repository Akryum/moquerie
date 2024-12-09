import type { namedTypes } from 'ast-types'
import babelParser from '@babel/parser'
import { parse } from 'recast'

export function parseCode(code: string): namedTypes.File {
  return parse(code, {
    parser: babelParser,
  })
}
