import { fixupPluginRules } from '@eslint/compat'
import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import importX from 'eslint-plugin-import-x'
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import type { Plugin } from '@eslint/core'
import type { Linter } from 'eslint'


const sharedRules: Linter.RulesRecord = {
  quotes: ['error', 'single'],
  semi: ['error', 'never'],
  'prefer-arrow-callback': 'error',
  'func-style': ['error', 'expression'],
  'import/order': [
    'error',
    {
      groups: [
        'builtin',
        'external',
        ['internal', 'parent', 'sibling', 'index'],
        'type',
      ],
      'newlines-between': 'always',
      alphabetize: { order: 'asc', caseInsensitive: true },
    },
  ],
  '@typescript-eslint/no-explicit-any': 'warn',
}

export default defineConfig(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      'apps/frontend/.react-router',
      'apps/frontend/app/components/ui',
      'apps/frontend/app/lib/utils',
    ],
  },

  // shared TS setup, needed by both subtrees for tsconfig discovery
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // ---- Backend ----
  {
    files: ['apps/backend/**/*.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    plugins: {
      import: importX,
      'no-relative-import-paths': fixupPluginRules(noRelativeImportPaths),
    },
    settings: {
      'import-x/resolver': {
        typescript: true,
      },
    },
    rules: {
      ...sharedRules,
      'no-relative-import-paths/no-relative-import-paths': [
        'warn',
        { allowSameFolder: true, rootDir: 'src', prefix: '#' },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*'],
              message: 'Use the "#..." import instead of relative parent imports.',
            },
          ],
        },
      ],
    },
  },

  // ---- Frontend ----
  {
    files: ['apps/frontend/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks as unknown as Plugin,
      'react-refresh': reactRefresh,
      import: importX,
      'no-relative-import-paths': fixupPluginRules(noRelativeImportPaths),
    },
    settings: {
      'import-x/resolver': {
        typescript: true,
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
          allowExportNames: [
            'loader',
            'action',
            'meta',
            'links',
            'headers',
            'shouldRevalidate',
            'handle',
            'ErrorBoundary',
            'HydrateFallback',
            'clientLoader',
            'clientAction',
            'clientMiddleware',
            'unstable_middleware',
          ],
        },
      ],
      ...sharedRules,
      'no-relative-import-paths/no-relative-import-paths': [
        'error',
        { allowSameFolder: true, rootDir: 'app', prefix: '@' },
      ],
    },
  },

  // ---- Shared types package ----
  {
    files: ['packages/types/**/*.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    plugins: {
      import: importX,
      'no-relative-import-paths': fixupPluginRules(noRelativeImportPaths),
    },
    settings: {
      'import-x/resolver': {
        typescript: true,
      },
    },
    rules: {
      ...sharedRules,
      'no-relative-import-paths/no-relative-import-paths': [
        'warn',
        { allowSameFolder: true, rootDir: 'src' },
      ],
    },
  },

  eslintConfigPrettier
)
