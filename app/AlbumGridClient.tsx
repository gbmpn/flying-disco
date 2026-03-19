"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from 'next/link'

type Album = {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl100?: string;
};

type Props = {
  albums: Album[];
};

function getColumnCount(width: number) {
  if (width >= 1024) return 4;
  if (width >= 640) return 3;
  if (width >= 520) return 2;
  return 1;
}

export default function AlbumGridClient({ albums }: Props) {
  const [columnCount, setColumnCount] = useState(1);
  const columnRefs = useRef<Array<HTMLDivElement | null>>([]);
  const offsetsRef = useRef<number[]>([]);
  const lastScrollY = useRef(0);
  const isScrollingRef = useRef(false);
  const scrollTimeout = useRef<number | null>(null);

  useEffect(() => {
    // Keep the column count in sync with the viewport width.
    const updateColumns = () => {
      setColumnCount(getColumnCount(window.innerWidth));
    };
    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  const columns = useMemo(() => {
    const cols: Album[][] = Array.from({ length: columnCount }, () => []);
    albums.forEach((album, index) => {
      cols[index % columnCount].push(album);
    });
    return cols;
  }, [albums, columnCount]);

  useEffect(() => {
    // Reset per-column offsets whenever the number of columns changes.
    offsetsRef.current = Array.from({ length: columnCount }, () => 0);
  }, [columnCount]);

  useEffect(() => {
    // Track scroll deltas to drive the elastic offset for each column.
    const speedsBase = [1.35, 1.2, 1.08, 1.0];

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;
      lastScrollY.current = y;
      isScrollingRef.current = true;

      const offsets = offsetsRef.current;
      for (let i = 0; i < offsets.length; i += 1) {
        const speed = speedsBase[i] ?? speedsBase[speedsBase.length - 1];
        offsets[i] += delta * (speed - 1);
      }

      if (scrollTimeout.current) {
        window.clearTimeout(scrollTimeout.current);
      }
      scrollTimeout.current = window.setTimeout(() => {
        isScrollingRef.current = false;
      }, 120);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollTimeout.current) {
        window.clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    // Animation loop: apply spring physics and push transforms to the DOM.
    let rafId = 0;
    const spring = () => {
      const offsets = offsetsRef.current;
      for (let i = 0; i < offsets.length; i += 1) {
        // Spring back to 0 for elastic catch-up when scrolling stops.
        const pull = isScrollingRef.current ? 0.02 : 0.16;
        offsets[i] += (0 - offsets[i]) * pull;
        offsets[i] *= isScrollingRef.current ? 0.985 : 0.86;

        const el = columnRefs.current[i];
        if (el) {
          el.style.transform = `translate3d(0, ${offsets[i].toFixed(
            2
          )}px, 0)`;
        }
      }
      rafId = requestAnimationFrame(spring);
    };
    rafId = requestAnimationFrame(spring);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <section className="grid w-full grid-cols-1 gap-5 pt-[150px] sm:grid-cols-3 lg:grid-cols-4">
      {columns.map((column, colIndex) => (
        <div
          key={`col-${colIndex}`}
          ref={(el) => {
            columnRefs.current[colIndex] = el;
          }}
          className="flex min-w-0 flex-col gap-5"
        >
          {column.map((album) => {
            const art =
              album.artworkUrl100?.replace("100x100", "300x300") ?? "";
            return (
              <Link
                key={album.collectionId}
                href={`/album/${album.collectionId}`}
                className="group rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 transition hover:border-neutral-600 hover:bg-neutral-900"
              >
                <div className="aspect-square w-full overflow-hidden rounded-lg bg-neutral-800">
                  {art ? (
                    <img
                      src={art}
                      alt={`${album.collectionName} album art`}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">
                      No artwork
                    </div>
                  )}
                </div>
                <p className="mt-3 text-xs uppercase tracking-wide text-neutral-400">
                  {album.artistName}
                </p>
                <p className="mt-1 line-clamp-2 text-sm font-medium">
                  {album.collectionName}
                </p>
              </Link>
            );
          })}
        </div>
      ))}
    </section>
  );
}
