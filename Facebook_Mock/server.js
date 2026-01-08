require('dotenv').config();

console.log("MONGO_URI =", process.env.MONGO_URI);

const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const eventStore = require('./server-data/eventStore');

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());

  // -------------------------
  // LOAD FEED.JSON
  // -------------------------
  const FEED_PATH = path.join(__dirname, 'feed.json');
  let feedData = { data: [], paging: {} };

  try {
    const raw = fs.readFileSync(FEED_PATH, 'utf-8');
    feedData = JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load feed.json:', err.message);
  }

  const posts = Array.isArray(feedData.data) ? feedData.data : [];

  // -------------------------
  // CONNECT TO MONGODB ONCE
  // -------------------------
  try {
    console.log("🔌 Connecting to MongoDB...");
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db("facebook_mock");
    eventStore.init(db);
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }

  // -------------------------
  // OPENAI ANALYSIS HELPER
  // -------------------------
  async function analyzeWithOpenAI({ postText = "", comments = [], imageUrls = [] }) {
    const commentsText = (comments || [])
      .slice(0, 5)
      .map(c => (typeof c === "string" ? c : c?.message))
      .filter(Boolean)
      .join("\n");

    const imagesText = (imageUrls || []).length
      ? `\n\nIMAGES (urls):\n${imageUrls.slice(0, 3).join("\n")}`
      : "";

    const content = `POST:\n${postText}\n\nCOMMENTS:\n${commentsText}${imagesText}`;

    const prompt = `Return ONLY valid JSON. No extra text.
Schema:
{
  "harm_score_0_100": number,
  "is_offensive": boolean,
  "risk_level": "low" | "medium" | "high",
  "labels": string[],
  "confidence_0_1": number,
  "reason_short": string,
  "evidence": string[]
}
Rules:
- harm_score_0_100: 0 harmless, 100 extremely harmful
- evidence: up to 3 short snippets copied from the input (or [] if none)
- labels examples: bullying, harassment, hate, sexual, violence, self_harm, body_shaming
`;

    const resp = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You are a teen-safety content classifier. The input may be Hebrew/Arabic/English. Output JSON only."
        },
        { role: "user", content: `${prompt}\n\nCONTENT:\n${content}` }
      ]
    });

    const text = (resp.output_text || "").trim();
    if (!text) throw new Error("Empty OpenAI response");

    return JSON.parse(text);
  }

  // -------------------------
  // HELPERS (from original code)
  // -------------------------
  function filterFieldsForPost(post, fieldsParam) {
    const requested = fieldsParam ? fieldsParam.split(',') : [];
    const result = {};

    if (!fieldsParam || requested.includes('id')) result.id = post.id;
    if (!fieldsParam || requested.includes('message')) result.message = post.message;
    if (!fieldsParam || requested.includes('created_time')) result.created_time = post.created_time;
    if (!fieldsParam || requested.includes('from')) result.from = post.from;

    if (requested.includes('attachments') && post.attachments) {
      result.attachments = { data: post.attachments };
    }

    if (requested.includes('comments') && post.comments) {
      result.comments = {
        data: post.comments.slice(0, 25),
        paging: { cursors: { before: "XYZ", after: "ABC" } }
      };
    }

    return result;
  }

  function buildPagingUrls(req, startIndex, limit, totalCount) {
    const baseUrl = `${req.protocol}://${req.get('host')}${req.path}`;
    const query = new URLSearchParams();

    if (req.query.fields) query.set('fields', req.query.fields);
    if (limit) query.set('limit', String(limit));

    const paging = {};
    const nextStart = startIndex + limit;

    if (nextStart < totalCount) {
      const nextQuery = new URLSearchParams(query);
      nextQuery.set('after', String(nextStart));
      paging.next = `${baseUrl}?${nextQuery.toString()}`;
    }

    if (startIndex > 0) {
      const prevStart = Math.max(0, startIndex - limit);
      const prevQuery = new URLSearchParams(query);
      prevQuery.set('after', String(prevStart));
      paging.previous = `${baseUrl}?${prevQuery.toString()}`;
    }

    return paging;
  }

  // -------------------------
  // ROUTES
  // -------------------------

  /**
   * GET /v17.0/me/home
   */
  app.get('/v17.0/me/home', (req, res) => {
    const { fields, limit: limitParam, after: afterParam } = req.query;

    const totalCount = posts.length;
    const limit = Math.max(1, Math.min(100, parseInt(limitParam, 10) || 25));
    const startIndex = Math.max(0, parseInt(afterParam, 10) || 0);
    const endIndex = Math.min(totalCount, startIndex + limit);

    const slice = posts.slice(startIndex, endIndex);
    const data = slice.map(post => filterFieldsForPost(post, fields));
    const paging = buildPagingUrls(req, startIndex, limit, totalCount);

    res.json({ data, paging });
  });

  /**
   * POST /events/view
   * Saves event to MongoDB and returns eventId
   */
  app.post('/events/view', async (req, res) => {
    const event = req.body;

    if (!event || !event.userId || !event.post || !event.post.id || !event.view) {
      return res.status(400).json({ error: { message: 'Invalid event format', type: 'InvalidRequest' } });
    }

    const insertedId = await eventStore.saveEvent(event);
    return res.status(201).json({ success: true, eventId: insertedId });
  });

  /**
   * POST /events/analyze
   * Receives an event object (with _id), analyzes, and stores analysis in MongoDB
   */
  app.post('/events/analyze', async (req, res) => {
    try {
      const event = req.body?.event;

      if (!event || !event.userId || !event.post || !event.post.id || !event.view) {
        return res.status(400).json({ error: "Invalid event format (same as /events/view)" });
      }

      const postText = event?.post?.message || "";
      const comments = event?.post?.comments || [];

      // try to extract image urls from attachments if exist
      const imageUrls = (event?.post?.attachments?.data || event?.post?.attachments || [])
        .map(a => a?.media?.image?.src || a?.image?.src || a?.src)
        .filter(Boolean)
        .slice(0, 3);

      const viewTimeMs = event?.view?.view_time_ms || event?.view?.viewTimeMs || 0;
      const openedSeeMore = event?.view?.opened_see_more === true || event?.view?.openedSeeMore === true;

      const countedInStats = viewTimeMs >= 2000 || openedSeeMore;

      if (!countedInStats) {
        // still save countedInStats=false if you want, but for POC we just return skipped
        return res.json({ skipped: true, countedInStats, viewTimeMs });
      }

      const analysis = await analyzeWithOpenAI({ postText, comments, imageUrls });

      if (event._id) {
        await eventStore.updateEventAnalysis(event._id, analysis, countedInStats);
      }

      return res.json({ analysis, countedInStats, viewTimeMs });
    } catch (err) {
      console.error("❌ Analyze failed:", err);
      res.status(500).json({ error: "Analyze failed", details: err.message });
    }
  });

  /**
   * POST /events/analyze/:id
   * More convenient: analyze by event id only (fetches event from DB first)
   */
  app.post('/events/analyze/:id', async (req, res) => {
    try {
      const eventId = req.params.id;
      const event = await eventStore.getEventById(eventId);

      if (!event) return res.status(404).json({ error: "Event not found" });

      const postText = event?.post?.message || "";
      const comments = event?.post?.comments || [];

      const imageUrls = (event?.post?.attachments?.data || event?.post?.attachments || [])
        .map(a => a?.media?.image?.src || a?.image?.src || a?.src)
        .filter(Boolean)
        .slice(0, 3);

      const viewTimeMs = event?.view?.view_time_ms || event?.view?.viewTimeMs || 0;
      const openedSeeMore = event?.view?.opened_see_more === true || event?.view?.openedSeeMore === true;

      const countedInStats = viewTimeMs >= 2000 || openedSeeMore;

      if (!countedInStats) {
        await eventStore.updateEventAnalysis(eventId, null, false); // optional: mark countedInStats=false
        return res.json({ skipped: true, countedInStats, viewTimeMs });
      }

      const analysis = await analyzeWithOpenAI({ postText, comments, imageUrls });
      await eventStore.updateEventAnalysis(eventId, analysis, countedInStats);

      return res.json({ analysis, countedInStats, viewTimeMs });
    } catch (err) {
      console.error("❌ Analyze by id failed:", err);
      res.status(500).json({ error: "Analyze failed", details: err.message });
    }
  });

  /**
   * GET /events
   * Returns all saved events from MongoDB
   */
  app.get('/events', async (req, res) => {
    try {
      const events = await eventStore.getAllEvents();
      res.json({ data: events });
    } catch (err) {
      console.error("❌ Failed to fetch events:", err);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  // -------------------------
  // START SERVER
  // -------------------------
  app.listen(PORT, () => {
    console.log(`Facebook demo API listening at http://localhost:${PORT}`);
  });
}

startServer();
