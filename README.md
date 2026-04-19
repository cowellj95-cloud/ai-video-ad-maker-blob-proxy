# AI Video Ad Maker - Blob Proxy

A minimal Vercel deployment that serves as a public proxy for private Vercel Blob images.

## Purpose

This service allows external APIs (like Runway) to access private images stored in Vercel Blob storage by providing an authenticated proxy endpoint.

## How It Works

1. Images are uploaded to Vercel Blob with `access: "private"` (not publicly accessible)
2. This proxy provides a public URL that can be shared with external services
3. External services must include the bypass token as a query parameter to access images
4. The proxy validates the token before serving the image

## Architecture

```
Main Application (Local)
    ↓
Uploads image to Vercel Blob
    ↓
Gets pathname + generates proxy URL with token
    ↓
Shares proxy URL with external API (e.g., Runway)
    ↓
External API fetches from this proxy service
    ↓
Proxy validates token + serves private image
```

## Environment Variables

Required:
- `VERCEL_BYPASS_TOKEN` - Security token for accessing images (set in Vercel dashboard)
- `BLOB_READ_WRITE_TOKEN` - Token for Vercel Blob operations (set in Vercel dashboard)

## Deployment

This repo is deployed to Vercel. Push to `main` branch to trigger automatic deployment.

## API Endpoint

```
GET /api/blob-proxy/[pathname]?token=[bypass_token]
```

### Parameters
- `pathname` - URL-encoded path to the blob (e.g., `1776609255262-apple_closeup_1.jpeg`)
- `token` - Query parameter with the bypass token

### Response
- Success (200): Returns the image stream
- Unauthorized (401): Invalid or missing token
- Not Found (404): Blob doesn't exist
- Server Error (500): Configuration or internal error

## Security

- All images remain private in Vercel Blob
- Access requires valid bypass token
- Token is validated server-side before serving
- Cache-Control set to `private, max-age=60` (1 minute)
