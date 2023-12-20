import fs from 'node:fs/promises'

export default defineEventHandler(async (event) => {
  const configFile = await findConfigFile()

  if (configFile) {
    const { source } = await readBody(event)
    await fs.writeFile(configFile, source, 'utf-8')
  }
})
