'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_TOTAL_FRAMES = 150;

function framePath(frameName: string) {
  return `/frames/${frameName}`;
}

function buildFrameList(framePaths: string[], totalFrames: number) {
  if (Array.isArray(framePaths) && framePaths.length > 0) {
    return framePaths;
  }

  return Array.from({ length: totalFrames }, (_, index) => `frame_${String(index + 1).padStart(3, '0')}.jpg`);
}

function getCoverRect(imageWidth: number, imageHeight: number, canvasWidth: number, canvasHeight: number) {
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

interface ScrollCanvasProps {
  framePaths?: string[];
  totalFrames?: number;
  scrollHeight?: string;
  className?: string;
  children?: React.ReactNode;
}

export function ScrollCanvas({
  framePaths = [],
  totalFrames = DEFAULT_TOTAL_FRAMES,
  scrollHeight = '400vh',
  className = '',
  children = null,
}: ScrollCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);

  const frameIndexRef = useRef(0);
  const lastDrawnFrameRef = useRef(-1);
  const rafRef = useRef(0);
  const resizeRafRef = useRef(0);
  const scrollTriggerRef = useRef<any>(null);

  const resolvedFrames = useMemo(() => buildFrameList(framePaths, totalFrames), [framePaths, totalFrames]);

  useEffect(() => {
    if (!resolvedFrames.length) return undefined;

    let cancelled = false;
    const loadedFrames = new Array(resolvedFrames.length);

    const preload = async () => {
      const initialBatch = Math.min(24, resolvedFrames.length);

      const loadFrame = (index: number) =>
        new Promise<void>((resolve) => {
          const image = new Image();
          image.decoding = 'async';
          image.onload = () => resolve();
          image.onerror = () => resolve();
          image.src = framePath(resolvedFrames[index]);
          loadedFrames[index] = image;
        });

      for (let index = 0; index < initialBatch; index += 1) {
        await loadFrame(index);
      }

      if (cancelled) return;

      framesRef.current = loadedFrames;

      for (let index = initialBatch; index < resolvedFrames.length; index += 1) {
        await loadFrame(index);
      }
    };

    preload();

    return () => {
      cancelled = true;
    };
  }, [resolvedFrames]);

  useEffect(() => {
    const container = containerRef.current;
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const content = contentRef.current;
    if (!container || !section || !canvas || !resolvedFrames.length) return undefined;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return undefined;

    const drawFrame = () => {
      const image = framesRef.current[frameIndexRef.current];
      if (!image || !image.complete || !image.naturalWidth || !image.naturalHeight) return;

      const width = window.innerWidth;
      const height = window.innerHeight;
      const { drawX, drawY, drawWidth, drawHeight } = getCoverRect(
        image.naturalWidth,
        image.naturalHeight,
        width,
        height
      );

      context.clearRect(0, 0, width, height);
      context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
      lastDrawnFrameRef.current = frameIndexRef.current;
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

    const syncFromScroll = (progress: number) => {
      const safeProgress = Math.min(Math.max(progress, 0), 1);
      frameIndexRef.current = Math.min(
        resolvedFrames.length - 1,
        Math.floor(safeProgress * (resolvedFrames.length - 1))
      );

      // Fade out content only at the very end of the sequence to avoid empty space
      if (content) {
        // Starts fading out at 80% progress, completely hidden at 100%
        const fadeStart = 0.8;
        let opacity = 1;
        if (safeProgress > fadeStart) {
          opacity = 1 - ((safeProgress - fadeStart) / (1 - fadeStart));
        }
        
        const scale = 1 - safeProgress * 0.05;
        const blur = safeProgress > fadeStart ? ((safeProgress - fadeStart) / (1 - fadeStart)) * 8 : 0;
        
        content.style.opacity = Math.max(0, opacity).toString();
        content.style.transform = `scale(${scale})`;
        content.style.filter = `blur(${blur}px)`;
        content.style.visibility = opacity <= 0 ? 'hidden' : 'visible';
      }
    };

    const onResize = () => {
      window.cancelAnimationFrame(resizeRafRef.current);
      resizeRafRef.current = window.requestAnimationFrame(resizeCanvas);
    };

    resizeCanvas();

    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      pin: section,
      scrub: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        syncFromScroll(self.progress);
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
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }
    };
  }, [resolvedFrames]);

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: scrollHeight }}>
      <section ref={sectionRef} className={`relative h-screen w-full overflow-hidden bg-slate-950 ${className}`}>
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ pointerEvents: 'none' }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,6,23,0.35),rgba(2,6,23,0.82)),radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_42%)]" />
        {children ? (
          <div ref={contentRef} className="absolute inset-0 z-20 transition-all duration-75 ease-out will-change-[opacity,transform,filter]">
            {children}
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default ScrollCanvas;