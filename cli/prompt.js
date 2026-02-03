import inquirer from "inquirer";
import { CITIES } from "../config/constants.js";
import { scrapeCity } from "../service/eventService.js";

export async function showMenu() {
  console.log("\n--- Event Scraper ---\n");

  const { city } = await inquirer.prompt([{
    type: "list",
    name: "city",
    message: "Select city to scrape:",
    choices: CITIES.map(c => ({ name: c.charAt(0).toUpperCase() + c.slice(1), value: c }))
  }]);

  console.log("\nScraping " + city + "...\n");
  
  try {
    const result = await scrapeCity(city);
    console.log("Done! Found " + result.eventsFound + " events");
    console.log("Added: " + result.added + ", Updated: " + result.updated);
  } catch (err) {
    console.log("Error: " + err.message);
  }

  const { again } = await inquirer.prompt([{
    type: "confirm",
    name: "again",
    message: "Scrape another city?",
    default: true
  }]);

  if (again) await showMenu();
}
