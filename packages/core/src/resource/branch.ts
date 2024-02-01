import path from 'pathe'
import { getLocalDbFolder } from '../storage/path.js'
import type { MoquerieInstance } from '../instance.js'
import { getCurrentBranch, resourceInstancesFolders } from './storage.js'

export function getCurrentBranchFolder(mq: MoquerieInstance) {
  return path.join(getLocalDbFolder(mq), ...resourceInstancesFolders, getCurrentBranch(mq))
}
