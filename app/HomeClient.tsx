"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AlbumGridClient from "./AlbumGridClient";
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, Mousewheel, Parallax } from "swiper/modules";
import "swiper/css";
import "swiper/css/parallax";
import Link from "next/link";

type Album = {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl100?: string;
};

type Props = {
  albums: Album[];
};

export default function HomeClient({ albums }: Props) {
  const [view, setView] = useState<"grid" | "fullscreen">("grid");
  const heroImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (view !== "grid") return;

    let rafId = 0;
    const onScroll = () => {
      if (!heroImgRef.current) return;
      const y = window.scrollY;
      const offset = Math.round(y * 0.25);
      const scale = 1.04 + Math.min(0.08, y * 0.00015);
      heroImgRef.current.style.transform = `translate3d(0, ${offset}px, 0) scale(${scale})`;
      rafId = requestAnimationFrame(onScroll);
    };

    rafId = requestAnimationFrame(onScroll);
    return () => cancelAnimationFrame(rafId);
  }, [view]);

  const slides = useMemo(
    () =>
      albums.map((album) => {
        const artLarge =
          album.artworkUrl100?.replace("100x100", "1000x1000") ?? "";
        return { ...album, artLarge };
      }),
    [albums]
  );

  return (
    <div className="w-full">
      <div className="fixed left-4 top-4 z-50 sm:left-12 sm:top-12">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Flying Lotus Discography
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          History from 2026 to present
        </p>
      </div>

      <div className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/80 p-1 text-sm shadow-lg backdrop-blur sm:right-12 sm:top-12">
        <button
          type="button"
          onClick={() => {
            if (view === "grid") return;
            if ("startViewTransition" in document) {
              (document as Document & {
                startViewTransition?: (cb: () => void) => void;
              }).startViewTransition?.(() => setView("grid"));
            } else {
              setView("grid");
            }
          }}
          className={`rounded-full px-4 py-1.5 transition ${
            view === "grid"
              ? "bg-neutral-50 text-neutral-900"
              : "text-neutral-300 hover:text-neutral-50"
          }`}
        >
          Grid
        </button>
        <button
          type="button"
          onClick={() => {
            if (view === "fullscreen") return;
            if ("startViewTransition" in document) {
              (document as Document & {
                startViewTransition?: (cb: () => void) => void;
              }).startViewTransition?.(() => setView("fullscreen"));
            } else {
              setView("fullscreen");
            }
          }}
          className={`rounded-full px-4 py-1.5 transition ${
            view === "fullscreen"
              ? "bg-neutral-50 text-neutral-900"
              : "text-neutral-300 hover:text-neutral-50"
          }`}
        >
          Fullscreen
        </button>
      </div>

      {view === "grid" ? (
        <div className="w-full">
          <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
            <section className="relative h-[100dvh] w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={heroImgRef}
                src="/header.jpg"
                alt="Header"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-neutral-950/40" />
            </section>
          </div>
          <AlbumGridClient albums={albums} />
        </div>
      ) : (
        <div className="fixed inset-0 z-20 bg-neutral-950">
          <Swiper
            className="h-full w-full"
            slidesPerView={1}
            spaceBetween={0}
            speed={800}
            direction="vertical"
            keyboard={{ enabled: true }}
            mousewheel={{ forceToAxis: true, sensitivity: 1 }}
            parallax
            modules={[Keyboard, Mousewheel, Parallax]}
          >
            {slides.map((album) => (
              <SwiperSlide key={album.collectionId}>
                <Link
                  href={`/album/${album.collectionId}`}
                  className="relative flex h-full w-full items-center justify-center overflow-hidden"
                >
                  {album.artLarge ? (
                    <div
                      className="absolute inset-0 scale-105 bg-center bg-cover blur-lg brightness-50"
                      data-swiper-parallax="200"
                      style={{ backgroundImage: `url(${album.artLarge})` }}
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

                  <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-10 px-6">
                    <div
                      className="aspect-square w-64 overflow-hidden rounded-3xl border border-neutral-700 bg-black sm:w-72 lg:w-[420px]"
                      data-swiper-parallax="-120"
                    >
                      {album.artLarge ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={album.artLarge}
                          alt={`${album.collectionName} album art`}
                          className="h-full w-full object-cover opacity-80"
                        />
                      ) : null}
                    </div>
                  </div>
                  <h2
                    data-swiper-parallax="-400"
                    className="pointer-events-none absolute left-1/2 top-1/2 z-20 w-[90%] -translate-x-1/2 -translate-y-1/2 text-center font-semibold tracking-tight text-[7vw] leading-none text-neutral-50"
                  >
                    {album.collectionName}
                  </h2>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  );
}
