import type { Config } from 'tailwindcss'

/**
 * Sistema de diseño de Emplea Humboldt.
 * Tokens reconstruidos a partir de las clases usadas en la app
 * (brand-*, surface-*, ink-*, semantic-*, border default/subtle).
 */
const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Marca
        'brand-blue': '#2563eb',
        'brand-blue-dark': '#1d4ed8',
        'brand-red': '#dc2626',

        // Superficies
        'surface-1': '#f8fafc',
        'surface-2': '#ffffff',
        'surface-3': '#f1f5f9',

        // Texto
        'ink-primary': '#0f172a',
        'ink-secondary': '#334155',
        'ink-tertiary': '#64748b',
        'ink-muted': '#94a3b8',

        // Bordes
        'default': '#e2e8f0',
        'subtle': '#f1f5f9',

        // Semánticos
        'semantic-error': '#dc2626',
        'semantic-error-bg': '#fef2f2',
        'semantic-error-border': '#fecaca',
        'semantic-success': '#16a34a',
        'semantic-success-bg': '#f0fdf4',
        'semantic-warning': '#d97706',
        'semantic-warning-bg': '#fffbeb',
        'semantic-info': '#2563eb',
        'semantic-info-bg': '#eff6ff',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      borderColor: {
        DEFAULT: '#e2e8f0',
      },
    },
  },
  plugins: [],
}

export default config
