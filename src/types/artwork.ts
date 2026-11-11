export interface Artwork {
  id: number;
  title: string | null;
  artist_display: string | null;
  date_display: string | null;
  image_id: string | null;
}
export interface ArtworksResponse {
  data: Artwork[];
  pagination: {
    current_page: number;
    total_pages: number;
  };
  config: {
    iiif_url: string;
  };
}
