import type { InjectionKey } from 'vue'

import type { GameStore } from '@/stores/game'

const GameKey: InjectionKey<GameStore> = Symbol('gameStore')
export default GameKey
