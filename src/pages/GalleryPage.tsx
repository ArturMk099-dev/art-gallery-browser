import { useEffect, useState } from "react";
import { getArtworks } from "../api/artworks";
import type { FormEvent } from "react";
import ArtworkImage from "../components/ArtworkImage";
import { getDepartments } from "../api/departments";
import type { Department } from "../types/department";
import type { ArtworksResponse } from "../types/artwork";
import { useLocation, useSearchParams, Link } from "react-router-dom";
export default function GalleryPage() {
  const location = useLocation();
  const [result, setResult] = useState<ArtworksResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [retryCount, setRetryCount] = useState(0);
  const query = searchParams.get("q") ?? "";
  const departmentId = searchParams.get("department") ?? "";
  const maxAllowedPage = query !== "" || departmentId !== "" ? 50 : Infinity;
  const [searchText, setSearchText] = useState(query);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState<boolean>(true);
  const [departmentsError, setDepartmentsError] = useState<string | null>(null);
  const [departmentsRetryCount, setDepartmentsRetryCount] = useState(0);
  const rawPage = searchParams.get("page");
  const parsedPage = Number(rawPage ?? 1);
  const isValidPage =
    Number.isSafeInteger(parsedPage) &&
    parsedPage >= 1 &&
    parsedPage <= maxAllowedPage;
  const page = isValidPage ? parsedPage : 1;
  function changePage(nextPage: number) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(nextPage));
    setSearchParams(nextParams);
  }
  function changeDepartment(nextDepartmentId: string) {
    const nextParams = new URLSearchParams(searchParams);
    if (nextDepartmentId === "") nextParams.delete("department");
    else nextParams.set("department", nextDepartmentId);
    nextParams.set("page", "1");
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
          const data = await getArtworks(
            page,
            query,
            departmentId,
            controller.signal,
          );
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
    [page, query, retryCount, departmentId],
  );
  useEffect(
    function () {
      const controller = new AbortController();
      async function loadDepartments() {
        setDepartmentsLoading(true);
        setDepartmentsError(null);
        try {
          const data = await getDepartments(controller.signal);
          if (!controller.signal.aborted) setDepartments(data.data);
        } catch (error) {
          if (controller.signal.aborted) return;
          if (error instanceof Error) setDepartmentsError(error.message);
          else setDepartmentsError("Failed to load departments");
        } finally {
          if (!controller.signal.aborted) setDepartmentsLoading(false);
        }
      }
      loadDepartments();
      return () => controller.abort();
    },
    [departmentsRetryCount],
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
  const totalPages = Math.min(result.pagination.total_pages, maxAllowedPage);
  return (
    <main className="gallery-page">
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
      <label>
        Department
        <select
          value={departmentId}
          onChange={(event) => changeDepartment(event.currentTarget.value)}
          disabled={departmentsLoading || departmentsError !== null}
        >
          <option value="">All departments</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.title}
            </option>
          ))}
        </select>
      </label>
      {departmentsLoading && <p>Loading departments...</p>}
      {departmentsError !== null && (
        <div>
          <p>{departmentsError}</p>
          <button
            type="button"
            onClick={() => setDepartmentsRetryCount(departmentsRetryCount + 1)}
          >
            Retry departments
          </button>
        </div>
      )}
      {result.data.length === 0 && (
        <div>
          <p>No artworks found.</p>
          {page > 1 && (
            <button type="button" onClick={() => changePage(1)}>
              Go to first page
            </button>
          )}
        </div>
      )}
      <p>Loaded artworks: {result.data.length}</p>
      <p>Page: {page}</p>
      {result.pagination.total_pages > maxAllowedPage && (
        <p className="results-notice">
          Showing the first 1,000 matches. Refine your search to narrow the results.
        </p>
      )}
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
        disabled={page >= totalPages}
      >
        Next Page
      </button>
      <ul>
        {result.data.map((artwork) => (
          <li key={artwork.id}>
            <Link to={"/artworks/" + artwork.id + location.search}>
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
                <p className="image-placeholder">No image available</p>
              )}
              <h2>{artwork.title ?? "Untitled"}</h2>
              <p>{artwork.artist_display ?? "Unknown artist"}</p>
              <p>{artwork.date_display ?? "Date unknown"}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
