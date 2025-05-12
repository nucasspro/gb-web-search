import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      
      // Check if data is properly formatted
      if (!data.google || !data.baidu) {
        throw new Error('Invalid response format from search API');
      }
      
      // Ensure the data fields exist
      if (!data.google.data) data.google.data = [];
      if (!data.baidu.data) data.baidu.data = [];
      
      setResults(data);
    } catch (err) {
      setError('An error occurred while searching. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>Search Crawler API</title>
        <meta name="description" content="API that crawls Google and Baidu search results" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">
          Search Engine Crawler
        </h1>
        
        <p className="description">
          Enter a search term to get results from Google and Baidu
        </p>

        <div className="api-links">
          <Link href="/api-docs">
            <a className="api-docs-link">View API Documentation</a>
          </Link>
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter search term..."
            className="search-input"
          />
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {loading && <p className="loading">Searching...</p>}

        {results && (
          <div className="results">
            <h2>Search Results</h2>
            
            {/* Google screenshot section */}
            {results.google && results.google.image && (
              <div className="screenshot-section">
                <h3>Google Screenshot</h3>
                <div className="screenshot-container">
                  <img 
                    src={results.google.image} 
                    alt="Google search results" 
                    className="search-screenshot" 
                  />
                </div>
              </div>
            )}
            
            {results.google && results.google.data && results.google.data.length > 0 && (
              <div className="result-section">
                <h3>Google Results</h3>
                <ul className="clean-list">
                  {results.google.data.map((item, index) => (
                    <li key={`google-${index}`} className="result-item">
                      <h4 className="result-title">
                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                          {item.title}
                        </a>
                      </h4>
                      {item.content && (
                        <p className="result-description">{item.content}</p>
                      )}
                    </li>
                  ))}
                </ul>
                {results.google.error && (
                  <p className="error-message">Google error: {results.google.error}</p>
                )}
              </div>
            )}
            
            {/* Baidu screenshot section */}
            {results.baidu && results.baidu.image && (
              <div className="screenshot-section">
                <h3>Baidu Screenshot</h3>
                <div className="screenshot-container">
                  <img 
                    src={results.baidu.image} 
                    alt="Baidu search results" 
                    className="search-screenshot" 
                  />
                </div>
              </div>
            )}

            {results.baidu && results.baidu.data && results.baidu.data.length > 0 && (
              <div className="result-section">
                <h3>Baidu Results</h3>
                <ul className="clean-list">
                  {results.baidu.data.map((item, index) => (
                    <li key={`baidu-${index}`} className="result-item">
                      <h4 className="result-title">
                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                          {item.title}
                        </a>
                      </h4>
                      {item.content && (
                        <p className="result-description">{item.content}</p>
                      )}
                    </li>
                  ))}
                </ul>
                {results.baidu.error && (
                  <p className="error-message">Baidu error: {results.baidu.error}</p>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <footer>
        <p>Powered by Next.js</p>
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
        }

        .description {
          text-align: center;
          line-height: 1.5;
          font-size: 1.2rem;
          margin: 1rem 0 2rem;
        }

        .search-form {
          display: flex;
          width: 100%;
          max-width: 600px;
          margin-bottom: 2rem;
        }

        .search-input {
          flex: 1;
          padding: 0.75rem 1rem;
          font-size: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px 0 0 4px;
          outline: none;
        }

        .search-button {
          padding: 0.75rem 1.5rem;
          background-color: #0070f3;
          color: white;
          font-size: 1rem;
          border: none;
          border-radius: 0 4px 4px 0;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .search-button:hover {
          background-color: #0051a8;
        }

        .search-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .error {
          color: #d32f2f;
          margin: 1rem 0;
        }

        .loading {
          color: #666;
          margin: 1rem 0;
        }

        .results {
          width: 100%;
          margin-top: 2rem;
        }

        .result-section {
          margin-bottom: 2rem;
        }

        .result-section h3 {
          border-bottom: 1px solid #eaeaea;
          padding-bottom: 0.5rem;
        }

        .result-section ul {
          list-style: none;
          padding: 0;
        }

        .result-section li {
          margin-bottom: 1.5rem;
        }

        .result-section a {
          color: #0070f3;
          text-decoration: none;
          font-weight: 500;
          font-size: 1.1rem;
        }

        .result-section a:hover {
          text-decoration: underline;
        }

        .result-section p {
          margin: 0.5rem 0 0;
          color: #666;
        }

        .screenshot-section {
          width: 100%;
          margin-bottom: 2rem;
        }

        .screenshot-section h3 {
          border-bottom: 1px solid #eaeaea;
          padding-bottom: 0.5rem;
        }

        .screenshot-container {
          overflow-x: auto;
          max-width: 100%;
          border: 1px solid #eaeaea;
          border-radius: 4px;
          margin-top: 1rem;
        }

        .search-screenshot {
          max-width: 100%;
          display: block;
        }

        footer {
          width: 100%;
          height: 60px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .error-message {
          color: #d32f2f;
          margin: 0.5rem 0;
          font-style: italic;
        }

        .clean-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .result-item {
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #eaeaea;
        }

        .result-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
        }

        .result-title a {
          color: #1a0dab;
          text-decoration: none;
        }

        .result-title a:hover {
          text-decoration: underline;
        }

        .result-description {
          margin: 0;
          color: #4d5156;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .api-links {
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
          width: 100%;
        }

        .api-docs-link {
          display: inline-block;
          background-color: #0070f3;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          text-decoration: none;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .api-docs-link:hover {
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