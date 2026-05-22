const createChannel = (name) => {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
    return null
  }
  return new BroadcastChannel(name)
}

const syncChannel = createChannel('trible-sync')

export const emitSync = (type, payload = {}) => {
  if (!syncChannel) return
  syncChannel.postMessage({ type, payload, ts: Date.now() })
}

export const onSync = (handler) => {
  if (!syncChannel) return () => {}
  const listener = (event) => handler(event.data)
  syncChannel.addEventListener('message', listener)
  return () => syncChannel.removeEventListener('message', listener)
}
