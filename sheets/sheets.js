import { googleSheetConnection } from "../config/spreadsheet.config.js";
import { SHEET_HEADERS, STATUS } from "../config/constants.js";
import { generateEventId, getCurrentTimestamp, calculateExpiryDate } from "../utils/helpers.js";
import dayjs from "dayjs";

export async function initializeSheet() {
  try {
    const doc = googleSheetConnection();
    await doc.loadInfo();
    let sheet = doc.sheetsByTitle["Events"];
    if (!sheet) {
      sheet = await doc.addSheet({ title: "Events", headerValues: SHEET_HEADERS });
    }
    return { doc, sheet };
  } catch (error) {
    console.log("Failed to initialize sheet: " + error.message);
    throw error;
  }
}

export async function getExistingEvents() {
  try {
    const { sheet } = await initializeSheet();
    const rows = await sheet.getRows();
    const events = rows.map((row) => ({
      id: row.get("ID"),
      eventName: row.get("Event Name"),
      date: row.get("Date"),
      venue: row.get("Venue"),
      city: row.get("City"),
      category: row.get("Category"),
      url: row.get("URL"),
      status: row.get("Status"),
      price: row.get("Price"),
      platform: row.get("Platform"),
      scrapedAt: row.get("Scraped At"),
      expiresAt: row.get("Expires At"),
      _row: row,
    }));
    return events;
  } catch (error) {
    console.log("Failed to get events: " + error.message);
    throw error;
  }
}

export async function addEventsToSheet(events, platform) {
  try {
    const { sheet } = await initializeSheet();
    const existingEvents = await getExistingEvents();
    const existingIds = new Map(existingEvents.map((e) => [e.id, e]));

    const stats = { added: 0, updated: 0, skipped: 0, expired: 0 };
    const newRows = [];

    for (const event of events) {
      const eventId = generateEventId(event.url);
      const existingEvent = existingIds.get(eventId);

      if (existingEvent) {
        if (existingEvent.status !== event.status) {
          existingEvent._row.set("Status", event.status);
          existingEvent._row.set("Scraped At", getCurrentTimestamp());
          await existingEvent._row.save();
          stats.updated++;
        } else {
          stats.skipped++;
        }
      } else {
        const expiryDate = calculateExpiryDate(event.date);
        newRows.push({
          ID: eventId,
          "Event Name": event.eventName,
          Date: event.date || "TBA",
          Venue: event.venue || "TBA",
          City: event.city || "Unknown",
          Category: event.category || "Other",
          URL: event.url,
          Status: event.status || STATUS.AVAILABLE,
          Price: event.price || "TBA",
          Platform: platform,
          "Scraped At": getCurrentTimestamp(),
          "Expires At": expiryDate,
        });
        stats.added++;
      }
    }

    if (newRows.length > 0) {
      await sheet.addRows(newRows);
    }
    return stats;
  } catch (error) {
    console.log("Failed to add events: " + error.message);
    throw error;
  }
}

export async function markExpiredEvents() {
  try {
    const existingEvents = await getExistingEvents();
    let expiredCount = 0;
    for (const event of existingEvents) {
      if (event.status === STATUS.EXPIRED) continue;
      const expiryDate = dayjs(event.expiresAt);
      if (expiryDate.isValid() && expiryDate.isBefore(dayjs(), "day")) {
        event._row.set("Status", STATUS.EXPIRED);
        await event._row.save();
        expiredCount++;
      }
    }
    return expiredCount;
  } catch (error) {
    console.log("Failed to mark expired: " + error.message);
    throw error;
  }
}


