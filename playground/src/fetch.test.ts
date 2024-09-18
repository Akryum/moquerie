import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { MoquerieInstance } from 'moquerie'
import { createMoquerieInstance, startServer, useSnapshot } from 'moquerie'

describe('fetch', () => {
  let mq: MoquerieInstance
  let port: number

  beforeEach(async () => {
    mq = await createMoquerieInstance({
      cwd: process.cwd(),
      skipWrites: true,
      watching: false,
    })

    await useSnapshot(mq, 'vitest')

    const result = await startServer(mq)
    port = result.port
  })

  afterEach(async () => {
    await mq.destroy()
  })

  it('should fetch hello', async () => {
    const response = await fetch(`http://localhost:${port}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query {
            hello
          }
        `,
      }),
    })
    const data = await response.json()
    expect(data).toEqual({
      data: {
        hello: 'villa',
      },
    })
  })

  it('should fetch manyHellos', async () => {
    const response = await fetch(`http://localhost:${port}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query {
            manyHellos
            manyHellosCount
          }
        `,
      }),
    })
    const data = await response.json()
    expect(data).toEqual({
      data: {
        manyHellosCount: 3,
        manyHellos: [
          'succedo',
          'comparo',
          'denego',
        ],
      },
    })
  })
})
