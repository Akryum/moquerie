import path from 'pathe'
import envPaths from 'env-paths'
import { getProjectName } from '../util/env.js'
import type { MoquerieInstance } from '../instance.js'

export function getLocalFolder(mq: MoquerieInstance) {
  const projectName = getProjectName(mq)
  const paths = envPaths('moquerie')
  return path.join(paths.data, 'projects', projectName)
}

export function getLocalDbFolder(mq: MoquerieInstance) {
  return path.join(getLocalFolder(mq), 'db')
}

export function getRepositoryDbFolder(mq: MoquerieInstance) {
  return path.join(mq.data.cwd, '.moquerie')
}
