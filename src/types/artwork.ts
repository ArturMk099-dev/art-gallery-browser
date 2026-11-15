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
export interface ArtworkDetails extends Artwork {
  department_title: string | null;
  medium_display: string | null;
  dimensions: string | null;
  place_of_origin: string | null;
  credit_line: string | null;
  gallery_title: string | null;
  description: string | null;
  is_on_view: boolean;
}

export interface ArtworkDetailsResponse {
  data: ArtworkDetails;
  config: {
    iiif_url: string;
  };
}
