const safeParse = (value, fallback) => {
  if (!value) return fallback
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

export const storage = {
  get(key, fallback) {
    return safeParse(window.localStorage.getItem(key), fallback)
  },
  set(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value))
  },
  remove(key) {
    window.localStorage.removeItem(key)
  },
}
