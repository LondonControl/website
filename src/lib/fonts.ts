import localFont from 'next/font/local';

export const inter = localFont({
  src: [
    {
      path: '../../public/assets/fonts/Inter/Inter-Thin.woff2',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/Inter/Inter-ExtraLight.woff2',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/Inter/Inter-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/Inter/Inter-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/Inter/Inter-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/Inter/Inter-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/Inter/Inter-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/Inter/Inter-ExtraBold.woff2',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/Inter/Inter-Black.woff2',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-inter',
});

export const jetbrainsMono = localFont({
  src: [
    {
      path: '../../public/assets/fonts/JetBrains-Mono/JetBrainsMono-Thin.woff2',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/JetBrains-Mono/JetBrainsMono-ExtraLight.woff2',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/JetBrains-Mono/JetBrainsMono-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/JetBrains-Mono/JetBrainsMono-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/JetBrains-Mono/JetBrainsMono-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/JetBrains-Mono/JetBrainsMono-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/JetBrains-Mono/JetBrainsMono-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/JetBrains-Mono/JetBrainsMono-ExtraBold.woff2',
      weight: '800',
      style: 'normal',
    },
  ],
  variable: '--font-jetbrains-mono',
});
