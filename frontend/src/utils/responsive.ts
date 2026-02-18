import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width } = useWindowDimensions();

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  return {
    isMobile,
    isTablet,
    isDesktop,
    contentMaxWidth: isDesktop ? 800 : isTablet ? 700 : undefined,
    modalMaxWidth: 480,
    horizontalPadding: isDesktop ? 32 : 16,
    width,
  };
}
