"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AlbumResult = {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl100?: string;
  artworkUrl600?: string;
  trackCount?: number;
  collectionViewUrl?: string;
};

type TrackResult = {
  trackId: number;
  trackName: string;
  trackNumber?: number;
  trackTimeMillis?: number;
  previewUrl?: string;
};

type Props = {
  album: AlbumResult;
  tracks: TrackResult[];
};

function formatDuration(ms?: number) {
  if (!ms) return "";
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function AlbumClient({ album, tracks }: Props) {
  const art =
    album.artworkUrl600 ??
    album.artworkUrl100?.replace("100x100", "600x600") ??
    "";

  const playableTracks = useMemo(
    () => tracks.filter((track) => Boolean(track.previewUrl)),
    [tracks]
  );

  const [currentTrackId, setCurrentTrackId] = useState<number | null>(
    playableTracks[0]?.trackId ?? null
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = useMemo(
    () => tracks.find((track) => track.trackId === currentTrackId) ?? null,
    [currentTrackId, tracks]
  );

  useEffect(() => {
    // Auto-load the selected preview when the track changes.
    if (!audioRef.current) return;
    if (!currentTrack?.previewUrl) return;
    audioRef.current.load();
    audioRef.current.play().catch(() => {
      // Autoplay might be blocked; controls remain available.
    });
  }, [currentTrack?.previewUrl]);

  return (
    <div className="grid w-full min-w-0 gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-8">
      <aside className="w-full min-w-0 h-fit rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 sm:p-5 lg:sticky lg:top-6">
        <div className="mx-auto aspect-square w-full max-w-[260px] overflow-hidden rounded-xl bg-neutral-800 sm:max-w-none">
          {art ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={art}
              alt={`${album.collectionName} album art`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">
              No artwork
            </div>
          )}
        </div>
        <p className="mt-4 text-xs uppercase tracking-wide text-neutral-400">
          {album.artistName}
        </p>
        <h1 className="mt-1 text-xl font-semibold leading-tight">
          {album.collectionName}
        </h1>
        {album.trackCount ? (
          <p className="mt-2 text-sm text-neutral-400">
            {album.trackCount} tracks
          </p>
        ) : null}
        {album.collectionViewUrl ? (
          <a
            className="mt-4 inline-block text-sm text-neutral-200 underline underline-offset-4"
            href={album.collectionViewUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open in iTunes
          </a>
        ) : null}
      </aside>

      <section className="w-full min-w-0 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 sm:p-5">
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-400">
            Now Playing
          </p>
          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm text-neutral-400">{album.artistName}</p>
              <p className="truncate text-lg font-semibold">
                {currentTrack?.trackName ?? "Select a track"}
              </p>
              {currentTrack?.trackTimeMillis ? (
                <p className="mt-1 text-xs text-neutral-500">
                  {formatDuration(currentTrack.trackTimeMillis)}
                </p>
              ) : null}
            </div>
            <div className="w-full min-w-0 sm:w-auto">
              {currentTrack?.previewUrl ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <audio
                  ref={audioRef}
                  controls
                  preload="none"
                  src={currentTrack.previewUrl}
                  className="h-10 w-full max-w-full sm:w-80"
                />
              ) : (
                <p className="text-sm text-neutral-500">No preview available</p>
              )}
            </div>
          </div>
        </div>

        <h2 className="mt-6 text-lg font-semibold">Tracklist</h2>
        <ol className="mt-4 space-y-2">
          {tracks.map((track, index) => {
            const isActive = track.trackId === currentTrackId;
            return (
              <li
                key={track.trackId}
                className={`flex w-full min-w-0 flex-col gap-2 rounded-lg border px-2 py-1.5 transition sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-3 sm:py-2 ${
                  isActive
                    ? "border-neutral-600 bg-neutral-900"
                    : "border-transparent hover:border-neutral-800 hover:bg-neutral-900"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setCurrentTrackId(track.trackId)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span className="w-6 text-right text-xs text-neutral-500">
                    {track.trackNumber ?? index + 1}
                  </span>
                  <span className="truncate text-sm">{track.trackName}</span>
                </button>
                {track.trackTimeMillis ? (
                  <span className="text-xs text-neutral-500">
                    {formatDuration(track.trackTimeMillis)}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
        {tracks.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-400">
            No tracks found for this album.
          </p>
        ) : null}
      </section>
    </div>
  );
}
