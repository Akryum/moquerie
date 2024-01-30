import { print } from 'recast'

export function printCode(ast: any): string {
  return print(ast).code
}
