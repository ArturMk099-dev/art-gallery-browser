import type { ArtworksResponse } from "../types/artwork";
export async function getArtworks(page: number) {
  const url = new URL("https://api.artic.edu/api/v1/artworks");
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(20));
  url.searchParams.set(
    "fields",
    "id,title,artist_display,date_display,image_id",
  );
  const response = await fetch(url, { referrerPolicy: "no-referrer" });
  if (!response.ok) {
    throw new Error("Failed to load artworks");
  }
  const result: ArtworksResponse = await response.json();
  return result;
}
