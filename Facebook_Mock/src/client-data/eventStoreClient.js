//DATA layer for event storage on client side
// Stage 1: localStorage saving
// Stage 2: can be replaced with IndexedDB or sending to server
const LOCAL_KEY = "events";
const MAX_EVENTS = 20000; // How many events to keep locally

export function saveEventLocally(event) {
  try {
    const events = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");

    // If we have exceeded the maximum number of events, delete the oldest one
    if (events.length >= MAX_EVENTS) {
      events.shift(); // Delete oldest event
    }

    events.push(event);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(events));
  } catch (err) {
    console.error("Failed to save event locally:", err);
  }
}

export function getLocalEvents() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

export function clearLocalEvents() {
  localStorage.removeItem(LOCAL_KEY);
}
