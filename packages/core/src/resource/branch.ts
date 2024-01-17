import path from 'pathe'
import { getLocalDbFolder } from '../storage/path.js'
import { getCurrentBranch, resourceInstancesFolders } from './storage.js'

export function getCurrentBranchFolder() {
  return path.join(getLocalDbFolder(), ...resourceInstancesFolders, getCurrentBranch())
}
