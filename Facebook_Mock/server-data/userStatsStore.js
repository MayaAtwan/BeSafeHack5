let db = null;

module.exports = {
  init(mongoDb) {
    db = mongoDb;
    console.log("📊 userStatsStore initialized with MongoDB");

    // create index according to userId
    db.collection("user_stats").createIndex({ userId: 1 }, { unique: true });
  },

  /**
   * update user stats based on new analysis result
   * @param {string} userId
   * @param {object} analysisResult - analyzeWithOpenAI output
   */
  async updateStats(userId, analysisResult) {
    if (!db) {
      console.error("❌ DB not initialized");
      return;
    }

    try {
      const { is_harmful, labels } = analysisResult;

      // Retrieve existing stats
      let stats = await db.collection("user_stats").findOne({ userId });

      // if stats do not exist, create new document
      if (!stats) {
        stats = {
          userId,
          totalEvents: 0,
          harmfulCount: 0,
          positiveCount: 0,
          labelsCount: {},
          updatedAt: new Date()
        };
      }

      // Update total count
      stats.totalEvents++;

      // Update positive/negative counts
      if (is_harmful) {
        stats.harmfulCount++;
      } else {
        stats.positiveCount++;
      }

      // Update categories
      if (Array.isArray(labels)) {
        labels.forEach(label => {
          if (!stats.labelsCount[label]) {
            stats.labelsCount[label] = 0;
          }
          stats.labelsCount[label]++;
        });
      }

      stats.updatedAt = new Date();

      // save back to DB
      await db.collection("user_stats").updateOne(
        { userId },
        { $set: stats },
        { upsert: true }
      );

      console.log(`📈 Stats updated for user ${userId}`);
    } catch (err) {
      console.error("❌ Failed to update user stats:", err);
    }
  },

  /**
   * retrieve stats for a specific user
   * @param {string} userId
   */
  async getStats(userId) {
    if (!db) return null;
    return await db.collection("user_stats").findOne({ userId });
  }
};
