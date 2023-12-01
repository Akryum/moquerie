import antfu from '@antfu/eslint-config'

export default await antfu({
  ignores: [
    '**/generated/',
  ],
  rules: {
    curly: ['error', 'all'],
  },
})
