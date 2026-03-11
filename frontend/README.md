# Website Scraper - Frontend UI

This is the React + Vite frontend for the Website Scraper application. 
It connects to a local Python Flask backend to submit Amazon URLs and display real-time scraping progress.

## Running the Development Server

Make sure you have installed the dependencies first:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```

The UI will be accessible at `http://localhost:5173`. 
*(Note: You must also run `python app.py` from the root directory so the frontend can communicate with the backend API on port 5000).*

## Built With

- React 18
- Vite
- Custom CSS (Glassmorphism & dark aesthetic)
- Lucide React (Icons)
