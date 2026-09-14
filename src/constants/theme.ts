/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#17211B',
    background: '#F7F8F3',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E2F3E8',
    textSecondary: '#667069',
    primary: '#16794B',
    primarySoft: '#DDF2E5',
    accent: '#F3A83B',
    border: '#E2E7E2',
    danger: '#C44636',
  },
  dark: {
    text: '#F4F7F4',
    background: '#101713',
    backgroundElement: '#19231D',
    backgroundSelected: '#243C2D',
    textSecondary: '#AAB7AE',
    primary: '#5BD08B',
    primarySoft: '#203D2B',
    accent: '#F2B85E',
    border: '#2A382F',
    danger: '#FF8A78',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
