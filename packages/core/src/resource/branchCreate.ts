import fs from 'node:fs'
import path from 'pathe'
import { getLocalDbFolder } from '../storage/path.js'
import { copyDir, ensureDir } from '../util/fs.js'
import type { MoquerieInstance } from '../instance.js'
import { resourceInstancesFolders } from './storage.js'
import { getCurrentBranchFolder } from './branch.js'

export interface CreateBranchOptions {
  /**
   * Branch name.
   */
  name: string
  /**
   * If true, the new branch will be empty.
   * Otherwise, it will be a copy of the current branch.
   */
  empty: boolean
}

/**
 * Create a new branch. Does NOT switch to it.
 */
export async function createBranch(mq: MoquerieInstance, options: CreateBranchOptions) {
  const folder = path.join(getLocalDbFolder(mq), ...resourceInstancesFolders, options.name)

  if (fs.existsSync(folder)) {
    throw new Error(`Branch ${options.name} already exists`)
  }

  await ensureDir(folder)

  if (!options.empty) {
    // Copy files from current branch
    const currentBranchFolder = getCurrentBranchFolder(mq)
    const newBranchFolder = path.join(getLocalDbFolder(mq), ...resourceInstancesFolders, options.name)
    await copyDir(currentBranchFolder, newBranchFolder)
  }
}
