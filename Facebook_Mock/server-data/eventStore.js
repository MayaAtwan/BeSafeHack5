let db = null;

module.exports = {
  init(mongoDb) {
    db = mongoDb;
    console.log("📦 eventStore initialized with MongoDB");
  },

  async saveEvent(event) {
    if (!db) {
      console.error("❌ DB not initialized");
      return;
    }

    try {
      await db.collection("events").insertOne(event);
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
