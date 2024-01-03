import fs from 'node:fs'
import path from 'pathe'
import { getLocalDbFolder } from '../storage/path.js'
import { copyDir, ensureDir } from '../util/fs.js'
import { getCurrentBranch, resourceInstancesFolders } from './storage.js'

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
export async function createBranch(options: CreateBranchOptions) {
  const folder = path.join(getLocalDbFolder(), ...resourceInstancesFolders, options.name)

  if (fs.existsSync(folder)) {
    throw new Error(`Branch ${options.name} already exists`)
  }

  await ensureDir(folder)

  if (!options.empty) {
    // Copy files from current branch
    const currentBranchFolder = path.join(getLocalDbFolder(), ...resourceInstancesFolders, getCurrentBranch())
    const newBranchFolder = path.join(getLocalDbFolder(), ...resourceInstancesFolders, options.name)
    await copyDir(currentBranchFolder, newBranchFolder)
  }
}
