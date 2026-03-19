type Album = {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl100?: string;
  collectionViewUrl?: string;
};

import HomeClient from "./HomeClient";

async function getAlbums(): Promise<Album[]> {
  const url = new URL("https://itunes.apple.com/search");
  url.searchParams.set("term", "flying lotus");
  url.searchParams.set("entity", "album");
  url.searchParams.set("limit", "200");
  url.searchParams.set("country", "US");

  const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
  if (!res.ok) {
    throw new Error(`iTunes search failed: ${res.status}`);
  }

  const data = (await res.json()) as { results?: Album[] };
  const deduped = new Map<number, Album>();
  for (const album of data.results ?? []) {
    if (!deduped.has(album.collectionId)) {
      deduped.set(album.collectionId, album);
    }
  }
  return Array.from(deduped.values());
}

export default async function Home() {
  const albums = await getAlbums();
  return (
    <div className="font-sans min-h-dvh w-full bg-neutral-950 text-neutral-50">
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <HomeClient albums={albums} />
      </main>
    </div>
  );
}
