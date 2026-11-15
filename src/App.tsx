import ArtworkPage from "./pages/ArtworkPage";
import GalleryPage from "./pages/GalleryPage";
import NotFoundPage from "./pages/NotFoundPage";
import { Routes, Route } from "react-router-dom";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<GalleryPage />} />
      <Route path="/artworks/:id" element={<ArtworkPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
