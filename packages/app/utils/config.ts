const configChangeHook = createEventHook()

export const onConfigChange = configChangeHook.on

export const triggerConfigChange = configChangeHook.trigger
