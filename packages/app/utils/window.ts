export function onWindowFocus(cb: () => unknown) {
  useEventListener('focus', cb)
}
