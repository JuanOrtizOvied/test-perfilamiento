import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import importX from 'eslint-plugin-import-x'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import { globalIgnores } from 'eslint/config'

export default tseslint.config(
  globalIgnores(['dist', 'coverage', 'node_modules']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      importX.flatConfigs.recommended,
      importX.flatConfigs.typescript,
      reactRefresh.configs.vite,
    ],
    plugins: {
      // react-hooks@7 ships its preset in legacy (eslintrc) shape, so we wire
      // the plugin + its stable rule names manually for flat config.
      'react-hooks': reactHooks,
    },
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    settings: {
      'import-x/resolver-next': [
        // Both leaf projects: the app (src) and the suite (tests). The root
        // tsconfig only holds `references`, so it cannot resolve on its own.
        createTypeScriptImportResolver({
          project: ['./tsconfig.app.json', './tsconfig.test.json'],
          noWarnOnMultipleProjects: true,
        }),
      ],
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // Anti-cycle guarantee (see README §imports). Absolute @/* aliases are
      // resolved via the TypeScript resolver above, so cycles through
      // @/packages/design are detected too.
      'import-x/no-cycle': ['error', { maxDepth: Infinity }],
      // CSS side-effect imports are resolved by Vite, not by the TS resolver.
      'import-x/no-unresolved': ['error', { ignore: ['\\.css$'] }],
    },
  },
  {
    // shadcn-generated primitives export component variants (e.g. buttonVariants)
    // alongside the component; fast-refresh granularity is irrelevant for these.
    files: ['src/packages/design/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
)
