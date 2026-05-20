# Context

Shortype is a shortcut key training app.

## Domain Terms

- **App**: one training target such as Google Chrome, Terminal (macOS), or macOS.
- **Shortcut**: one action shown to the learner, with one or more valid key combinations.
- **Shortcut catalog**: the full set of shortcuts available for an app.
- **Training session**: the active loop where one shortcut is shown, input is judged, and the next shortcut is chosen.
- **Selected app**: the app currently used for training.
- **Selected categories**: the category set currently used for training.
- **Available shortcut**: a shortcut that can be trained normally.
- **Removed shortcut**: a shortcut placed into the "do not ask" list.
- **Answered history**: the record of correct and incorrect answers for each shortcut.
- **Mastered**: a shortcut whose recent answer weight is low enough to count as learned.
- **Mastered rate**: the percentage of mastered shortcuts within an app or category.
- **Self-scoring**: the flow where a learner checks the answer and marks it correct or wrong manually.
- **Fill-in-the-blank mode**: the mode used when the shortcut description contains mouse actions, other actions, or undetectable keys.
- **Fullscreen-only shortcut**: a shortcut that can only be judged correctly while fullscreen mode is active.

## Vocabulary Rules

- Prefer **tool** over **app** when talking about the training target.
- Prefer **removed shortcut** or **do not ask list** over raw storage key names.
- Prefer **training session** over the Vue store name when talking about behavior and rules.
- Prefer **mastered rate** over implementation details like weights.
