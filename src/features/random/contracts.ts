import type { DrawResult } from '../../types/models'

/**
 * Random engines decide outcomes. They must not contain presentation concerns.
 */
export interface RandomEngine {
  drawNext(): DrawResult | null
}

/**
 * Themes present an outcome that has already been decided by a random engine.
 */
export interface ResultPresenter {
  present(result: DrawResult): void | Promise<void>
}
