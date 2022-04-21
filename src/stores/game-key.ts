import { InjectionKey } from 'vue'

import { GameStore } from '@/stores/game'

const GameKey: InjectionKey<GameStore> = Symbol('gameStore')
export default GameKey
