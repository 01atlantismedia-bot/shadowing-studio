// Lists YouTube interview videos for a person, using the official YouTube Data API.
// Needs an environment variable YOUTUBE_API_KEY (see README). Without it the app falls back to a YouTube search link.
exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=86400',
    'Netlify-CDN-Cache-Control': 'public, max-age=604800'
  };
  const key = process.env.YOUTUBE_API_KEY;
  const q = ((event.queryStringParameters || {}).q || '').trim().slice(0, 80);
  if (!q) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing query' }) };
  if (!key) return { statusCode: 501, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'No YOUTUBE_API_KEY set' }) };
  const url = 'https://www.googleapis.com/youtube/v3/search?' + new URLSearchParams({
    part: 'snippet', type: 'video', maxResults: '8', q,
    videoEmbeddable: 'true', videoCaption: 'closedCaption', videoDuration: 'medium',
    relevanceLanguage: 'en', safeSearch: 'strict', key
  });
  try {
    const r = await fetch(url);
    const d = await r.json();
    if (!r.ok) return { statusCode: 502, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: (d.error && d.error.message) || 'YouTube API error' }) };
    const items = (d.items || []).filter(i => i.id && i.id.videoId).map(i => ({
      id: i.id.videoId,
      title: i.snippet.title.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
      channel: i.snippet.channelTitle
    }));
    return { statusCode: 200, headers, body: JSON.stringify({ items }) };
  } catch (e) {
    return { statusCode: 502, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Search failed' }) };
  }
};
