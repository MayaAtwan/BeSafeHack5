const OpenAI = require("openai");

// Only initialize OpenAI if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY) {
  try {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } catch (err) {
    console.warn("⚠️ OpenAI initialization failed:", err.message);
  }
}

async function analyzeWithOpenAI(event) {
  // Return early if OpenAI is not configured
  if (!openai) {
    console.warn("⚠️ OpenAI not configured, returning fallback analysis");
    return {
      is_harmful: false,
      labels: ["אחר (חיובי)"],
      explanation: "OpenAI not configured",
      confidence: 0
    };
  }
  if (!event || !event.post) {
    throw new Error("Invalid event format for analysis");
  }

  const post = event.post;

  // --- Extract post text ---
  const postText = post.message || "";

  // --- Extract comments ---
  const comments = Array.isArray(post.comments?.data)
    ? post.comments.data
    : [];

  // --- Extract image URLs from attachments ---
  let imageUrls = [];
  if (Array.isArray(post.attachments?.data)) {
    imageUrls = post.attachments.data
      .map(att => att?.media?.image?.src)
      .filter(Boolean);
  }

  // --- Build comments text ---
  const commentsText = comments
    .slice(0, 5)
    .map(c => (typeof c === "string" ? c : c?.message))
    .filter(Boolean)
    .join("\n");

  // --- Build images text ---
  const imagesText = imageUrls.length
    ? `\n\nIMAGES (urls):\n${imageUrls.slice(0, 3).join("\n")}`
    : "";

  // --- Final content sent to the model ---
  const content = `POST:\n${postText}\n\nCOMMENTS:\n${commentsText}${imagesText}`;
  console.log("🔍 Analyzing content with OpenAI:", content);

  // --- Prompt: teen-girl–focused safety classifier ---
  const prompt = `
You are a safety classifier specializing in evaluating online content for its potential impact on **teenage girls (ages 12–18)**.

Your job:
1. Determine whether the content is harmful or not for teenage girls.
2. Assign **all relevant categories** (multi-label).
3. Provide a short explanation.
4. Return a confidence score (0–1).
5. Return ONLY valid JSON. No extra text.

### NEGATIVE (harmful) categories:
- "אלימות"
- "דימוי גוף שלילי"
- "מיניות לא מותאמת"
- "עידוד צרכנות מוגזמת"
- "בריונות / השפלה"
- "הדרה חברתית"
- "שפה פוגענית"
- "עידוד התנהגות מסוכנת"
- "פגיעה עצמית / דיכאון"
- "הטרדה / סטוקינג"
- "לחץ חברתי / השוואתיות"
- "תוכן מסחרי מניפולטיבי"
- "אידיאליזציה של מערכות יחסים לא בריאות"
- "אחר (שלילי)"

### POSITIVE (healthy) categories:
- "העצמה אישית"
- "דימוי גוף חיובי"
- "מודעות לבריאות"
- "תמיכה רגשית"
- "תוכן חינוכי"
- "תוכן יצירתי"
- "תוכן חברתי בריא"
- "אחר (חיובי)"

### Output JSON schema:
{
  "is_harmful": boolean,
  "labels": string[],
  "explanation": string,
  "confidence": number
}

### Classification style:
- Use a **balanced** approach (not too strict, not too lenient).
- Consider emotional, social, and psychological impact on teenage girls.
- If unsure, include "אחר (חיובי)" or "אחר (שלילי)".
`;

  // --- Send to OpenAI ---
  const resp = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      { role: "system", content: "You are a teen-girl safety classifier. Output JSON only." },
      { role: "user", content: `${prompt}\n\nCONTENT:\n${content}` }
    ]
  });

  let text = (resp.output_text || "").trim();
  if (!text) throw new Error("Empty OpenAI response");

  // -----------------------------
  // 1) Try normal JSON.parse
  // -----------------------------
  try {
    return JSON.parse(text);
  } catch (err) {
    console.warn("⚠️ JSON parse failed, attempting fallback repair...");
  }

  // -----------------------------
  // 2) Try simple cleanup fixes
  // -----------------------------
  try {
    let fixed = text;

    const firstBrace = fixed.indexOf("{");
    const lastBrace = fixed.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      fixed = fixed.substring(firstBrace, lastBrace + 1);
    }

    fixed = fixed.replace(/'/g, '"');
    fixed = fixed.replace(/,\s*}/g, "}");

    return JSON.parse(fixed);
  } catch (err) {
    console.warn("⚠️ Simple JSON repair failed, requesting model self-repair...");
  }

  // -----------------------------
  // 3) Ask OpenAI to fix the JSON
  // -----------------------------
  try {
    const repairResp = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: "Fix the JSON. Return ONLY valid JSON. No explanation." },
        { role: "user", content: `Fix this JSON:\n${text}` }
      ]
    });

    const repaired = (repairResp.output_text || "").trim();
    return JSON.parse(repaired);
  } catch (err) {
    console.warn("⚠️ Model self-repair failed. Returning fallback object.");
  }

  // -----------------------------
  // 4) Final fallback
  // -----------------------------
  return {
    is_harmful: false,
    labels: ["אחר (חיובי)"],
    explanation: "Fallback: unable to parse model output.",
    confidence: 0
  };
}

module.exports = { analyzeWithOpenAI };
