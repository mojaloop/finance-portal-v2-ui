module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: '16.13',
    },
  },
  plugins: ['react', '@typescript-eslint', 'prettier'],
  extends: [
    'airbnb-typescript',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint',
  ],
  env: {
    browser: true,
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'all',
      },
    ],
    'react/prop-types': [
      1,
      {
        ignore: ['context', 'tracking'],
      },
    ],
    'react/display-name': 'off',
    'import/prefer-default-export': 'off',
    'import/no-named-as-default': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/jsx-boolean-value': 'off',
    'react/prop-types': 'off',
    'react/no-unescaped-entities': 'off',
    'react/jsx-one-expression-per-line': 'off',
    'react/jsx-wrap-multilines': 'off',
    'react/destructuring-assignment': 'off',
    // TODO:
    // > Configuration for rule "max-len" is invalid:
    // > Severity should be one of the following: 0 = off, 1 = warn, 2 = error (you passed '{ code: 100 }').
    'max-len': [1, 100, 2],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'react/prop-types': 'off',
      },
    },
  ],
};
