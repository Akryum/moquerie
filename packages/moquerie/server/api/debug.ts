import envinfo from 'envinfo'
import { resolveConfig } from '~/lib/config.js'
import { getLocalDbFolder, getRepositoryDbFolder } from '~/lib/db/path.js'
import { getCwd, getProjectName } from '~/lib/util/env.js'

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
