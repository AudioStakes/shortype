import { createContext } from 'preact'

import type { ModalStore } from '@/stores/modal'

const ModalKey = createContext<ModalStore | undefined>(undefined)
export default ModalKey
