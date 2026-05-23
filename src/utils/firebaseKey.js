const INVALID_KEY_CHARS = new RegExp('[.#$\\[\\]/]', 'g')

export const safeFirebaseKey = (value) =>
  String(value ?? '')
    .trim()
    .replace(INVALID_KEY_CHARS, '_')
