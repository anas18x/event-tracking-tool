import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// Load credentials - try multiple paths
let creds;
try {
  creds = require("../event-tracker-tool-f426422e53b9.json");
} catch {
  try {
    creds = require("../credentials.json");
  } catch {
    console.error("No credentials file found. Please add credentials.json or service account key file.");
    process.exit(1);
  }
}

const googleSheetConnection = () => {
  const SHEET_ID = process.env.SHEET_ID;
  
  if (!SHEET_ID) {
    throw new Error("SHEET_ID not found in environment variables");
  }

  const serviceAccountAuth = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  
  return new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
};

export { googleSheetConnection };
