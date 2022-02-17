import KeyboardLayoutMap from './keyboardLayoutMap'

export default interface Keyboard {
  getLayoutMap(): Promise<KeyboardLayoutMap>
};
