import path from 'pathe'
import envPaths from 'env-paths'
import { getCwd, getProjectName } from '../util/env.js'

export function getLocalFolder() {
  const projectName = getProjectName()
  const paths = envPaths('moquerie')
  return path.join(paths.data, 'projects', projectName)
}

export function getLocalDbFolder() {
  return path.join(getLocalFolder(), 'db')
}

export function getRepositoryDbFolder() {
  const cwd = getCwd()
  return path.join(cwd, '.moquerie', 'db')
}
