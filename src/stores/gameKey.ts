import { InjectionKey } from 'vue'
import { GameStore } from './game'

const GameKey: InjectionKey<GameStore> = Symbol('gameStore')
export default GameKey
