import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors.js'
import defaultTheme from 'tailwindcss/defaultTheme.js'

export default <Partial<Config>>{
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans', ...defaultTheme.fontFamily.sans],
        mono: ['Noto Sans Mono', ...defaultTheme.fontFamily.mono],
      },
      colors: {
        primary: colors.violet,
      },
    },
  },
}
