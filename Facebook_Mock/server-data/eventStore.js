const { analyzeWithOpenAI } = require('./openAiService');
const userStatsStore = require('./userStatsStore');
const { ObjectId } = require("mongodb");
let db = null;

function toObjectId(id) {
  if (id instanceof ObjectId) return id;
  if (typeof id === "string" && ObjectId.isValid(id)) {
    return new ObjectId(id);
  }
  return null;
}

module.exports = {
  init(mongoDb) {
    db = mongoDb;
    console.log("📦 eventStore initialized with MongoDB");

    db.collection("events").createIndex(
      { timestamp: 1 },
      { expireAfterSeconds: 60 * 60 * 24 * 30 }
    );
  },
  
  async eventLogic(event) {
    // 1. save event
    const eventId = await this.saveEvent(event);

    // 2. analyze with OpenAI
    const analysisResult = await analyzeWithOpenAI(event);

    // 3. save the analysis in a separate table
    await this.addEventAnalysis(
      eventId,
      analysisResult,
      event
    );
    // 4. update user statistics
    await userStatsStore.updateStats(event.userId, analysisResult);
  },

  async saveEvent(event) {
    if (!db) {
      console.error("❌ DB not initialized");
      return;
    }

    try {
      const eventToSave = {
        ...event,
        timestamp: new Date(event.timestamp || Date.now())
      };

      const result = await db.collection("events").insertOne(eventToSave);
      console.log("📥 Event saved to MongoDB");

      return result.insertedId;
    } catch (err) {
      console.error("❌ Failed to save event:", err);
    }
  },

  async getAllEvents() {
    if (!db) return [];

    try {
      return await db.collection("events").find({}).toArray();
    } catch (err) {
      console.error("❌ Failed to read events:", err);
      return [];
    }
  },

  async addEventAnalysis(eventId, analysis, event) {
    if (!db) return;

    try {
      const _id = toObjectId(eventId);
      if (!_id) {
        console.error("❌ Invalid eventId for update:", eventId);
        return;
      }

      await db.collection("post_analytics").insertOne({
        eventId: _id, //link to the event
        event: event, //original event data
        analysis, //analysis result from OpenAI
        analyzedAt: new Date()
      });

      console.log("🧠 Analysis saved for event", _id.toString());
    } catch (err) {
      console.error("❌ Failed to update event analysis:", err);
    }
  }
};
