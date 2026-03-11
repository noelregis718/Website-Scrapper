# Document 2: Amazon Kindle Bestsellers - Paranormal Romance Scraping Assignment

## 1. Process / Approach Note

### Tools Used
- **Python**: Core programming language.
- **Playwright (async)**: Used to launch a Chromium browser instance to fetch page content. Amazon employs strict bot-detection against straightforward HTTP requests. By using Playwright, we simulate a real user environment to bypass basic blocks.
- **Pandas**: Used to structure the extracted data, apply column ordering, handle missing values gracefully (using `None`), and export the final dataset cleanly to an Excel file.
- **OpenPyXL**: Used in conjunction with Pandas to build a natively formatted `.xlsx` file wrapper with auto-adjusting column widths and text wrapping for readability.
- **React & Vite (Bonus webapp)**: Built an interactive frontend to demonstrate workflow encapsulation.

### Approach & AI Incorporation
The task was broken into two parts: a List Page Scraper and a Product Page Scraper, developed iteratively with an AI assistant acting as a pair-programmer.
1. **Part 1 (List Page)**: I navigated to the bestsellers URL, waited for the product grid to load, and iterated through the items. I extracted the rank, title, author, rating, reviews, price, and product URL using a mix of CSS Selectors and Regex.
2. **Part 2 (Product Pages)**: The script iterated over the collected URLs, visiting each individual book page with random async delays (2-5 seconds) to avoid rate limits. I extracted the description, publisher, and publication date using specific container IDs. 
### Edge Cases & Resolutions
- **Missing Data & DOM Mutations**: Not all books share the exact same DOM layout (Amazon heavily A/B tests). For example, rank badges moved outside the main product card, and publisher details swapped from bullet lists to grid carousels. **Solution**: Implemented robust exception handling and heavy Regex array fallbacks (e.g., scanning the raw HTML for standard patterns if the CSS selector failed). Cleaned invisible zero-width characters using a custom text normalizer.
- **CAPTCHAs**: Amazon penalizes headless browser connections heavily. **Solution**: Ran Chromium in non-headless mode with a standard user-agent to bypass heuristic bot-checks.
- **Export Formatting**: Standard CSV files mangled long text (descriptions) and stacking columns in Excel. **Solution**: Upgraded the final data output to a specifically tracked `.xlsx` document using pandas ExcelWriter, forcefully telling Excel to Auto-Fit columns and enable word-wrapping natively.

### Scaling the Workflow
To adapt this workflow for **many Kindle category pages at scale**:
1. **Decoupled Queue System**: I would split the monolithic script into two separate worker pools managed via a message broker (like RabbitMQ or Celery). One fast worker pool scrapes the Category URLs and drops individual Book URLs into a queue; hundreds of distributed downstream workers consume that queue in parallel to fetch product details.
2. **Proxy Rotation & Profiling**: The system would route through premium rotating residential proxies (like Bright Data) while retaining persistent browser contexts (cookies/headers) to mimic legitimate human traffic.
3. **AI Vision Agents for Extraction**: Hardcoded CSS selectors break entirely at scale due to site updates. I would route the raw HTML snippet directly to a lightweight offline LLM instructed specifically to "extract the Publisher exactly as written", resolving localization and layout shifts automatically.

---

## 2. AI Prompt Log

*The scraping script and logical flow were developed iteratively using an AI assistant (Antigravity/Claude/GPT-4 equivalent). Below are the high-level prompts used to construct the solution:*

1. **Initial Setup & Strategy**: "I need to build an AI-assisted workflow to extract structured data from the Amazon Kindle Best Sellers - Paranormal Romance page. Because Amazon blocks standard `requests`, what is the best headless browser framework in Python to use to bypass bot detection for this task?"
2. **Scraper Drafting (Part 1)**: "Write an asynchronous Playwright script in Python. Navigate to this specific URL: [Amazon URL]. Extract the top 20 items in the grid. For each item, capture the Rank, Book Title, Author, Rating (extract just the float), Reviews (clean the commas and make it an int), Price (extract just the number), and Book URL. Handle missing elements gracefully with try-except blocks."
3. **Scraper Drafting (Part 2)**: "Now extend the script. For every URL collected from Part 1, navigate to the individual product page. Implement a random delay of 2-4 seconds to avoid rate limits. Extract the Book Description, Publisher, and Publication Date. Standardize the publication date to YYYY-MM-DD. Combine this data with the Part 1 data."
4. **Data Cleaning & Output**: "Use Pandas to take the combined dictionary, ensure the columns are in specific order (Rank, Title, Author, Rating, Reviews, Price, URL, Description, Publisher, Publication Date), and export to a utf-8 encoded CSV. Make sure to handle `cp1252` encoding errors common on Windows."

---

## 3. Brief Observations from the Dataset

1. **Self-Publishing vs. Traditional Publishing Concentration**: There is a strong mix of heavy-hitting traditional publishers (e.g., Bloomsbury Publishing for Sarah J. Maas titles) and indie/self-published imprints. A significant portion of the Top 20 bestsellers circumvent the "Big Five" publishers, showcasing the dominance of direct-to-market strategies in the Paranormal Romance genre.
2. **Pricing Distribution & Localization**: Looking at the extracted price data (which was captured in local Indian Rupees based on server routing, e.g., 458.90 INR vs 183.01 INR), the hierarchy holds up—bestselling independent authors tend to price highly competitively (equivalent to roughly $2.99 to $4.99 USD), whereas traditionally published heavyweights (e.g., Sarah J. Maas, Andy Weir) are priced noticeably higher (equivalent to $9.99+). 
3. **Rating Consistency Among the Elite**: Almost uniformly, every book in the top 20 maintains an extraordinarily high rating (ranging tightly between 4.2 and 4.9). This indicates that sustaining a top-20 rank on Amazon is highly dependent on an overwhelmingly positive review consensus, with books rarely slipping below a 4.0 average despite varying review volumes.
