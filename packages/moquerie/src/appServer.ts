import { handler } from '@moquerie/app'
import { listen, type Listener } from 'listhen'

export interface StartAppServerOptions {
  port?: number
  open?: boolean
}

export async function startAppServer(options: StartAppServerOptions): Promise<Listener> {
  const server = await listen(handler, {
    port: options.port,
    showURL: false,
    open: options.open,
  })

  return server
}
