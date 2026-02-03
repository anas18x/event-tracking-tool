import dayjs from "dayjs";
import crypto from "crypto";

export function generateEventId(url) {
  return crypto.createHash("md5").update(url).digest("hex").substring(0, 12);
}


export function getCurrentTimestamp() {
  return dayjs().format("YYYY-MM-DD HH:mm:ss");
}

export function calculateExpiryDate(dateStr) {
  if (!dateStr) return dayjs().add(30, "day").format("YYYY-MM-DD");
  const eventDate = dayjs(dateStr);
  if (!eventDate.isValid()) return dayjs().add(30, "day").format("YYYY-MM-DD");
  return eventDate.add(1, "day").format("YYYY-MM-DD");
}



export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

