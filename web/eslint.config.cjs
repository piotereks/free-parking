// Minimal ESLint flat config to satisfy ESLint v9+ requirement
module.exports = [
  {
    ignores: ["node_modules/**", "parking-deploy/**"]
  },
  {
    files: ["**/*.{js,jsx,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
        ecmaFeatures: { jsx: true }
      },
      globals: {
        React: "readonly",
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        fetch: "readonly",
        URLSearchParams: "readonly",
        console: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        navigator: "readonly",
        globalThis: "readonly",
        __dirname: "readonly",
        process: "readonly"
      }
    },
    rules: {
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "no-undef": "error"
    }
  }
];
