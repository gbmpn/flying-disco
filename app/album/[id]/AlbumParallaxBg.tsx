"use client";

import { useEffect, useRef } from "react";

type Props = {
  src?: string;
};

export default function AlbumParallaxBg({ src }: Props) {
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) return;

    let rafId = 0;
    const update = () => {
      const y = window.scrollY;
      if (imgRef.current) {
        const offset = Math.round(y * 0.12);
        imgRef.current.style.transform = `translate3d(0, ${offset}px, 0) scale(1.08)`;
      }
      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, [src]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover blur-3xl brightness-50"
        />
      ) : null}
      <div className="absolute inset-0 bg-neutral-950/70" />
    </div>
  );
}
