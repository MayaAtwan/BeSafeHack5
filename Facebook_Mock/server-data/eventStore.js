let db = null;

module.exports = {
  init(mongoDb) {
    db = mongoDb;
    console.log("📦 eventStore initialized with MongoDB");

    // Create TTL index so events auto-expire after 30 days
    db.collection("events").createIndex(
      { timestamp: 1 },
      { expireAfterSeconds: 60 * 60 * 24 * 30 } // 30 days
    );
  },

  async saveEvent(event) {
    if (!db) {
      console.error("❌ DB not initialized");
      return;
    }

    try {
      // Convert timestamp (number) → Date object for TTL to work
      const eventToSave = {
        ...event,
        timestamp: new Date(event.timestamp || Date.now())
      };

      await db.collection("events").insertOne(eventToSave);
      console.log("📥 Event saved to MongoDB");
    } catch (err) {
      console.error("❌ Failed to save event:", err);
    }
  },

  async getAllEvents() {
    if (!db) {
      console.error("❌ DB not initialized");
      return [];
    }

    try {
      return await db.collection("events").find({}).toArray();
    } catch (err) {
      console.error("❌ Failed to read events:", err);
      return [];
    }
  }
};
