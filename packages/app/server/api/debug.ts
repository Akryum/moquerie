import { getLocalDbFolder, getRepositoryDbFolder, resolveConfig } from '@moquerie/core'
import { getProjectName } from '@moquerie/core/util'
import envinfo from 'envinfo'

export default defineEventHandler(async () => {
  const mq = getMq()
  let config: any
  try {
    config = await resolveConfig(mq.data.cwd)
  }
  catch (e) {
    config = e
  }

  return {
    cwd: mq.data.cwd,
    projectName: getProjectName(mq),
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
      localPath: getLocalDbFolder(mq),
      repositoryPath: getRepositoryDbFolder(mq),
    },
  }
})
