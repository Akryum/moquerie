import type { MoquerieInstance } from '../instance.js'
import fs from 'node:fs'
import path from 'pathe'
import { getLocalDbFolder } from '../storage/path.js'
import { getCurrentBranch, resourceInstancesFolders } from './storage.js'

export function getCurrentBranchFolder(mq: MoquerieInstance) {
  return path.join(getLocalDbFolder(mq), ...resourceInstancesFolders, getCurrentBranch(mq))
}

export async function renameBranch(mq: MoquerieInstance, branch: string, newName: string) {
  if (branch === 'default') {
    throw new Error('Cannot rename default branch')
  }

  if (branch === getCurrentBranch(mq)) {
    throw new Error(`Cannot rename current branch (${getCurrentBranch(mq)})`)
  }

  const branchFolder = path.join(getLocalDbFolder(mq), ...resourceInstancesFolders, branch)
  if (!fs.existsSync(branchFolder)) {
    throw new Error(`Branch ${branch} does not exist`)
  }

  const newBranchFolder = path.join(getLocalDbFolder(mq), ...resourceInstancesFolders, newName)
  if (fs.existsSync(newBranchFolder)) {
    throw new Error(`Branch ${newName} already exists`)
  }

  await fs.promises.rename(branchFolder, newBranchFolder)
}
