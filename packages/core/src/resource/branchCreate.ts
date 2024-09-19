import fs from 'node:fs'
import path from 'pathe'
import { nanoid } from 'nanoid'
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

  if (!mq.data.skipWrites) {
    await ensureDir(folder)
  }

  if (!options.empty) {
    // Copy files from current branch
    if (mq.data.skipWrites) {
      throw new Error('Cannot copy files from current branch in read-only mode')
    }
    const currentBranchFolder = getCurrentBranchFolder(mq)
    const newBranchFolder = path.join(getLocalDbFolder(mq), ...resourceInstancesFolders, options.name)
    await copyDir(currentBranchFolder, newBranchFolder)
  }
}

/**
 * Creates an empty branch with a random name.
 */
export async function createEmptyBranch(mq: MoquerieInstance) {
  return createBranch(mq, {
    name: `test-${nanoid()}`,
    empty: true,
  })
}
