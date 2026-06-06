import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
      }
    },
    rules: {
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'default',
          format: ['camelCase']
        },
        {
          selector: ['class', 'interface', 'typeAlias', 'enum', 'enumMember'],
          format: ['PascalCase']
        },
        {
          selector: 'variable',
          modifiers: ['const'],
          format: ['camelCase', 'UPPER_CASE', 'PascalCase']
        },
        {
          selector: 'classProperty',
          format: ['camelCase'],
          leadingUnderscore: 'allow'
        }
      ],
      curly: 'warn',
      eqeqeq: 'warn',
      'no-throw-literal': 'warn',
      semi: 'off'
    }
  },
  {
    ignores: [
      'out/**',
      'dist/**',
      '**/*.d.ts'
    ]
  }
];
