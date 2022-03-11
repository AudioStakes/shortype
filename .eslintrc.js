module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        'plugin:vue/vue3-recommended',
        "plugin:vue/essential",
        "plugin:@typescript-eslint/recommended"
    ],
    "parser": "vue-eslint-parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "parser": "@typescript-eslint/parser",
        "sourceType": "module",
        'extraFileExtensions': [
            '.vue',
        ],
    },
    "plugins": [
        "vue",
        "@typescript-eslint"
    ],
    "rules": {
        "vue/multi-word-component-names": ["error", {
            "ignores": ["Header", "Footer"]
        }]
    }
}
