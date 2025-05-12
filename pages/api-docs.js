import Head from 'next/head';
import Link from 'next/link';

export default function ApiDocs() {
  return (
    <div className="container">
      <Head>
        <title>Search API Documentation</title>
        <meta name="description" content="Documentation for the Search Crawler API" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">Search API Documentation</h1>
        
        <div className="home-link">
          <Link href="/">← Back to Home</Link>
        </div>
        
        <div className="docs-content">
          <section className="api-section">
            <h2>Endpoint</h2>
            <code className="endpoint">GET /api/search</code>
            
            <h3>Query Parameters</h3>
            <table className="params-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Default</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>query</td>
                  <td>string</td>
                  <td>Yes</td>
                  <td>-</td>
                  <td>The search term to look up on Google and Baidu</td>
                </tr>
                <tr>
                  <td>includeScreenshots</td>
                  <td>boolean</td>
                  <td>No</td>
                  <td>true</td>
                  <td>Whether to include screenshots in the response. Set to 'false' to reduce response size.</td>
                </tr>
                <tr>
                  <td>maxResults</td>
                  <td>number</td>
                  <td>No</td>
                  <td>All</td>
                  <td>Maximum number of results to return from each search engine</td>
                </tr>
              </tbody>
            </table>
          </section>
          
          <section className="api-section">
            <h2>Response Format</h2>
            <p>The API returns search results from both Google and Baidu in JSON format:</p>
            
            <pre className="code-block">
              {`{
  "timestamp": "2023-08-15T12:34:56.789Z",
  "google": {
    "data": [
      {
        "title": "Result title",
        "link": "https://example.com",
        "content": "Result description text"
      },
      ...
    ],
    "image": "data:image/png;base64,...", // Base64 screenshot
    "highlight": []
  },
  "baidu": {
    "data": [
      {
        "title": "Result title",
        "link": "https://example.com",
        "content": "Result description text"
      },
      ...
    ],
    "image": "data:image/png;base64,...", // Base64 screenshot
    "highlight": []
  }
}`}
            </pre>
          </section>
          
          <section className="api-section">
            <h2>Cross-Origin Resource Sharing (CORS)</h2>
            <p>
              This API supports CORS, allowing it to be accessed from any domain.
              The following headers are included in API responses:
            </p>
            <ul>
              <li><code>Access-Control-Allow-Origin: *</code></li>
              <li><code>Access-Control-Allow-Methods: GET, OPTIONS</code></li>
              <li><code>Access-Control-Allow-Headers: Content-Type, Authorization</code></li>
            </ul>
          </section>
          
          <section className="api-section">
            <h2>Example Usage</h2>
            
            <div className="example-links">
              <Link href="/example-client.html">
                <a className="example-link" target="_blank">Try Example Client</a>
              </Link>
            </div>
            
            <h3>Basic Search</h3>
            <pre className="code-block">
              {`fetch('${process.env.NEXT_PUBLIC_VERCEL_URL || 'https://yoursite.vercel.app'}/api/search?query=example')
.then(response => response.json())
.then(data => {
  console.log(data);
  // Process search results
})
.catch(error => console.error('Error:', error));`}
            </pre>
            
            <h3>Without Screenshots (Reduced Response Size)</h3>
            <pre className="code-block">
              {`fetch('${process.env.NEXT_PUBLIC_VERCEL_URL || 'https://yoursite.vercel.app'}/api/search?query=example&includeScreenshots=false')
.then(response => response.json())
.then(data => {
  console.log(data);
  // Process text-only search results
})
.catch(error => console.error('Error:', error));`}
            </pre>
            
            <h3>Limited Results</h3>
            <pre className="code-block">
              {`fetch('${process.env.NEXT_PUBLIC_VERCEL_URL || 'https://yoursite.vercel.app'}/api/search?query=example&maxResults=5')
.then(response => response.json())
.then(data => {
  console.log(data);
  // Process limited search results
})
.catch(error => console.error('Error:', error));`}
            </pre>
            
            <h3>Axios</h3>
            <pre className="code-block">
              {`import axios from 'axios';

axios.get('${process.env.NEXT_PUBLIC_VERCEL_URL || 'https://yoursite.vercel.app'}/api/search', {
  params: {
    query: 'example',
    includeScreenshots: false,
    maxResults: 5
  }
})
  .then(response => {
    console.log(response.data);
    // Process search results
  })
  .catch(error => console.error('Error:', error));`}
            </pre>
            
            <h3>cURL</h3>
            <pre className="code-block">
              {`curl -X GET '${process.env.NEXT_PUBLIC_VERCEL_URL || 'https://yoursite.vercel.app'}/api/search?query=example&includeScreenshots=false'`}
            </pre>
          </section>
          
          <section className="api-section">
            <h2>Error Handling</h2>
            <p>
              The API returns standard HTTP status codes along with JSON error messages:
            </p>
            
            <table className="params-table">
              <thead>
                <tr>
                  <th>Status Code</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>200</td>
                  <td>Success</td>
                </tr>
                <tr>
                  <td>400</td>
                  <td>Bad Request - Missing query parameter</td>
                </tr>
                <tr>
                  <td>405</td>
                  <td>Method Not Allowed - Only GET requests are supported</td>
                </tr>
                <tr>
                  <td>500</td>
                  <td>Internal Server Error</td>
                </tr>
              </tbody>
            </table>
            
            <h3>Error Response Format</h3>
            <pre className="code-block">
              {`{
  "error": "Error type",
  "message": "Detailed error message"
}`}
            </pre>
          </section>
          
          <section className="api-section">
            <h2>Deployment on Vercel</h2>
            <p>
              This API is designed to be deployed on Vercel. Since the API uses puppeteer to
              perform web scraping, it requires a server environment capable of running headless browsers.
              Vercel Edge Functions don't support running headless browsers, but serverless functions can
              accommodate this with the proper setup.
            </p>
          </section>
          
          <section className="api-section">
            <h2>Rate Limiting</h2>
            <p>
              To prevent abuse, this API may implement rate limiting in the future.
              Please use the API responsibly and consider caching results when appropriate.
            </p>
          </section>
        </div>
      </main>

      <footer>
        <p>Powered by Next.js and Vercel</p>
      </footer>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        main {
          padding: 3rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 800px;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 3rem;
          text-align: center;
          margin-bottom: 2rem;
        }

        .home-link {
          margin-bottom: 2rem;
        }

        .home-link a {
          color: #0070f3;
          text-decoration: none;
        }

        .home-link a:hover {
          text-decoration: underline;
        }

        .docs-content {
          width: 100%;
        }

        .api-section {
          margin-bottom: 3rem;
        }

        .api-section h2 {
          border-bottom: 1px solid #eaeaea;
          padding-bottom: 0.5rem;
          margin-top: 2rem;
        }

        .api-section h3 {
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }

        .endpoint {
          display: inline-block;
          background-color: #f6f8fa;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-family: monospace;
          margin: 1rem 0;
        }

        .params-table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0 2rem;
        }

        .params-table th, .params-table td {
          border: 1px solid #eaeaea;
          padding: 0.75rem;
          text-align: left;
        }

        .params-table th {
          background-color: #f6f8fa;
        }

        .code-block {
          background-color: #f6f8fa;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
          font-family: monospace;
          font-size: 0.9rem;
          line-height: 1.5;
          width: 100%;
          white-space: pre-wrap;
        }

        code {
          font-family: monospace;
          background-color: #f6f8fa;
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
        }

        ul {
          padding-left: 1.5rem;
          margin: 1rem 0;
        }

        li {
          margin-bottom: 0.5rem;
        }

        footer {
          width: 100%;
          height: 60px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .example-links {
          margin: 1rem 0;
        }
        
        .example-link {
          display: inline-block;
          background-color: #0070f3;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          text-decoration: none;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .example-link:hover {
          background-color: #0051a8;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }
      `}</style>
    </div>
  );
} 