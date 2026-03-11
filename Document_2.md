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
1. **Part 1 (List Page)**: I navigated to the bestsellers URL, waited for the product grid to load (scrolling past lazy-loaded limits to ensure all 50 items were captured), and iterated through the items. I extracted the rank, title, author, rating, reviews, price, and product URL using a mix of CSS Selectors and Regex.
2. **Part 2 (Product Pages)**: Instead of visiting pages sequentially, the script utilizes `asyncio.gather` to open batches of concurrent headless tabs. This drastically speeds up the extraction of the description, publisher, and publication date across all 50 books while maintaining random localized async delays (2-5 seconds) to avoid rate limits. 
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

1. "check the image attached over here for me the main problem now is that it is overlapping in the csv format which we have , and then we have to manually adjust the columns to read them fully"
2. "the publication dates , rank and reviews are not coming in the csv file now although it is given their in the website so the scrapping is not fully proper in there fix it now"
3. "check the image over here for me make it like a box over there for me in it , like a box where prompts are made and not fully extending from one end to another"
4. "can we make the scrapping process faster , very fast like going to individual pages and doing it over there for me ?"
5. "also tell me now is there any fact like to scrape only 20 books in the code , is there any hardcoded value like that ?"

---

## 3. Brief Observations from the Dataset

1. **Self-Publishing vs. Traditional Publishing Concentration**: There is a strong mix of heavy-hitting traditional publishers (e.g., Bloomsbury Publishing for Sarah J. Maas titles) and indie/self-published imprints. A significant portion of the Top 50 bestsellers circumvent the "Big Five" publishers, showcasing the dominance of direct-to-market strategies in the Paranormal Romance genre.
2. **Pricing Distribution & Localization**: Looking at the extracted price data (which was captured in local format based on server routing), the hierarchy holds up—bestselling independent authors tend to price highly competitively (equivalent to roughly $2.99 to $4.99 USD), whereas traditionally published heavyweights (e.g., Sarah J. Maas, Andy Weir) are priced noticeably higher (equivalent to $9.99+). 
3. **Rating Consistency Among the Elite**: Almost uniformly, every book in the top 50 maintains an extraordinarily high rating (ranging tightly between 4.2 and 4.9). This indicates that sustaining a top-50 rank on Amazon is highly dependent on an overwhelmingly positive review consensus, with books rarely slipping below a 4.0 average despite varying review volumes.
