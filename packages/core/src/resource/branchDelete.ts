import type { MoquerieInstance } from '../instance.js'
import fs from 'node:fs'
import path from 'pathe'
import { getLocalDbFolder } from '../storage/path.js'
import { getCurrentBranch, resourceInstancesFolders } from './storage.js'

/**
 * Delete a branch. Will throw if attempting to delete the current branch or the 'default' branch.
 */
export async function deleteBranch(mq: MoquerieInstance, name: string) {
  if (name === 'default') {
    throw new Error('Cannot delete default branch')
  }

  if (name === getCurrentBranch(mq)) {
    throw new Error(`Cannot delete current branch (${getCurrentBranch(mq)})`)
  }

  const branchFolder = path.join(getLocalDbFolder(mq), ...resourceInstancesFolders, name)
  if (!fs.existsSync(branchFolder)) {
    throw new Error(`Branch ${name} does not exist`)
  }

  await fs.promises.rm(branchFolder, { recursive: true })
}
