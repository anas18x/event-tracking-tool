import { chromium } from "playwright";



export async function scrapeDistrictInByCity(city = "delhi") {
  const url = "https://www.district.in/events/";
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(3000);

    const locationButtonSelector = 'button.dds-min-w-\\[200px\\], button[class*="dds-min-w-"][class*="dds-max-w-"][class*="dds-rounded-full"]';
    await page.waitForSelector(locationButtonSelector, { timeout: 10000 });
    const locationButton = await page.locator(locationButtonSelector).first();
    await locationButton.click();
    await page.waitForTimeout(1000);

    await page.waitForSelector('text="Select Location"', { timeout: 10000 });

    const searchInputSelector = 'input.dds-rounded-lg.dds-w-full, input[class*="dds-rounded-lg"][class*="dds-w-full"]';
    await page.waitForSelector(searchInputSelector, { timeout: 5000 });
    const searchInput = await page.locator(searchInputSelector).first();
    await searchInput.click();
    await searchInput.fill(city);

    await page.waitForTimeout(2000);

    const resultButton = await page.locator(`button:has-text("${city}")`).first();
    if (await resultButton.count() > 0) {
      await resultButton.click();
    } else {
      const altResult = await page.locator(`div:has-text("${city}"), span:has-text("${city}")`).first();
      await altResult.click();
    }

    await page.waitForTimeout(3000);
    await page.waitForSelector('a.dds-h-full, .item-cards, a[href*="/events/"]', { timeout: 30000 });
    await page.waitForTimeout(2000);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    const events = await page.evaluate(() => {
      const results = [];
      const eventCards = document.querySelectorAll('a.dds-h-full, a[href*="/events/"]');

      eventCards.forEach((card) => {
        const url = card.href || null;
        if (!url || !url.includes("/events/") || url === "https://www.district.in/events/") return;

        const contentDiv = card.querySelector('.item-cards') || card;
        const eventNameEl = contentDiv.querySelector('h5');
        const eventName = eventNameEl?.innerText?.trim() || null;
        const dateEl = contentDiv.querySelector('span.dds-text-quaternary, span[style*="color:var(--color-sub-title-text)"]');
        const date = dateEl?.innerText?.trim() || null;

        const secondarySpans = contentDiv.querySelectorAll('span.dds-text-secondary');
        let venue = null;
        let city = null;
        let price = null;

        if (secondarySpans.length >= 1) {
          const venueText = secondarySpans[0]?.innerText?.trim() || "";
          if (venueText.includes(",")) {
            const parts = venueText.split(",");
            venue = parts[0].trim();
            city = parts.slice(1).join(",").trim();
          } else {
            venue = venueText;
          }
        }
        if (secondarySpans.length >= 2) {
          price = secondarySpans[1]?.innerText?.trim() || null;
        }

        let category = null;
        const categories = ["music", "concert", "comedy", "workshop", "festival", "sports", "theatre", "exhibition"];
        for (const cat of categories) {
          if (url.toLowerCase().includes(cat)) {
            category = cat.charAt(0).toUpperCase() + cat.slice(1);
            break;
          }
        }

        let status = "Available";
        const cardText = contentDiv.innerText?.toLowerCase() || "";
        if (cardText.includes("sold out")) status = "Sold Out";
        else if (cardText.includes("few left")) status = "Few Left";
        else if (cardText.includes("coming soon")) status = "Coming Soon";

        if (eventName && url) {
          results.push({ eventName, date, venue, city, category, url, status, price });
        }
      });
      return results;
    });

    const uniqueEvents = events.filter((event, index, self) =>
      index === self.findIndex((e) => e.url === event.url)
    );

    await browser.close();
    return uniqueEvents;

  } catch (error) {
    console.log("error: " + error.message);
    await browser.close();
    throw error;
  }
}
