const formatKeyName = (word: string) =>
  word.charAt(0).toUpperCase() + injectLineBreak(word.slice(1))

const injectLineBreak = (word: string) => word.replaceAll(/([A-Z])/g, '\n$1')

export default formatKeyName
