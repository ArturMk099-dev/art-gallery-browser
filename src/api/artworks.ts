import type {
  ArtworksResponse,
  ArtworkDetailsResponse,
} from "../types/artwork";
export async function getArtworks(
  page: number,
  query: string,
  departmentId: string,
  signal?: AbortSignal,
) {
  const url = new URL("https://api.artic.edu/api/v1/artworks");
  if (query !== "" || departmentId !== "")
    url.pathname = "/api/v1/artworks/search";
  if (query !== "") {
    url.searchParams.set("query[bool][must][multi_match][query]", query);
    url.searchParams.append(
      "query[bool][must][multi_match][fields][]",
      "title",
    );
    url.searchParams.append(
      "query[bool][must][multi_match][fields][]",
      "artist_title",
    );
  }
  if (departmentId !== "") {
    url.searchParams.set(
      "query[bool][filter][term][department_id]",
      departmentId,
    );
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
export async function getArtwork(id: number, signal?: AbortSignal) {
  const url = new URL("https://api.artic.edu/api/v1/artworks/" + id);
  url.searchParams.set(
    "fields",
    "id,title,artist_display,date_display,image_id,department_title,medium_display,dimensions,place_of_origin,credit_line,is_on_view,gallery_title,description",
  );
  const response = await fetch(url, {
    referrerPolicy: "no-referrer",
    signal: signal,
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Failed to load artwork");
  const result: ArtworkDetailsResponse = await response.json();
  return result;
}
