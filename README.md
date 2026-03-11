# Website Scraper

A robust applicant assignment solution and full-stack web application designed to scrape and extract structured data from Amazon Kindle Bestseller lists. It automatically bypasses basic bot detections and exports the scraped data into a cleanly formatted, auto-sizing Microsoft Excel (`.xlsx`) file.

## Features

- **Dynamic Scraping:** Pass any Amazon Bestsellers category URL to scrape its top books.
- **Robust Selectors:** Uses intelligent fallback CSS selectors and Regex to combat Amazon's frequent A/B layout changes.
- **Deep Extraction:** Not only parses the list page (Rank, Title, Author, Rating, Reviews, Price), but also visits individual product pages to extract Publisher, Publication Date, and Description.
- **Text Cleaning:** Aggressive unicode normalization and zero-width character removal to ensure output data is perfectly clean.
- **Native Excel Export:** Auto-calculates column widths and applies text-wrapping natively so the downloaded `.xlsx` file is immediately readable without manual resizing.
- **Modern UI:** Features a sleek, responsive, ChatGPT-style prompt UI built with React, Vite, and glassmorphism CSS.
- **Background Processing:** The Python backend uses asynchronous Playwright and threading to run scrapes without blocking the UI.

## Technology Stack

- **Backend:** Python, Flask, Playwright (async), Pandas, OpenPyXL
- **Frontend:** React, Vite, CSS3 (Glassmorphism design), Lucide React
- **Output Format:** `.xlsx` (Native Excel Document)

## Prerequisites

Before you begin, ensure you have the following installed:
1. Python 3.9+
2. Node.js (v16+ recommended)
3. npm or yarn

## Installation & Setup

### 1. Backend Setup

Navigate to the root directory of the project and set up a Python virtual environment:

```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies (assuming you extract requirements or install manually)
pip install flask flask-cors playwright pandas openpyxl

# Install Playwright browsers
playwright install
```

### 2. Frontend Setup

Open a new terminal, navigate to the `frontend` folder, and install the Node dependencies:

```bash
cd frontend
npm install
```

## Running the Application

You need to run both the backend API and the frontend development server simultaneously.

**Start the Backend API:**
```bash
# From the root directory, with your venv activated:
python app.py
```
*(The Flask server will start on `http://localhost:5000`)*

**Start the Frontend UI:**
```bash
# From the frontend directory:
npm run dev
```
*(The Vite server will start on `http://localhost:5173`)*

## Usage

1. Open your browser and navigate to `http://localhost:5173`.
2. Find an Amazon Kindle Best Sellers page (e.g., *Paranormal Romance*).
3. Copy the URL and paste it into the "Website Scraper" prompt box.
4. Click the **Start Scraping** button (or the search icon).
5. Wait for the background Playwright process to navigate the pages and extract the data. The UI will display a loading indicator.
6. Once complete, click **Download Excel Dataset** to get your pristine `.xlsx` output.

## Notes & Limitations

- **Rate Limiting / CAPTCHAs:** Scraping large amounts of data rapidly from Amazon may trigger CAPTCHAs. The script runs Playwright in non-headless mode to reduce bot-detection scores, and uses random delays between page visits.
- **Scaling:** For production or large-scale use, this architecture should be upgraded to use a task queue (like Celery/Redis) and residential rotating proxies.

## Author

Noel Regis
