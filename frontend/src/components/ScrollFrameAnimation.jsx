'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_TOTAL_FRAMES = 150;

function toFramePath(frameName) {
  return `/frames/${frameName}`;
}

function getFrameNames(framePaths, totalFrames) {
  if (Array.isArray(framePaths) && framePaths.length > 0) {
    return framePaths;
  }

  return Array.from({ length: totalFrames }, (_, index) => `frame_${String(index + 1).padStart(3, '0')}.jpg`);
}

function getImageCoverRect(imageWidth, imageHeight, canvasWidth, canvasHeight) {
  const imageRatio = imageWidth / imageHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  let drawWidth = canvasWidth;
  let drawHeight = canvasHeight;
  let drawX = 0;
  let drawY = 0;

  if (imageRatio > canvasRatio) {
    drawHeight = canvasHeight;
    drawWidth = imageWidth * (canvasHeight / imageHeight);
    drawX = (canvasWidth - drawWidth) / 2;
  } else {
    drawWidth = canvasWidth;
    drawHeight = imageHeight * (canvasWidth / imageWidth);
    drawY = (canvasHeight - drawHeight) / 2;
  }

  return { drawX, drawY, drawWidth, drawHeight };
}

export function ScrollFrameAnimation({
  framePaths = [],
  totalFrames = DEFAULT_TOTAL_FRAMES,
  scrollHeight = '300vh',
  className = '',
}) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const framesRef = useRef([]);
  const frameIndexRef = useRef(-1);
  const scrollProgressRef = useRef(0);
  const lastDrawnFrameRef = useRef(-1);
  const rafRef = useRef(0);
  const resizeRafRef = useRef(0);
  const timelineRef = useRef(null);

  const resolvedFrameNames = useMemo(
    () => getFrameNames(framePaths, totalFrames),
    [framePaths, totalFrames]
  );

  useEffect(() => {
    if (!resolvedFrameNames.length) return;

    let cancelled = false;
    const loadedFrames = new Array(resolvedFrameNames.length);

    const preload = async () => {
      const firstWave = Math.min(24, resolvedFrameNames.length);

      const loadImage = (index) =>
        new Promise((resolve) => {
          const image = new Image();
          image.decoding = 'async';
          image.onload = () => resolve();
          image.onerror = () => resolve();
          image.src = toFramePath(resolvedFrameNames[index]);
          loadedFrames[index] = image;
        });

      for (let index = 0; index < firstWave; index += 1) {
        // eslint-disable-next-line no-await-in-loop
        await loadImage(index);
      }

      if (cancelled) return;

      framesRef.current = loadedFrames;

      for (let index = firstWave; index < resolvedFrameNames.length; index += 1) {
        // eslint-disable-next-line no-await-in-loop
        await loadImage(index);
      }
    };

    preload();

    return () => {
      cancelled = true;
    };
  }, [resolvedFrameNames]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section || !resolvedFrameNames.length) return undefined;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return undefined;

    const drawFrame = () => {
      const frameIndex = frameIndexRef.current;
      const image = framesRef.current[frameIndex];

      if (!image || !image.complete || !image.naturalWidth || !image.naturalHeight) return;

      lastDrawnFrameRef.current = frameIndex;

      const width = window.innerWidth;
      const height = window.innerHeight;
      const { drawX, drawY, drawWidth, drawHeight } = getImageCoverRect(
        image.naturalWidth,
        image.naturalHeight,
        width,
        height
      );

      context.clearRect(0, 0, width, height);
      context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    };

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawFrame();
    };

    const onResize = () => {
      window.cancelAnimationFrame(resizeRafRef.current);
      resizeRafRef.current = window.requestAnimationFrame(resizeCanvas);
    };

    resizeCanvas();

    timelineRef.current = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const progress = Math.min(Math.max(self.progress, 0), 1);
        const nextFrame = Math.min(
          resolvedFrameNames.length - 1,
          Math.floor(progress * (resolvedFrameNames.length - 1))
        );

        scrollProgressRef.current = progress;

        if (nextFrame !== frameIndexRef.current) {
          frameIndexRef.current = nextFrame;
        }
      },
    });

    window.addEventListener('resize', onResize);

    const tick = () => {
      if (frameIndexRef.current !== lastDrawnFrameRef.current) {
        drawFrame();
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', onResize);
      window.cancelAnimationFrame(rafRef.current);
      window.cancelAnimationFrame(resizeRafRef.current);
      if (timelineRef.current) {
        timelineRef.current.scrollTrigger?.kill();
        timelineRef.current.kill();
      }
    };
  }, [resolvedFrameNames]);

  return (
    <section
      ref={sectionRef}
      className={`relative w-full overflow-hidden bg-dark-950 ${className}`}
      style={{ minHeight: scrollHeight }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          style={{ pointerEvents: 'none' }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.18),transparent_32%),linear-gradient(180deg,rgba(2,6,23,0.2),rgba(2,6,23,0.88))]" />
      </div>
    </section>
  );
}

export default ScrollFrameAnimation;