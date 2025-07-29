module.exports = [
    {
      files: ['**/*.ts'],
      languageOptions: {
        parser: require('@typescript-eslint/parser'),
        parserOptions: {
          project: './tsconfig.json',
        },
      },
      plugins: {
        '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      },
      rules: {
        // Aturan dasar, bisa disesuaikan
        'no-unused-vars': 'warn',
        '@typescript-eslint/no-unused-vars': 'warn',
      },
    },
  ];