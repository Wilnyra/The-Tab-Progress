const UUID_BYTES = 16
const VERSION_BYTE = 6
const VARIANT_BYTE = 8

const toHex = (byte: number): string => byte.toString(16).padStart(2, '0')

export const createUuid = (): string => {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const bytes = crypto.getRandomValues(new Uint8Array(UUID_BYTES))
  bytes[VERSION_BYTE] = ((bytes[VERSION_BYTE] ?? 0) & 0x0f) | 0x40
  bytes[VARIANT_BYTE] = ((bytes[VARIANT_BYTE] ?? 0) & 0x3f) | 0x80
  const hex = Array.from(bytes, toHex).join('')
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join('-')
}
