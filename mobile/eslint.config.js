import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    plugins: {
      react: {},
      'react-native': {}
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        __DEV__: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        jest: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        test: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        global: 'readonly',
        setImmediate: 'readonly',
        fetch: 'readonly'
      },
      parserOptions: {
        ecmaFeatures: { jsx: true }
      }
    },
    rules: {
    //   'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],  // temporarily disabled
    'no-unused-vars': 'off',  
    'no-console': 'off',
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-native/no-unused-styles': 'off',
      'react-native/split-platform-components': 'off',
      'react-native/no-inline-styles': 'off',
      'react-native/no-color-literals': 'off'
    },
    settings: {
      react: { version: 'detect' }
    }
  },
  {
    ignores: ['dist/', 'node_modules/', 'coverage/', 'android/', 'ios/']
  }
];
