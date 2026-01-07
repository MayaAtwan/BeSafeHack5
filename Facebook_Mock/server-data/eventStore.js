// Modular data layer for event storage
// Stage 1: no storage (Web Storage on client side)
// Stage 2: replace with real implementation (Mongo / SQLite / Postgres)

module.exports = {
  async saveEvent(event) {
    // Stage 1: do nothing
    // In the future: replace content here with real storage logic
    console.log("Received event (ignored in Web Storage mode):", event);
  }
};
