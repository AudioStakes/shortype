import { InjectionKey } from 'vue'

import { ModalStore } from '@/stores/modal'

const ModalKey: InjectionKey<ModalStore> = Symbol('modalStore')
export default ModalKey
