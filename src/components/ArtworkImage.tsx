import { useState } from "react";

export interface ArtworkImageProps {
  src: string;
  alt: string;
}
export default function ArtworkImage(props: ArtworkImageProps) {
  const [hasError, setHasError] = useState(false);
  if (hasError) {
    return <p className="image-placeholder">No image available</p>;
  }
  return (
    <img
      src={props.src}
      alt={props.alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
    />
  );
}
