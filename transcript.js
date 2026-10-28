// Fetches YouTube captions server-side (browsers can't, due to CORS).
// Uses the unofficial "youtube-transcript" package, so it can break if YouTube changes things.
const { YoutubeTranscript } = require('youtube-transcript');

exports.handler = async (event) => {
  const id = (event.queryStringParameters || {}).id;
  const headers = { 'Content-Type': 'application/json' };
  if (!id || !/^[\w-]{11}$/.test(id)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Bad video id' }) };
  }
  try {
    const raw = await YoutubeTranscript.fetchTranscript(id, { lang: 'en' }).catch(() => YoutubeTranscript.fetchTranscript(id));
    // Some versions return ms, some seconds. Detect by typical caption duration.
    const avgDur = raw.reduce((a, r) => a + (r.duration || 0), 0) / Math.max(raw.length, 1);
    const div = avgDur > 50 ? 1000 : 1;
    const items = raw.map(r => ({ start: r.offset / div, text: r.text }));
    return { statusCode: 200, headers, body: JSON.stringify({ items }) };
  } catch (e) {
    return { statusCode: 404, headers, body: JSON.stringify({ error: 'No captions available for this video' }) };
  }
};
