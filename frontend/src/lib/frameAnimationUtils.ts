// Frame animation utilities
export const FRAME_CONFIG = {
  frameDir: '/frames',
};

// Get frame image path
export const getFramePath = (frameName: string): string => {
  return `${FRAME_CONFIG.frameDir}/${frameName}`;
};

// Preload images for smooth playback
export const preloadImages = async (frameNames: string[]): Promise<void> => {
  const promises = frameNames.map(
    (name) =>
      new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = getFramePath(name);
      })
  );

  await Promise.all(promises);
};

// Get frame number from scroll progress (0 to 1)
export const getFrameFromScroll = (scrollProgress: number, totalFrames: number): number => {
  const frameNumber = Math.floor(scrollProgress * totalFrames);
  return Math.min(frameNumber, totalFrames - 1);
};

// Calculate scroll progress for element
export const calculateScrollProgress = (element: HTMLElement): number => {
  const elementTop = element.getBoundingClientRect().top;
  const elementHeight = element.offsetHeight;
  const viewportHeight = window.innerHeight;

  // Calculate progress: 0 when element top is at bottom of viewport, 1 when bottom is at top
  const distanceFromBottom = elementTop + elementHeight;
  const progress = 1 - distanceFromBottom / (viewportHeight + elementHeight);

  return Math.max(0, Math.min(1, progress));
};

// Animation sections configuration
export const ANIMATION_SECTIONS = {
  hero: {
    startFrame: 0,
    endFrame: 30,
    description: 'Takeoff',
  },
  cruising: {
    startFrame: 30,
    endFrame: 90,
    description: 'Cruising',
  },
  landing: {
    startFrame: 90,
    endFrame: 120,
    description: 'Landing',
  },
};

// Get current section from frame
export const getCurrentSection = (frameNumber: number) => {
  if (frameNumber < ANIMATION_SECTIONS.cruising.startFrame) {
    return 'hero';
  } else if (frameNumber < ANIMATION_SECTIONS.landing.startFrame) {
    return 'cruising';
  } else {
    return 'landing';
  }
};
