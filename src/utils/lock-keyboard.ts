import { NavigatorExtend } from '@/types/interfaces'

export default function lockKeyboard() {
  const navigatorExtend = navigator as NavigatorExtend
  if ('keyboard' in navigatorExtend && 'lock' in navigatorExtend.keyboard) {
    navigatorExtend.keyboard.lock()
  }
}
