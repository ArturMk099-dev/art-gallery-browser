import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="not-found-page">
      <h1>Page not found</h1>
      <Link to="/">Back to gallery</Link>
    </main>
  );
}
