import antfu from '@antfu/eslint-config'

const config = await antfu({
  ignores: [
    '**/generated',
    '**/*.schema.json',
  ],
}, {
  rules: {
    curly: ['error', 'all'],
  },
})

export default config
