const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Load feed.json once at startup
const FEED_PATH = path.join(__dirname, 'feed.json');
let feedData = { data: [], paging: {} };

try {
  const raw = fs.readFileSync(FEED_PATH, 'utf-8');
  feedData = JSON.parse(raw);
} catch (err) {
  console.error('Failed to load feed.json:', err.message);
}

const posts = Array.isArray(feedData.data) ? feedData.data : [];

/**
 * Apply Facebook-like "fields" filtering (top-level only).
 * Example: fields=id,message,from,attachments,comments
 */
function filterFieldsForPost(post, fieldsParam) {
  const requested = fieldsParam ? fieldsParam.split(',') : [];
  const result = {};

  // שדות בסיסיים שפייסבוק מחזיר כברירת מחדל
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

  // attachments — רק אם התבקש
  if (requested.includes('attachments') && post.attachments) {
    result.attachments = {
      data: post.attachments
    };
  }

  // comments — רק אם התבקש
  if (requested.includes('comments') && post.comments) {
    result.comments = {
      data: post.comments.slice(0, 25), // כמו פייסבוק: limit ברירת מחדל
      paging: {
        cursors: {
          before: "XYZ",
          after: "ABC"
        }
      }
    };
  }

  return result;
}

/**
 * Build paging URLs similar to Graph API:
 */
function buildPagingUrls(req, startIndex, limit, totalCount) {
  const baseUrl = `${req.protocol}://${req.get('host')}${req.path}`;

  const query = new URLSearchParams();

  // Keep fields param if provided
  if (req.query.fields) {
    query.set('fields', req.query.fields);
  }

  // Keep limit
  if (limit) {
    query.set('limit', String(limit));
  }

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

/**
 * GET /v17.0/me/home
 */
app.get('/v17.0/me/home', (req, res) => {
  const { fields, limit: limitParam, after: afterParam } = req.query;

  const totalCount = posts.length;

  const limit = Math.max(
    1,
    Math.min(100, parseInt(limitParam, 10) || 25) // default 25, max 100
  );

  const startIndex = Math.max(0, parseInt(afterParam, 10) || 0);
  const endIndex = Math.min(totalCount, startIndex + limit);

  const slice = posts.slice(startIndex, endIndex);
  const data = slice.map(post => filterFieldsForPost(post, fields));

  const paging = buildPagingUrls(req, startIndex, limit, totalCount);

  res.json({
    data,
    paging
  });
});

/**
 * POST /events/view
 */
const EVENTS_PATH = path.join(__dirname, 'events.json');

app.post('/events/view', (req, res) => {
  const {
    userId,
    postId,
    visiblePercentage,
    durationMs,
    videoWatchedMs,
    openedComments,
    timestamp
  } = req.body || {};

  if (!userId || !postId) {
    return res.status(400).json({
      error: {
        message: 'userId and postId are required',
        type: 'InvalidRequest'
      }
    });
  }

  const event = {
    userId,
    postId,
    visiblePercentage: Number(visiblePercentage) || 0,
    durationMs: Number(durationMs) || 0,
    videoWatchedMs: Number(videoWatchedMs) || 0,
    openedComments: Boolean(openedComments),
    timestamp: Number(timestamp) || Date.now()
  };

  // Load existing events (if any)
  let events = [];
  if (fs.existsSync(EVENTS_PATH)) {
    try {
      const raw = fs.readFileSync(EVENTS_PATH, 'utf-8');
      events = JSON.parse(raw);
      if (!Array.isArray(events)) {
        events = [];
      }
    } catch (err) {
      console.error('Failed to read events.json, resetting file:', err.message);
      events = [];
    }
  }

  events.push(event);

  try {
    fs.writeFileSync(EVENTS_PATH, JSON.stringify(events, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write events.json:', err.message);
    return res.status(201).json({
      success: true,
      warning: 'Event received but failed to persist on server'
    });
  }

  return res.status(201).json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Facebook demo API listening at http://localhost:${PORT}`);
});
