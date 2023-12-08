import fs from 'node:fs'
import path from 'pathe'

export function findUp(cwd: string, fileNames: string[]): string | null {
  let { root } = path.parse(cwd)
  let dir = cwd

  // On Windows, it will for example return `C:`, we need to add the trailing `/`
  if (root[1] === ':' && root[2] === undefined) {
    root += '/'
  }

  while (dir !== root) {
    for (const fileName of fileNames) {
      const searchPath = path.join(dir, fileName)
      if (fs.existsSync(searchPath)) {
        return searchPath
      }
    }
    dir = path.dirname(dir)
  }

  return null
}
