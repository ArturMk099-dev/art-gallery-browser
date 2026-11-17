# Art Gallery Browser

A React and TypeScript application for exploring artworks from the Art Institute of Chicago. Features include search, department filtering, pagination, and detailed artwork pages.

## Live demo

https://artgalleryartur.cyou/

## Features

- Browse artworks in a responsive grid with 20 results per page.
- Search by artwork title or artist.
- Filter by departments loaded from the API.
- Preserve search, department, and page selections in the URL.
- Open artwork details and return to the previous gallery view.
- View larger images, artist information, dates, medium, dimensions, origin, credit line, and gallery information.
- Read artwork descriptions when available.
- Handle loading, request failures, empty results, and missing artworks.
- Retry failed requests without refreshing the page.
- Display placeholders for missing or failed images.
- Load images lazily.

## Tech stack

- React 18
- TypeScript 5
- Vite 8
- React Router 6
- Plain CSS
- Native Fetch API
- A Node.js image proxy function configured for Vercel

## Running locally

### Requirements

- Node.js 22.12 or newer
- npm

The project was developed using Node.js 24.

Download or clone the repository, then open a terminal in the project directory.

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Open the local URL printed in the terminal.

### Create a production build

```bash
npm run build
```

This command checks TypeScript types and generates the production files in `dist`.

### Preview the production build locally

```bash
npm run preview
```

Run the build command before previewing. Rebuild after making changes to preview the updated production files.

No API key or environment variables are required.

## Implementation decisions

### State and navigation

React hooks manage component state. The URL stores the submitted search query, selected department, and current page using the `q`, `department`, and `page` parameters.

This preserves the gallery view across refreshes and browser navigation. Artwork links carry the gallery parameters so that “Back to gallery” restores the previous view.

### API requests

The application uses native `fetch` and requests only the fields needed for each view.

Search uses a structured query targeting `title` and `artist_title`. Department filtering uses an exact match on `department_id`.

`AbortController` cancels requests when the selected view changes or a component unmounts. Aborted requests do not update the current view.

Department IDs are treated as strings to match the API responses.

### Artwork descriptions

Descriptions may contain HTML. The application parses this with `DOMParser`, extracts the text, and renders it through React.

This keeps the description readable without inserting the API's HTML into the page. Original HTML formatting and links are not preserved.

### Images

Image paths use the API's `config.iiif_url` pathname and each artwork's `image_id`. Gallery cards request 400-pixel-wide images, while detail pages request 843-pixel-wide images.

During local development and preview, Vite proxies image requests to the museum.

For Vercel deployment, image requests are rewritten to `api/image.js`. This function:

- Accepts the two image sizes used by the application.
- Requests images from the museum's fixed image host.
- Sends an identifying `AIC-User-Agent` header.
- Applies a 10-second request timeout.
- Checks the upstream status and image content type.
- Returns the image bytes with the appropriate content type.
- Allows successful image responses to be cached for one day.

## Challenges and limitations

### Image access

Direct image embedding produced access errors during development. Image requests therefore use a local Vite proxy and a separate function for deployment.

The production function still depends on the museum's image service being available.

### Search pagination

Deep pagination on the search endpoint returned errors during development.

Search and department-filtered views are therefore limited to 50 pages, or the first 1,000 matches. A notice asks users to refine their search when more matches exist.

Unfiltered browsing follows the regular artworks endpoint's pagination.

### Missing data

Some artworks have no image, description, or other metadata. The interface provides fallback text and image placeholders, and omits empty descriptions.

## Project structure

- `src/pages/` — gallery, artwork details, and not-found pages.
- `src/components/` — reusable UI components.
- `src/api/` — browser-side API request helpers.
- `src/types/` — TypeScript interfaces for API data.
- `src/style.css` — application styles.
- `api/image.js` — server-side image proxy for deployment.
- `vite.config.js` — Vite configuration and local image proxy.
- `vercel.json` — build settings and deployment rewrites.

## Deployment

The repository is configured for Vercel:

- Build command: `npm run build`
- Output directory: `dist`
- Image function: `api/image.js`
- Image rewrites route requests to the function.
- The application fallback serves `index.html` for client-side routes, including artwork detail URLs opened directly.

The image function requires a server runtime. Uploading only the `dist` directory to static hosting does not include it.

## Data source

Artwork metadata and images are provided by the Art Institute of Chicago.

[Art Institute of Chicago API documentation](https://api.artic.edu/docs/)
