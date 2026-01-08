let db = null;

// חשוב: ObjectId כדי לחפש ולעדכן לפי _id
const { ObjectId } = require("mongodb");

function toObjectId(id) {
  // אם כבר ObjectId
  if (id instanceof ObjectId) return id;

  // אם זה string תקין של ObjectId
  if (typeof id === "string" && ObjectId.isValid(id)) {
    return new ObjectId(id);
  }

  // אחרת נחזיר null
  return null;
}

module.exports = {
  init(mongoDb) {
    db = mongoDb;
    console.log("📦 eventStore initialized with MongoDB");

    // TTL: events auto-expire after 30 days
    db.collection("events").createIndex(
      { timestamp: 1 },
      { expireAfterSeconds: 60 * 60 * 24 * 30 }
    );
  },

  async saveEvent(event) {
    if (!db) {
      console.error("❌ DB not initialized");
      return null;
    }

    try {
      const eventToSave = {
        ...event,
        // TTL עובד רק על Date
        timestamp: new Date(event.timestamp || Date.now())
      };

      const result = await db.collection("events").insertOne(eventToSave);
      console.log("📥 Event saved to MongoDB");

      return result.insertedId; // ObjectId
    } catch (err) {
      console.error("❌ Failed to save event:", err);
      return null;
    }
  },

  async getEventById(eventId) {
    if (!db) {
      console.error("❌ DB not initialized");
      return null;
    }

    try {
      const _id = toObjectId(eventId);
      if (!_id) {
        console.error("❌ Invalid eventId:", eventId);
        return null;
      }

      return await db.collection("events").findOne({ _id });
    } catch (err) {
      console.error("❌ Failed to fetch event by id:", err);
      return null;
    }
  },

  async updateEventAnalysis(eventId, analysis, countedInStats) {
    if (!db) {
      console.error("❌ DB not initialized");
      return;
    }

    try {
      const _id = toObjectId(eventId);
      if (!_id) {
        console.error("❌ Invalid eventId for update:", eventId);
        return;
      }

      const update = {
        countedInStats,
        analyzedAt: new Date()
      };

      // אם אין analysis (למשל skipped) לא נכניס null אם לא רוצים
      if (analysis) {
        update.analysis = analysis;
      } else {
        // אופציונלי: למחוק analysis אם רוצים
        // update.analysis = null;
      }

      await db.collection("events").updateOne(
        { _id },
        { $set: update }
      );

      console.log("🧠 Analysis updated for event", _id.toString());
    } catch (err) {
      console.error("❌ Failed to update event analysis:", err);
    }
  },

  async getAllEvents() {
    if (!db) {
      console.error("❌ DB not initialized");
      return [];
    }

    try {
      // הכי חדשים קודם
      return await db.collection("events").find({}).sort({ timestamp: -1 }).toArray();
    } catch (err) {
      console.error("❌ Failed to read events:", err);
      return [];
    }
  }
};
