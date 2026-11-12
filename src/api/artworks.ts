import type { ArtworksResponse } from "../types/artwork";
export async function getArtworks(
  page: number,
  query: string,
  signal?: AbortSignal,
) {
  const url = new URL("https://api.artic.edu/api/v1/artworks");
  if (query !== "") {
    url.pathname = "/api/v1/artworks/search";
    url.searchParams.set("query[multi_match][query]", query);
    url.searchParams.append("query[multi_match][fields][]", "title");
    url.searchParams.append("query[multi_match][fields][]", "artist_title");
  }

  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(20));
  url.searchParams.set(
    "fields",
    "id,title,artist_display,date_display,image_id",
  );
  const response = await fetch(url, {
    referrerPolicy: "no-referrer",
    signal: signal,
  });
  if (!response.ok) {
    throw new Error("Failed to load artworks");
  }
  const result: ArtworksResponse = await response.json();
  return result;
}
