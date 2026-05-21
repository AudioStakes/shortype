import { createContext } from 'preact'

import type { GameStore } from '@/stores/game'

const GameKey = createContext<GameStore | undefined>(undefined)
export default GameKey
