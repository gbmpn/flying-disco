type LookupResponse = {
  results: Array<AlbumResult | TrackResult>;
};

type AlbumResult = {
  wrapperType: "collection";
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl100?: string;
  artworkUrl600?: string;
  trackCount?: number;
  collectionViewUrl?: string;
};

type TrackResult = {
  wrapperType: "track";
  trackId: number;
  trackName: string;
  trackNumber?: number;
  trackTimeMillis?: number;
  previewUrl?: string;
  artistName?: string;
  collectionName?: string;
  artworkUrl100?: string;
  artworkUrl600?: string;
  collectionViewUrl?: string;
  trackCount?: number;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import AlbumClient from "./AlbumClient";
import AlbumParallaxBg from "./AlbumParallaxBg";

async function getAlbum(id: string) {
  if (!/^\d+$/.test(id)) {
    return { album: null as AlbumResult | null, tracks: [] as TrackResult[] };
  }

  const url = new URL("https://itunes.apple.com/lookup");
  url.searchParams.set("id", id);
  url.searchParams.set("entity", "song");
  url.searchParams.set("country", "US");

  const fetchOptions: RequestInit = { cache: "no-store" };

  let res = await fetch(url.toString(), fetchOptions);
  if (!res.ok) {
    // Fallback: try without entity if Apple returns 400 for some ids.
    const fallback = new URL("https://itunes.apple.com/lookup");
    fallback.searchParams.set("id", id);
    fallback.searchParams.set("country", "US");
    res = await fetch(fallback.toString(), fetchOptions);
  }

  if (!res.ok) {
    const body = await res.text();
    console.error("iTunes lookup failed", {
      id,
      status: res.status,
      statusText: res.statusText,
      body: body.slice(0, 500),
    });
    return { album: null as AlbumResult | null, tracks: [] as TrackResult[] };
  }

  let data: LookupResponse;
  try {
    data = (await res.json()) as LookupResponse;
  } catch (error) {
    console.error("iTunes lookup JSON parse failed", { id, error });
    return { album: null as AlbumResult | null, tracks: [] as TrackResult[] };
  }

  if (!Array.isArray(data.results)) {
    console.error("iTunes lookup missing results", { id, data });
    return { album: null as AlbumResult | null, tracks: [] as TrackResult[] };
  }
  let album = data.results.find(
    (item): item is AlbumResult => item.wrapperType === "collection"
  );
  const tracks = data.results.filter(
    (item): item is TrackResult => item.wrapperType === "track"
  );

  if (!album && tracks.length > 0) {
    const first = tracks[0];
    album = {
      wrapperType: "collection",
      collectionId: Number(id),
      collectionName: first.collectionName ?? "Unknown Album",
      artistName: first.artistName ?? "Unknown Artist",
      artworkUrl100: first.artworkUrl100,
      artworkUrl600: first.artworkUrl600,
      trackCount: first.trackCount,
      collectionViewUrl: first.collectionViewUrl,
    };
  }

  return { album, tracks };
}

function formatDuration(ms?: number) {
  if (!ms) return "";
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { album, tracks } = await getAlbum(id);

  if (!album) {
    return (
      <div className="font-sans min-h-dvh w-full bg-neutral-950 text-neutral-50">
        <main className="mx-auto w-full max-w-5xl px-6 py-12">
          <p className="text-sm text-neutral-400">
            Album not found. Try another.
          </p>
        </main>
      </div>
    );
  }

  const orderedTracks = [...tracks].sort(
    (a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0)
  );

  const art =
    album.artworkUrl600 ??
    album.artworkUrl100?.replace("100x100", "1200x1200") ??
    "";

  return (
    <div className="relative font-sans min-h-dvh w-full max-w-full text-neutral-50">
      <AlbumParallaxBg src={art} />
      <main className="mx-auto w-full max-w-6xl min-w-0 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6">
          <a
            href="/"
            className="text-sm text-neutral-400 transition hover:text-neutral-200"
          >
            Back to all albums
          </a>
        </div>

        <AlbumClient album={album} tracks={orderedTracks} />
      </main>
    </div>
  );
}
