import path from 'pathe'
import envPaths from 'env-paths'
import { getCwd, getProjectName } from '../util/env.js'

export function getLocalDbFolder() {
  const projectName = getProjectName()
  const paths = envPaths('moquerie')
  return path.join(paths.data, 'projects', projectName, 'db')
}

export function getRepositoryDbFolder() {
  const cwd = getCwd()
  return path.join(cwd, '.moquerie', 'db')
}
