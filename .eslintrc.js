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
    'react/require-default-props': 'off',
    'max-len': ['warn', {
      code: 120,
      ignoreUrls: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreRegExpLiterals: true,
      ignoreComments: true,
    }],
    'no-console': ['warn', { allow: ['error'] }],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
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
