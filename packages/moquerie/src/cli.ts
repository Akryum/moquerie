import { defineCommand, runMain } from 'citty'

const main = defineCommand({
  meta: {
    name: 'moquerie',
  },
  args: {
    uiPort: {
      description: 'Port to run the UI on',
    },
    open: {
      type: 'boolean',
      description: 'Open the UI in the browser',
    },
  },
  run: async ({ args }) => {
    const port = args.uiPort ? Number(args.uiPort) : undefined

    const { startAppServer } = await import('./appServer.js')
    const { default: colors } = await import('picocolors')

    const server = await startAppServer({
      port,
      open: args.open,
    })

    console.log(`GUI available at ${colors.blue(server.url)}`)
  },
})

runMain(main)
