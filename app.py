from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import asyncio
import os
import threading
from urllib.parse import urlparse

# Import our run_scraper function
from scraper import run_scraper

app = Flask(__name__)
CORS(app) # Enable CORS for all routes so our Vite frontend can talk to it

# Store active scraping status (in a real app, use celery/redis or a database)
# This is a simple MVP implementation
scraping_status = {
    "is_scraping": False,
    "last_file": None,
    "error": None
}

def is_valid_url(url):
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except ValueError:
        return False

def scrape_runner(url, max_items):
    """ Runs the async scraper in a background thread """
    global scraping_status
    scraping_status["is_scraping"] = True
    scraping_status["error"] = None
    
    try:
        print(f"Starting background scrape for {url}")
        # Run the async Playwright function inside this thread
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        output_file = loop.run_until_complete(run_scraper(url, max_items))
        
        if output_file and os.path.exists(output_file):
            scraping_status["last_file"] = output_file
            print(f"Scrape completed successfully. File saved to {output_file}")
        else:
             scraping_status["error"] = "Scraping completed but no file was generated (might be CAPTCHA blocked or invalid page structure)."
    except Exception as e:
        print(f"Error during scraping: {e}")
        scraping_status["error"] = str(e)
    finally:
        scraping_status["is_scraping"] = False

@app.route('/api/scrape', methods=['POST'])
def start_scrape():
    global scraping_status
    
    if scraping_status["is_scraping"]:
        return jsonify({"success": False, "message": "A scrape is already in progress. Please wait."}), 429

    data = request.json
    if not data or 'url' not in data:
        return jsonify({"success": False, "message": "No URL provided"}), 400
        
    url = data['url']
    if not is_valid_url(url):
         return jsonify({"success": False, "message": "Invalid URL provided"}), 400

    max_items = data.get('max_items', 10) # Default to 10 for faster testing in the web app

    # Start the scraping process in the background
    thread = threading.Thread(target=scrape_runner, args=(url, max_items))
    thread.start()

    return jsonify({"success": True, "message": "Scraping started"})

@app.route('/api/status', methods=['GET'])
def get_status():
    global scraping_status
    return jsonify({
        "is_scraping": scraping_status["is_scraping"],
        "has_result": scraping_status["last_file"] is not None,
        "error": scraping_status["error"]
    })

@app.route('/api/download', methods=['GET'])
def download_data():
    global scraping_status
    file_path = scraping_status.get("last_file")
    
    if not file_path or not os.path.exists(file_path):
        return jsonify({"success": False, "message": "No data file available to download"}), 404
        
    return send_file(
        file_path, 
        as_attachment=True, 
        download_name="amazon_scraped_data.xlsx",
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

if __name__ == '__main__':
    print("Starting Flask Web Scraper API on port 5000...")
    app.run(debug=True, port=5000, use_reloader=False) # Important: Disable reloader when using threading and playwright to prevent double-execution issues
