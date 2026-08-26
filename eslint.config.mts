// @ts-check

import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier/flat'

export default defineConfig(
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [tseslint.configs.recommended],
    rules: {
      quotes: ['error', 'single'],
      semi: ['error', 'never'],
      'prefer-arrow-callback': 'error',
    },
  },
  eslintConfigPrettier, 
)
