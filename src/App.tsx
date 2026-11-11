import { useEffect, useState } from "react";
import { getArtworks } from "./api/artworks";
import ArtworkImage from "./components/ArtworkImage";
import type { ArtworksResponse } from "./types/artwork";
export default function App() {
  const [result, setResult] = useState<ArtworksResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  useEffect(
    function () {
      async function loadArtworks() {
        setLoading(true);
        setError(null);
        try {
          const data = await getArtworks(page);
          setResult(data);
        } catch (error) {
          if (error instanceof Error) {
            setError(error.message);
          } else {
            setError("Failed to load artworks");
          }
        } finally {
          setLoading(false);
        }
      }
      loadArtworks();
    },
    [page],
  );
  if (loading) {
    return <p>Loading artworks...</p>;
  }
  if (error !== null) {
    return <p>{error}</p>;
  }
  if (result === null) {
    return <p>No artwork data available.</p>;
  }
  return (
    <main>
      <h1>Art Gallery Browser</h1>
      <p>Loaded artworks: {result.data.length}</p>
      <p>Page: {page}</p>
      <button
        type="button"
        onClick={() => setPage(page - 1)}
        disabled={page <= 1}
      >
        Previous Page
      </button>
      <button
        type="button"
        onClick={() => setPage(page + 1)}
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
