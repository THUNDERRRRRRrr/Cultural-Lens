export function useReducedMotion() {
  // Detect if device is likely mid-range mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const isLowEnd = typeof navigator !== 'undefined' && navigator.hardwareConcurrency <= 4;
  return isMobile && isLowEnd;
}
