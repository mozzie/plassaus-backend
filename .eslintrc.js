module.exports = {
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars-experimental': 'error',
    'import/no-cycle': 'off', // TypeORM relations need this?
  },
  plugins: [
    'jest'
  ],
  extends: [
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking'
    ],
  parserOptions: {
    project: './tsconfig.json',
  },
  env: {
    jest: true,
    'jest/globals': true
  }
};
