const windowFocusHook = createEventHook<void>()

useEventListener('focus', () => {
  windowFocusHook.trigger()
})

export const onWindowFocus = windowFocusHook.on
