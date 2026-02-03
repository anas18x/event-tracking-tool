import "dotenv/config";
import cron from "node-cron";
import { showMenu } from "./cli/prompt.js";
import { scrapeAllCities } from "./service/eventService.js";

cron.schedule("0 */4 * * *", async () => {
  console.log("\n[Cron] Starting background scrape...");
  await scrapeAllCities();
});

console.log("Background job scheduled (every 4 hours)");

showMenu();
