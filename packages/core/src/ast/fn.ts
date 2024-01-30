/**
 * Get the AST node which is the value of the return statement of a function or arrow function.
 */
export function getReturnNode(node: any) {
  if (node.type === 'ArrowFunctionExpression') {
    const body = node.body
    if (body.type === 'ObjectExpression' || body.type === 'Identifier' || body.type === 'CallExpression') {
      return body
    }
    else if (body.type === 'BlockStatement') {
      const returnStatement = body.body.find((node: any) => node.type === 'ReturnStatement')
      if (!returnStatement) {
        throw new Error('No return statement found')
      }
      return returnStatement.argument
    }
    else {
      throw new Error('Unexpected arrow function body type')
    }
  }
  else if (node.type === 'FunctionExpression') {
    const body = node.body
    if (body.type === 'BlockStatement') {
      const returnStatement = body.body.find((node: any) => node.type === 'ReturnStatement')
      if (!returnStatement) {
        throw new Error('No return statement found')
      }
      return returnStatement.argument
    }
    else {
      throw new Error('Unexpected function body type')
    }
  }
  else {
    throw new Error('Unexpected node type, is not a function')
  }
}
