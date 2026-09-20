export interface RandomSource {
  nextInt(maxExclusive: number): number
}

/** Cryptographically backed integer without modulo bias. */
export function secureRandomInt(maxExclusive: number): number {
  const limit = Math.floor(maxExclusive)
  if (!Number.isFinite(limit) || limit <= 0) return 0

  const cryptoApi = globalThis.crypto
  if (!cryptoApi?.getRandomValues) throw new Error('Secure randomness is unavailable in this environment.')

  const values = new Uint32Array(1)
  const range = 0x1_0000_0000
  const cutoff = range - (range % limit)
  do {
    cryptoApi.getRandomValues(values)
  } while (values[0] >= cutoff)
  return values[0] % limit
}

export const secureRandomSource: RandomSource = { nextInt: secureRandomInt }
