import { scrapeDistrictInByCity } from "../scrapper/scraper.js";
import { addEventsToSheet, markExpiredEvents } from "../sheets/sheets.js";
import { PLATFORMS, CITIES } from "../config/constants.js";

export async function scrapeCity(city) {
  try {
    const events = await scrapeDistrictInByCity(city);
    const stats = await addEventsToSheet(events, PLATFORMS.DISTRICT);
    await markExpiredEvents();
    return { success: true, eventsFound: events.length, ...stats };
  } catch (error) {
    console.log("scrape failed: " + error.message);
    return { success: false, error: error.message };
  }
}

export async function scrapeAllCities() {
  console.log("Background scrape starting...");
  for (const city of CITIES) {
    console.log("Scraping " + city + "...");
    try {
      await scrapeCity(city);
      console.log(city + " done");
    } catch (err) {
      console.log(city + " failed");
    }
    await new Promise(r => setTimeout(r, 5000));
  }
  await markExpiredEvents();
  console.log("Background scrape finished");
}
