import type { MoquerieInstance } from '../instance.js'
import envPaths from 'env-paths'
import path from 'pathe'
import { getProjectName } from '../util/env.js'

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
