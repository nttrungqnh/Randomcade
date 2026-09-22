import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const legacySession = (selectedTheme: 'arcade' | 'wheel') => JSON.stringify({
  version: 1,
  state: { session: { selectedTheme, teams: [
    { name: 'Đội Minh', participants: [{ name: 'Minh' }, { name: 'Hà' }] },
    { participants: [{ name: 'Tuấn' }, { name: 'Linh' }] },
  ] } },
})

describe('independent Lucky Wheel configuration', () => {
  beforeEach(() => {
    vi.resetModules()
    const values = new Map<string, string>()
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    }
    vi.stubGlobal('localStorage', storage)
    vi.stubGlobal('window', { localStorage: storage })
  })

  afterEach(() => vi.unstubAllGlobals())

  it('does not import or overwrite Team Draw data', async () => {
    const original = legacySession('arcade')
    localStorage.setItem('randomshow-session', original)
    const { useWheelConfigStore } = await import('./wheelConfigStore')
    expect(useWheelConfigStore.getState().optionsText).toBe('')
    useWheelConfigStore.getState().setOptionsText('Một\nHai')
    expect(localStorage.getItem('randomshow-session')).toBe(original)
    expect(JSON.parse(localStorage.getItem('randomshow-wheel-config')!).state.optionsText).toBe('Một\nHai')
  })

  it('recovers a legacy wheel list without discarding pair names', async () => {
    localStorage.setItem('randomshow-session', legacySession('wheel'))
    const { useWheelConfigStore } = await import('./wheelConfigStore')
    expect(useWheelConfigStore.getState().optionsText).toBe('Đội Minh\nTuấn × Linh')
  })

  it('keeps an explicitly emptied wheel list instead of restoring a legacy session', async () => {
    localStorage.setItem('randomshow-session', legacySession('wheel'))
    localStorage.setItem('randomshow-wheel-config', JSON.stringify({ version: 1, state: { optionsText: '', soundOn: false, selectedSound: 'lottery' } }))
    const { useWheelConfigStore } = await import('./wheelConfigStore')
    expect(useWheelConfigStore.getState().optionsText).toBe('')
    expect(useWheelConfigStore.getState().soundOn).toBe(false)
    expect(useWheelConfigStore.getState().selectedSound).toBe('lottery')
  })

  it('preserves all nonblank entries so an over-limit list can be corrected', async () => {
    const { parseWheelOptions } = await import('./wheelConfigStore')
    expect(parseWheelOptions('  Minh \r\n\n Hà  ')).toEqual(['Minh', 'Hà'])
    expect(parseWheelOptions(Array.from({ length: 33 }, (_, index) => `Tên ${index}`).join('\n'))).toHaveLength(33)
  })
})
