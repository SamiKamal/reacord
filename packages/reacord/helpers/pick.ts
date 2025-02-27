import type { LoosePick, UnknownRecord } from "./types"

// eslint-disable-next-line import/no-unused-modules
export function pick<T, K extends keyof T | PropertyKey>(
  object: T,
  keys: K[],
): LoosePick<T, K> {
  const result: any = {}
  for (const key of keys) {
    const value = (object as UnknownRecord)[key]
    if (value !== undefined) {
      result[key] = value
    }
  }
  return result
}
