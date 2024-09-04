export interface UseQueueOptions {
  /**
   * Delay between each queue calls (in ms)
   */
  delay?: number
}

export function useQueue(options: UseQueueOptions) {
  const queued = new Map<string, (() => Promise<void>) | null>()
  const processing = new Set<string>()

  function queue(key: string, callback: () => Promise<void>) {
    const alreadyQueued = queued.has(key)
    queued.set(key, callback)
    if (alreadyQueued) {
      return
    }
    next(key)
  }

  function next(key: string) {
    if (options.delay) {
      setTimeout(() => {
        run(key)
      }, options.delay)
    }
    else {
      run(key)
    }
  }

  function run(key: string) {
    const callback = queued.get(key)
    if (callback) {
      processing.add(key)
      queued.delete(key)
      callback().finally(() => {
        processing.delete(key)
        if (queued.has(key)) {
          next(key)
        }
      })
    }
  }

  return {
    queue,
    get size() {
      return queued.size
    },
    get busy() {
      return queued.size > 0 || processing.size > 0
    },
  }
}
