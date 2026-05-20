import type { InjectionKey } from 'vue'

import type { ModalStore } from '@/stores/modal'

const ModalKey: InjectionKey<ModalStore> = Symbol('modalStore')
export default ModalKey
