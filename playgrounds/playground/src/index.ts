import { createServer } from 'node:http'
import { createYoga } from 'graphql-yoga'
import { getContext } from './context.js'
import { schema } from './schema.js'

// Create a Yoga instance with a GraphQL schema.
const yoga = createYoga({
  schema,
  context: getContext,
})

// Pass it into a server to hook into request handlers.
const server = createServer(yoga)

// Start the server and you're done!
server.listen(4000, () => {
  // eslint-disable-next-line no-console
  console.info('Server is running on http://localhost:4000/graphql')
})
