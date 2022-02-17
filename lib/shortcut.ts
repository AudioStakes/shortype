export default interface Shortcut {
  action: string;
  altKey: boolean;
  app: string;
  category: string;
  ctrlKey: boolean;
  isAvailable: boolean;
  key: string | undefined;
  metaKey: boolean;
  os: string;
  shiftKey: boolean;
  shortcut: string;
}
