// Tiny ID generator — no external dependency needed
export function nanoid(size = 21): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const array = new Uint8Array(size)
  crypto.getRandomValues(array)
  for (let i = 0; i < size; i++) {
    result += chars[array[i] % chars.length]
  }
  return result
}

export function shortCode(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  const array = new Uint8Array(length)
  if (typeof crypto !== 'undefined') {
    crypto.getRandomValues(array)
  } else {
    for (let i = 0; i < length; i++) array[i] = Math.floor(Math.random() * 256)
  }
  for (let i = 0; i < length; i++) {
    code += chars[array[i] % chars.length]
  }
  return code
}

