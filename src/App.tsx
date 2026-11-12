import { useEffect, useState } from "react";
import { getArtworks } from "./api/artworks";
import type { FormEvent } from "react";
import ArtworkImage from "./components/ArtworkImage";
import type { ArtworksResponse } from "./types/artwork";
import { useSearchParams } from "react-router-dom";
export default function App() {
  const [result, setResult] = useState<ArtworksResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [retryCount, setRetryCount] = useState(0);
  const query = searchParams.get("q") ?? "";
  const [searchText, setSearchText] = useState(query);
  const rawPage = searchParams.get("page");
  const parsedPage = Number(rawPage ?? 1);
  const isValidPage = Number.isInteger(parsedPage) && parsedPage >= 1;
  const page = isValidPage ? parsedPage : 1;
  function changePage(nextPage: number) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(nextPage));
    setSearchParams(nextParams);
  }
  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = searchText.trim();
    const nextParams = new URLSearchParams(searchParams);
    if (trimmedQuery === "") {
      nextParams.delete("q");
    } else {
      nextParams.set("q", trimmedQuery);
    }
    nextParams.set("page", "1");
    setSearchParams(nextParams);
  }
  useEffect(
    function () {
      setSearchText(query);
    },
    [query],
  );
  useEffect(
    function () {
      const controller = new AbortController();
      async function loadArtworks() {
        setLoading(true);
        setError(null);
        try {
          const data = await getArtworks(page, query, controller.signal);
          if (!controller.signal.aborted) {
            setResult(data);
          }
        } catch (error) {
          if (controller.signal.aborted) return;
          if (error instanceof Error) {
            setError(error.message);
          } else {
            setError("Failed to load artworks");
          }
        } finally {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        }
      }
      loadArtworks();
      return () => controller.abort();
    },
    [page, query, retryCount],
  );
  if (loading) {
    return <p>Loading artworks...</p>;
  }
  if (error !== null) {
    return (
      <div>
        <p>{error}</p>
        <button type="button" onClick={() => setRetryCount(retryCount + 1)}>
          Retry
        </button>
      </div>
    );
  }
  if (result === null) {
    return <p>No artwork data available.</p>;
  }
  return (
    <main>
      <h1>Art Gallery Browser</h1>
      <form onSubmit={handleSearch}>
        <label>
          Search artworks
          <input
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.currentTarget.value)}
          />
        </label>
        <button type="submit">Search</button>
      </form>
      {result.data.length === 0 && <p>No artworks found.</p>}
      <p>Loaded artworks: {result.data.length}</p>
      <p>Page: {page}</p>
      <button
        type="button"
        onClick={() => changePage(page - 1)}
        disabled={page <= 1}
      >
        Previous Page
      </button>
      <button
        type="button"
        onClick={() => changePage(page + 1)}
        disabled={page >= result.pagination.total_pages}
      >
        Next Page
      </button>
      <ul>
        {result.data.map((artwork) => (
          <li key={artwork.id}>
            {artwork.image_id !== null ? (
              <ArtworkImage
                src={
                  new URL(result.config.iiif_url).pathname +
                  "/" +
                  artwork.image_id +
                  "/full/400,/0/default.jpg"
                }
                alt={artwork.title ?? "Untitled"}
              />
            ) : (
              <p> No image available</p>
            )}
            <h2>{artwork.title ?? "Untitled"}</h2>
            <p>{artwork.artist_display ?? "Unknown artist"}</p>
            <p>{artwork.date_display ?? "Date unknown"}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
