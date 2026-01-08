let db = null;

module.exports = {
  init(mongoDb) {
    db = mongoDb;
    console.log("📊 postAnalyticsStore initialized");
  },

  async savePostAnalytics(eventId, analysis) {
    return db.collection("post_analytics").insertOne({
      eventId,
      analysis,
      createdAt: new Date()
    });
  },

  async getAllAnalytics() {
    return db.collection("post_analytics").find({}).toArray();
  }
};