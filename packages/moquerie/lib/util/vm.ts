import vm from 'node:vm'

export function runValueCode(code: string, context?: Record<string, any>) {
  const lines = code.split('\n').map(line => line.trim()).filter(Boolean)
  // Add a return statement on last line if not present
  const lastLine = lines.at(-1)
  if (!lastLine?.startsWith('return ')) {
    lines[lines.length - 1] = `return ${lastLine}`
  }
  code = lines.join('\n')
  return vm.runInNewContext(`(() => {${code}})()`, context ?? {})
}
