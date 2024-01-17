import antfu from '@antfu/eslint-config'

const config = await antfu({
  ignores: [
    '**/generated',
  ],
}, {
  rules: {
    curly: ['error', 'all'],
  },
})

export default config
