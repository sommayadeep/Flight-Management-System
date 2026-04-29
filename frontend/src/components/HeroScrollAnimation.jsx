'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_TOTAL_FRAMES = 150;
const HERO_SCROLL_DISTANCE = '+=300%';

function buildFramePath(frameName) {
  return `/frames/${frameName}`;
}

function buildFrameList(framePaths, totalFrames) {
  if (Array.isArray(framePaths) && framePaths.length > 0) {
    return framePaths;
  }

  return Array.from({ length: totalFrames }, (_, index) => `frame_${String(index + 1).padStart(3, '0')}.jpg`);
}

function getCoverRect(imageWidth, imageHeight, canvasWidth, canvasHeight) {
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

export default function HeroScrollAnimation({ framePaths = [], totalFrames = DEFAULT_TOTAL_FRAMES }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const contentRef = useRef(null);
  const transitionRef = useRef(null);
  const frameBadgeRef = useRef(null);
  const progressBadgeRef = useRef(null);
  const framesRef = useRef([]);
  const frameIndexRef = useRef(0);
  const lastDrawnFrameRef = useRef(-1);
  const rafRef = useRef(0);
  const resizeRafRef = useRef(0);
  const scrollTriggerRef = useRef(null);

  const resolvedFrameNames = useMemo(() => buildFrameList(framePaths, totalFrames), [framePaths, totalFrames]);

  useEffect(() => {
    if (!resolvedFrameNames.length) return undefined;

    let cancelled = false;
    const loadedFrames = new Array(resolvedFrameNames.length);

    const preloadFrames = async () => {
      const batchSize = Math.min(24, resolvedFrameNames.length);

      const loadFrame = (index) =>
        new Promise((resolve) => {
          const image = new Image();
          image.decoding = 'async';
          image.onload = () => resolve();
          image.onerror = () => resolve();
          image.src = buildFramePath(resolvedFrameNames[index]);
          loadedFrames[index] = image;
        });

      for (let index = 0; index < batchSize; index += 1) {
        // eslint-disable-next-line no-await-in-loop
        await loadFrame(index);
      }

      if (cancelled) return;

      framesRef.current = loadedFrames;

      for (let index = batchSize; index < resolvedFrameNames.length; index += 1) {
        // eslint-disable-next-line no-await-in-loop
        await loadFrame(index);
      }
    };

    preloadFrames();

    return () => {
      cancelled = true;
    };
  }, [resolvedFrameNames]);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas || !resolvedFrameNames.length) return undefined;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return undefined;

    const updateChrome = (progress, frameIndex) => {
      if (contentRef.current) {
        contentRef.current.style.opacity = `${Math.max(1 - progress * 0.85, 0.16)}`;
        contentRef.current.style.transform = `translate3d(0, ${progress * -42}px, 0) scale(${1 - progress * 0.03})`;
        contentRef.current.style.filter = `blur(${progress * 1.5}px)`;
      }

      if (transitionRef.current) {
        transitionRef.current.style.opacity = `${Math.min(Math.max((progress - 0.52) / 0.48, 0), 1)}`;
        transitionRef.current.style.transform = `translate3d(0, ${18 - progress * 28}px, 0)`;
        transitionRef.current.style.filter = `blur(${Math.max(12 - progress * 16, 0)}px)`;
      }

      if (frameBadgeRef.current) {
        frameBadgeRef.current.textContent = `Frame ${frameIndex + 1} / ${resolvedFrameNames.length}`;
      }

      if (progressBadgeRef.current) {
        progressBadgeRef.current.textContent = `${Math.round(progress * 100)}%`;
      }

      canvas.style.opacity = `${Math.max(1 - progress * 0.55, 0.28)}`;
    };

    const drawFrame = () => {
      const frameIndex = frameIndexRef.current;
      const image = framesRef.current[frameIndex];

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
      lastDrawnFrameRef.current = frameIndex;
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

    const setProgressFromScroll = (progress) => {
      const safeProgress = Math.min(Math.max(progress, 0), 1);
      const nextFrame = Math.min(
        resolvedFrameNames.length - 1,
        Math.floor(safeProgress * (resolvedFrameNames.length - 1))
      );

      frameIndexRef.current = nextFrame;
      updateChrome(safeProgress, nextFrame);
    };

    resizeCanvas();
    setProgressFromScroll(0);

    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: HERO_SCROLL_DISTANCE,
      pin: true,
      scrub: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        setProgressFromScroll(self.progress);
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
  }, [resolvedFrameNames]);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden bg-dark-950">
      <div className="relative h-screen overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          style={{ pointerEvents: 'none' }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.20),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.10),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.15),rgba(2,6,23,0.9))]" />

        <div
          ref={contentRef}
          className="absolute inset-0 z-20 flex items-center justify-center px-4 text-center transition-[opacity,transform,filter] duration-200"
          style={{ transformStyle: 'preserve-3d', willChange: 'opacity, transform, filter' }}
        >
          <div className="max-w-5xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-cyan-200 backdrop-blur-md">
              3D Scroll Flight Command
            </div>
            <h1 className="text-5xl font-bold leading-tight text-white md:text-7xl">
              Real-Time Flight
              <br />
              <span className="bg-gradient-to-r from-aviation-300 via-cyan-300 to-aviation-500 bg-clip-text text-transparent">
                Management System
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 md:text-2xl">
              Experience the future of aviation control with real-time tracking,
              predictive analytics, and cinematic storytelling.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <button className="rounded-xl bg-gradient-to-r from-aviation-500 to-cyan-500 px-8 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition-transform hover:scale-105">
                Start Tracking
              </button>
              <button className="rounded-xl border border-cyan-300/40 px-8 py-3 font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/10">
                Learn More
              </button>
            </div>

            <div className="mt-12 flex flex-col items-center gap-3 text-xs uppercase tracking-[0.35em] text-slate-400">
              <span ref={frameBadgeRef}>Frame 1 / {resolvedFrameNames.length}</span>
              <div className="h-px w-28 bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
              <span ref={progressBadgeRef}>0%</span>
            </div>
          </div>
        </div>

        <div
          ref={transitionRef}
          className="absolute inset-0 z-30 flex items-end justify-center px-4 pb-10 opacity-0 transition-[opacity,transform,filter] duration-200"
          style={{ willChange: 'opacity, transform, filter' }}
        >
          <div className="w-full max-w-4xl rounded-[2rem] border border-white/10 bg-slate-950/65 p-6 text-left text-white shadow-2xl backdrop-blur-2xl md:p-8">
            <div className="text-xs uppercase tracking-[0.35em] text-cyan-300">Transition</div>
            <div className="mt-3 grid gap-5 md:grid-cols-[1.1fr_0.9fr] md:items-center">
              <div>
                <h2 className="text-3xl font-bold md:text-4xl">From takeoff to operations.</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
                  The frame sequence fades out as the operational dashboard fades in,
                  keeping the page continuous and preventing hard section breaks.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-cyan-300">Pin</div>
                  <div className="mt-1">300vh scroll</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-cyan-300">Sync</div>
                  <div className="mt-1">Frame by frame</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-cyan-300">Flow</div>
                  <div className="mt-1">No blank gaps</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-cyan-300">UI</div>
                  <div className="mt-1">Fade handoff</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
