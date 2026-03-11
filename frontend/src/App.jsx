import { useState, useEffect } from 'react';
import { Search, Download, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import './App.css';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState({
    isScraping: false,
    hasResult: false,
    error: null
  });
  const [loading, setLoading] = useState(false);

  // Poll status when scraping
  useEffect(() => {
    let interval;
    if (status.isScraping) {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/status`);
          const data = await response.json();

          if (!data.is_scraping && status.isScraping) {
            // Scraping just finished
            setStatus({
              isScraping: false,
              hasResult: data.has_result,
              error: data.error
            });
          } else {
            setStatus(prev => ({
              ...prev,
              isScraping: data.is_scraping,
              hasResult: data.has_result,
              error: data.error
            }));
          }
        } catch (err) {
          console.error("Failed to fetch status", err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [status.isScraping]);

  const handleScrape = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, max_items: 50 }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          isScraping: true,
          hasResult: false,
          error: null
        });
      } else {
        setStatus(prev => ({ ...prev, error: data.message }));
      }
    } catch (err) {
      setStatus(prev => ({ ...prev, error: "Failed to connect to the scraping server." }));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    window.location.href = `${API_BASE_URL}/download`;
  };

  return (
    <div className="app-container">
      <div className="background-gradient"></div>

      <main className="main-content">
        <header className="header">
          <h1>Website Scraper</h1>
          <p>Extract structured data from Amazon Kindle Bestseller lists instantly.</p>
        </header>

        <div className="card glass-effect">
          <form onSubmit={handleScrape} className="scrape-form">
            <div className="input-group">
              <Search className="input-icon" size={20} />
              <input
                type="url"
                placeholder="Paste Amazon Bestsellers URL here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={status.isScraping || loading}
                required
              />
            </div>

            <button
              type="submit"
              className={`primary-btn ${status.isScraping ? 'scraping' : ''}`}
              disabled={status.isScraping || loading || !url}
            >
              {status.isScraping ? (
                <>
                  <Loader2 className="spinner" size={18} />
                  Scraping in Progress...
                </>
              ) : (
                'Start Scraping'
              )}
            </button>
          </form>

          {status.error && (
            <div className="alert error glass-effect">
              <AlertCircle size={20} />
              <p>{status.error}</p>
            </div>
          )}

          {!status.isScraping && status.hasResult && !status.error && (
            <div className="result-container animate-in">
              <div className="success-banner">
                <CheckCircle2 size={24} className="success-icon" />
                <div>
                  <h3>Scraping Complete!</h3>
                  <p>Your dataset is ready for download.</p>
                </div>
              </div>

              <button onClick={handleDownload} className="download-btn">
                <Download size={20} />
                Download Excel Dataset
              </button>
            </div>
          )}

          {status.isScraping && (
            <div className="progress-container animate-in">
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
              <p className="progress-text">
                Navigating pages and extracting data. This may take a few minutes to avoid bot detection...
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
