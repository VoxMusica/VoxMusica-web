import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import importX from 'eslint-plugin-import-x'
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths'
import tseslint from 'typescript-eslint'

export default defineConfig(
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    plugins: {
      import: importX,
      'no-relative-import-paths': noRelativeImportPaths,
    },
    settings: {
      'import-x/resolver': {
        typescript: true
      }
    },
    rules: {
      // style preferences
      quotes: ['error', 'single'],
      semi: ['error', 'never'],
      'prefer-arrow-callback': 'error',
      'func-style': ['error', 'expression'],

      // import ordering
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            ['internal', 'parent', 'sibling', 'index'],
            'type'
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true }
        }
      ],

      // 'no-relative-import-paths/no-relative-import-paths': [
      //   'error',
      //   { allowSameFolder: true, rootDir: 'src', prefix: '#' }
      // ],

      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*'],
              message: 'Use the "#..." import instead of relative parent imports.'
            }
          ]
        }
      ],

      // TS-aware equivalents
      '@typescript-eslint/no-explicit-any': 'warn'
    },
  },
  eslintConfigPrettier, 
)
