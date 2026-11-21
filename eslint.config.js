// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintConfigPrettier = require('eslint-config-prettier/flat');

module.exports = defineConfig([
  expoConfig,
  // Phải đứng SAU expoConfig: nó tắt các rule format của ESLint để Prettier toàn quyền.
  eslintConfigPrettier,
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*', 'expo-env.d.ts'],
  },
  {
    // Màu, cỡ chữ, độ đậm và bo góc lấy từ design token để đổi một chỗ là cả app theo, và để
    // dark mode không bị sót màu viết cứng. Chỉ constants/theme được khai báo giá trị gốc.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/constants/theme/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]',
          message: 'Dùng màu từ useTheme() hoặc @/constants/theme thay vì mã hex.',
        },
        {
          selector: 'Literal[value=/^rgba?\\(/]',
          message: 'Dùng màu từ useTheme() hoặc StaticColors thay vì rgb()/rgba().',
        },
        {
          selector: 'Property[key.name="fontSize"][value.type="Literal"]',
          message: 'Dùng FontSize.<token> (hoặc <AppText variant>) thay vì số.',
        },
        {
          selector: 'Property[key.name="fontWeight"][value.type="Literal"]',
          message: 'Dùng FontWeight.<token> (hoặc <AppText weight>) thay vì chuỗi.',
        },
        {
          selector:
            'Property[key.name=/^border(TopLeft|TopRight|BottomLeft|BottomRight)?Radius$/][value.type="Literal"]',
          message: 'Dùng Radius.<token> thay vì số.',
        },
      ],
    },
  },
]);
