import { useParams, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getArtwork } from "../api/artworks";
import type { ArtworkDetailsResponse } from "../types/artwork";
import ArtworkImage from "../components/ArtworkImage";
export default function ArtworkPage() {
  const { id } = useParams();
  const location = useLocation();
  const [result, setResult] = useState<ArtworkDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const artworkId = Number(id);
  const isValidId = Number.isInteger(artworkId) && artworkId > 0;
  useEffect(() => {
    if (!isValidId) {
      setResult(null);
      setError(null);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    async function loadArtwork() {
      setLoading(true);
      setError(null);
      try {
        const data = await getArtwork(artworkId, controller.signal);
        if (!controller.signal.aborted) setResult(data);
      } catch (error) {
        if (controller.signal.aborted) return;
        if (error instanceof Error) setError(error.message);
        else setError("Failed to load artwork");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadArtwork();
    return () => controller.abort();
  }, [artworkId, isValidId, retryCount]);
  if (loading) {
    return (
      <div>
        <p>Loading artwork...</p>
        <Link to={"/" + location.search}>Back to gallery</Link>
      </div>
    );
  }
  if (error !== null) {
    return (
      <div>
        <p>{error}</p>
        <button type="button" onClick={() => setRetryCount(retryCount + 1)}>
          Retry
        </button>
        <Link to={"/" + location.search}>Back to gallery</Link>
      </div>
    );
  }
  if (result === null) {
    return (
      <div>
        <p>Artwork not found.</p>
        <Link to={"/" + location.search}>Back to gallery</Link>
      </div>
    );
  }
  const artwork = result.data;
  const parser = new DOMParser();
  const descriptionDocument = parser.parseFromString(
    artwork.description ?? "",
    "text/html",
  );
  const descriptionText = (descriptionDocument.body.textContent ?? "").trim();
  const iiifPath = new URL(result.config.iiif_url).pathname;
  const imageSrc =
    artwork.image_id === null
      ? null
      : iiifPath + "/" + artwork.image_id + "/full/843,/0/default.jpg";
  return (
    <main>
      <Link to={"/" + location.search}>Back to gallery</Link>
      {imageSrc !== null ? (
        <ArtworkImage src={imageSrc} alt={artwork.title ?? "Untitled"} />
      ) : (
        <p>No image available</p>
      )}
      <h1>{artwork.title ?? "Untitled"}</h1>
      <p>{artwork.artist_display ?? "Unknown artist"}</p>
      <p>{artwork.date_display ?? "Date unknown"}</p>
      <p>Department: {artwork.department_title ?? "Not available"}</p>
      <p>Medium: {artwork.medium_display ?? "Not available"}</p>
      <p>Dimensions: {artwork.dimensions ?? "Not available"}</p>
      <p>Place of origin: {artwork.place_of_origin ?? "Not available"}</p>
      <p>Credit line: {artwork.credit_line ?? "Not available"}</p>
      <p>On view: {artwork.is_on_view ? "Yes" : "No"}</p>
      {artwork.is_on_view && (
        <p>Gallery: {artwork.gallery_title ?? "Not available"}</p>
      )}
      {descriptionText !== "" && (
        <section>
          <h2>Description</h2>
          <p>{descriptionText}</p>
        </section>
      )}
    </main>
  );
}
