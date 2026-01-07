require('dotenv').config();
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
  // HELPERS (from original code)
  // -------------------------

  function filterFieldsForPost(post, fieldsParam) {
    const requested = fieldsParam ? fieldsParam.split(',') : [];
    const result = {};

    if (!fieldsParam || requested.includes('id')) {
      result.id = post.id;
    }
    if (!fieldsParam || requested.includes('message')) {
      result.message = post.message;
    }
    if (!fieldsParam || requested.includes('created_time')) {
      result.created_time = post.created_time;
    }
    if (!fieldsParam || requested.includes('from')) {
      result.from = post.from;
    }

    if (requested.includes('attachments') && post.attachments) {
      result.attachments = { data: post.attachments };
    }

    if (requested.includes('comments') && post.comments) {
      result.comments = {
        data: post.comments.slice(0, 25),
        paging: {
          cursors: { before: "XYZ", after: "ABC" }
        }
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

    const limit = Math.max(
      1,
      Math.min(100, parseInt(limitParam, 10) || 25)
    );

    const startIndex = Math.max(0, parseInt(afterParam, 10) || 0);
    const endIndex = Math.min(totalCount, startIndex + limit);

    const slice = posts.slice(startIndex, endIndex);
    const data = slice.map(post => filterFieldsForPost(post, fields));

    const paging = buildPagingUrls(req, startIndex, limit, totalCount);

    res.json({ data, paging });
  });

  /**
   * POST /events/view
   * Accepts the NEW React event format
   */
  app.post('/events/view', async (req, res) => {
    const event = req.body;

    // Validate new event format
    if (
      !event ||
      !event.userId ||
      !event.post ||
      !event.post.id ||
      !event.view
    ) {
      return res.status(400).json({
        error: {
          message: 'Invalid event format',
          type: 'InvalidRequest'
        }
      });
    }

    await eventStore.saveEvent(event);

    return res.status(201).json({ success: true });
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
