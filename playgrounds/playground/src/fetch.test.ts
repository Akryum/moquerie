import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { MoquerieInstance } from 'moquerie'
import { createTestInstance, startServer } from 'moquerie'

describe('fetch', () => {
  let mq: MoquerieInstance
  let port: number

  beforeEach(async () => {
    mq = await createTestInstance({}, {
      snapshot: 'vitest',
    })
    // await useSnapshot(mq, 'vitest')
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

  it('should fetch REST API', async () => {
    {
      const response = await fetch(`http://localhost:${port}/rest/my-object`)
      const data = await response.json()
      expect(data).toEqual({ data: [] })
    }
    await fetch(`http://localhost:${port}/rest/my-object`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: 'abc',
        name: 'cat',
        count: 42,
      }),
    })
    const response = await fetch(`http://localhost:${port}/rest/my-object`)
    const data = await response.json()
    expect(data).toEqual({
      data: [
        {
          __typename: 'MyObject',
          id: 'abc',
          name: 'cat',
          count: 42,
        },
      ],
    })
  })
})
