let db = null;

module.exports = {
  init(mongoDb) {
    db = mongoDb;
    console.log("📈 userStatsStore initialized");
  },

  async updateUserStats(userId, analysis) {
    if (!db) return;

    return db.collection("user_statistics").updateOne(
      { userId },
      {
        $inc: {
          //number of events created
          totalEvents: 1,

          //time watched in milliseconds
          totalDurationMs: analysis.engagement?.durationMs || 0,

          // attention score 
          totalAttentionScore: analysis.engagement?.score || 0,

          //count posts by sentiment
          sadPosts: analysis.text?.sentiment === "sad" ? 1 : 0,
          funnyPosts: analysis.text?.sentiment === "funny" ? 1 : 0,
          neutralPosts: analysis.text?.sentiment === "neutral" ? 1 : 0,

          //count of posts with images
          postsWithImages: analysis.media?.hasImage ? 1 : 0
        },

        //fields that are not cumulative but updated
        $set: {
          lastEventAt: new Date()
        }
      },
      { upsert: true }
    );
  }
};
