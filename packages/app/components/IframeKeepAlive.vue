<script lang="ts">
const iframes = new Map<string, { iframe: HTMLIFrameElement, src: string }>()
</script>

<script lang="ts" setup>
defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  id: string
  src: string
  class?: any
  iframeClass?: any
}>()

const attrs = useAttrs()

const wrapper = ref<HTMLDivElement>()

const iframe = shallowRef<HTMLIFrameElement | undefined>()

const bounds = useElementBounding(wrapper)

watchEffect(() => {
  if (iframe.value) {
    iframe.value.style.top = `${bounds.top.value}px`
    iframe.value.style.left = `${bounds.left.value}px`
    iframe.value.style.width = `${bounds.width.value}px`
    iframe.value.style.height = `${bounds.height.value}px`
  }
})

onMounted(() => {
  const saved = iframes.get(props.id)
  iframe.value = saved?.iframe
  if (!iframe.value) {
    iframe.value = document.createElement('iframe')
    iframe.value.style.position = 'fixed'
    iframe.value.src = props.src
    iframe.value.classList.add('w-full', 'h-full', 'border-0')

    if (props.iframeClass) {
      if (typeof props.iframeClass === 'string') {
        iframe.value.classList.add(...props.iframeClass.split(/\s+/))
      }
      else {
        iframe.value.classList.add(...props.iframeClass)
      }
    }

    for (const [key, value] of Object.entries(attrs)) {
      iframe.value.setAttribute(key, String(value))
    }
    iframes.set(props.id, { iframe: iframe.value, src: props.src })
    document.body.appendChild(iframe.value)
  }
  else if (props.src !== saved?.src) {
    iframe.value.src = props.src
  }
  iframe.value.style.display = 'block'
})

onBeforeUnmount(() => {
  if (iframe.value) {
    iframe.value.style.display = 'none'
  }
})
</script>

<template>
  <div ref="wrapper" :class="props.class" />
</template>
