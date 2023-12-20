import envinfo from 'envinfo'
import { getLocalDbFolder, getRepositoryDbFolder, resolveConfig } from '@moquerie/core'
import { getCwd, getProjectName } from '@moquerie/core/util'

export default defineEventHandler(async () => {
  let config: any
  try {
    config = await resolveConfig()
  }
  catch (e) {
    config = e
  }

  return {
    cwd: getCwd(),
    projectName: getProjectName(),
    envinfo: JSON.parse(await envinfo.run({
      System: ['OS', 'CPU', 'Memory', 'Shell'],
      Binaries: ['Node', 'Yarn', 'npm', 'pnpm'],
      Browsers: ['Chrome', 'Firefox', 'Safari'],
      npmPackages: ['moquerie'],
    }, {
      json: true,
      showNotFound: true,
    })),
    config,
    db: {
      localPath: getLocalDbFolder(),
      repositoryPath: getRepositoryDbFolder(),
    },
  }
})
