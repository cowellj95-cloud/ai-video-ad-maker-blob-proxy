export default function Home() {
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Vercel Blob Proxy Service</h1>
      <p>This service proxies private Vercel Blob images for external APIs.</p>
      <p>Endpoint: <code>/api/blob-proxy/[pathname]?token=[bypass_token]</code></p>
    </div>
  );
}
