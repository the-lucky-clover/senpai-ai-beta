import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
  SENPAI_MEDIA: R2Bucket;
  SENPAI_KV: KVNamespace;
  AI: Ai;
};

const app = new Hono<{ Bindings: Bindings }>();

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

app.options('/*', (c) => c.text('ok', 200, corsHeaders()));

const authMiddleware = async (c: any, next: any) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const token = auth.slice(7);
  const result = await c.env.SENPAI_KV.get(`token:${token}`);
  if (!result) return c.json({ error: 'Invalid token' }, 401);
  c.set('userId', JSON.parse(result).userId);
  await next();
};

app.post('/api/auth/register', async (c) => {
  try {
    const { email, name } = await c.req.json();
    if (!email) return c.json({ error: 'Email required' }, 400);

    let userId: string;
    const existing = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first();

    if (existing) {
      userId = existing.id as string;
    } else {
      userId = crypto.randomUUID();
      await c.env.DB.prepare(
        'INSERT INTO users (id, email, name) VALUES (?, ?, ?)'
      ).bind(userId, email, name || email.split('@')[0]).run();
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await c.env.DB.prepare(
      'INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)'
    ).bind(token, userId, expiresAt).run();

    await c.env.SENPAI_KV.put(`token:${token}`, JSON.stringify({ userId, expiresAt }), {
      expirationTtl: 30 * 24 * 60 * 60,
    });

    return c.json({ token, userId, name }, 200, corsHeaders());
  } catch (err: any) {
    return c.json({ error: err.message }, 500, corsHeaders());
  }
});

app.post('/api/auth/login', async (c) => {
  try {
    const { email } = await c.req.json();
    if (!email) return c.json({ error: 'Email required' }, 400);

    const user = await c.env.DB.prepare(
      'SELECT id, name FROM users WHERE email = ?'
    ).bind(email).first();

    if (!user) return c.json({ error: 'User not found' }, 404);

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await c.env.DB.prepare(
      'INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)'
    ).bind(token, user.id, expiresAt).run();

    await c.env.SENPAI_KV.put(`token:${token}`, JSON.stringify({ userId: user.id, expiresAt }), {
      expirationTtl: 30 * 24 * 60 * 60,
    });

    return c.json({ token, userId: user.id, name: user.name }, 200, corsHeaders());
  } catch (err: any) {
    return c.json({ error: err.message }, 500, corsHeaders());
  }
});

app.get('/api/companions', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const result = await c.env.DB.prepare(
    'SELECT id, name, gender, personality_mix, maturity_toggle, appearance, voice, memory, created_at FROM companions WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(userId).all();
  return c.json({ companions: result.results }, 200, corsHeaders());
});

app.post('/api/companions', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const id = crypto.randomUUID();

    await c.env.DB.prepare(`
      INSERT INTO companions (id, user_id, name, gender, personality_mix, maturity_toggle, appearance, voice, memory)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      userId,
      body.name,
      body.gender || null,
      JSON.stringify(body.personalityMix || {}),
      body.maturityToggle ? 1 : 0,
      body.appearance || 'anime',
      body.voice || 'default',
      JSON.stringify(body.memory || []),
    ).run();

    return c.json({ id, message: 'Companion created' }, 201, corsHeaders());
  } catch (err: any) {
    return c.json({ error: err.message }, 500, corsHeaders());
  }
});

app.put('/api/companions/:id', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const id = c.req.param('id');
    const body = await c.req.json();

    const result = await c.env.DB.prepare(`
      UPDATE companions SET name = ?, gender = ?, personality_mix = ?, maturity_toggle = ?, appearance = ?, voice = ?, memory = ?, updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `).bind(
      body.name,
      body.gender,
      JSON.stringify(body.personalityMix || {}),
      body.maturityToggle ? 1 : 0,
      body.appearance,
      body.voice,
      JSON.stringify(body.memory || []),
      id,
      userId,
    ).run();

    if (result.changes === 0) return c.json({ error: 'Not found' }, 404);
    return c.json({ message: 'Updated' }, 200, corsHeaders());
  } catch (err: any) {
    return c.json({ error: err.message }, 500, corsHeaders());
  }
});

app.delete('/api/companions/:id', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM companions WHERE id = ? AND user_id = ?').bind(id, userId).run();
  return c.json({ message: 'Deleted' }, 200, corsHeaders());
});

app.get('/api/companions/:id/chats', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const result = await c.env.DB.prepare(
    'SELECT id, role, content, created_at FROM chats WHERE companion_id = ? ORDER BY created_at ASC'
  ).bind(id).all();
  return c.json({ chats: result.results }, 200, corsHeaders());
});

app.post('/api/companions/:id/chats', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const { role, content } = await c.req.json();
    const chatId = crypto.randomUUID();

    await c.env.DB.prepare(
      'INSERT INTO chats (id, companion_id, role, content) VALUES (?, ?, ?, ?)'
    ).bind(chatId, id, role, content).run();

    return c.json({ id: chatId, role, content }, 201, corsHeaders());
  } catch (err: any) {
    return c.json({ error: err.message }, 500, corsHeaders());
  }
});

app.get('/api/community', async (c) => {
  const type = c.req.query('type');
  const limit = parseInt(c.req.query('limit') || '20');
  let query = 'SELECT * FROM community_items ORDER BY rating DESC LIMIT ?';
  const params: any[] = [limit];
  if (type) {
    query = 'SELECT * FROM community_items WHERE type = ? ORDER BY rating DESC LIMIT ?';
    params.unshift(type);
  }
  const result = await c.env.DB.prepare(query).bind(...params).all();
  return c.json({ items: result.results }, 200, corsHeaders());
});

app.post('/api/community', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const id = crypto.randomUUID();

    await c.env.DB.prepare(`
      INSERT INTO community_items (id, user_id, prompt, type, image_url, video_url, rating, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      userId,
      body.prompt,
      body.type || 'image',
      body.imageUrl || null,
      body.videoUrl || null,
      body.rating || 0,
      body.category || 'general',
    ).run();

    return c.json({ id, message: 'Item added' }, 201, corsHeaders());
  } catch (err: any) {
    return c.json({ error: err.message }, 500, corsHeaders());
  }
});

app.put('/api/community/:id/rate', async (c) => {
  try {
    const id = c.req.param('id');
    const { rating } = await c.req.json();
    await c.env.DB.prepare('UPDATE community_items SET rating = ? WHERE id = ?').bind(rating, id).run();
    return c.json({ message: 'Rated' }, 200, corsHeaders());
  } catch (err: any) {
    return c.json({ error: err.message }, 500, corsHeaders());
  }
});

app.post('/api/media/upload', authMiddleware, async (c) => {
  try {
    const body = await c.req.body();
    const contentType = c.req.header('content-type') || 'application/octet-stream';
    const filename = c.req.header('x-filename') || `upload-${Date.now()}`;
    const key = `${c.get('userId')}/${filename}`;

    await c.env.SENPAI_MEDIA.put(key, body as BodyInit, {
      httpMetadata: { contentType },
    });

    const publicUrl = `https://pub-d21841ec547b4c77892f579ddf2e3b99.r2.dev/${key}`;
    return c.json({ url: publicUrl, key }, 201, corsHeaders());
  } catch (err: any) {
    return c.json({ error: err.message }, 500, corsHeaders());
  }
});

app.post('/api/generate/image', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const { prompt, negativePrompt, width = 800, height = 800, model = 'flux', seed } = body;

    if (!prompt?.trim()) {
      return c.json({ error: 'Prompt required' }, 400);
    }

    const fullPrompt = `${prompt}${negativePrompt ? `, negative: ${negativePrompt}` : ''}, high quality, masterpiece, anime style`;
    
    const response = await c.env.AI.run('@cf/black-forest-labs/flux-1-schnell', {
      prompt: fullPrompt,
      width,
      height,
      num_inference_steps: 4,
      seed: seed || Math.floor(Math.random() * 1000000),
    });

    if (!response || !response.image) {
      throw new Error('No image generated');
    }

    const imageArrayBuffer = response.image;
    const key = `${userId}/generated/${Date.now()}-${crypto.randomUUID()}.png`;
    
    await c.env.SENPAI_MEDIA.put(key, imageArrayBuffer, {
      httpMetadata: { contentType: 'image/png' },
    });

    const publicUrl = `https://pub-d21841ec547b4c77892f579ddf2e3b99.r2.dev/${key}`;

    await c.env.DB.prepare(`
      INSERT INTO community_items (id, user_id, prompt, type, image_url, rating, category)
      VALUES (?, ?, ?, 'image', ?, 0, 'generated')
    `).bind(crypto.randomUUID(), userId, prompt, publicUrl).run();

    return c.json({ url: publicUrl, prompt, width, height, seed }, 200, corsHeaders());
  } catch (err: any) {
    return c.json({ error: err.message || 'Generation failed' }, 500, corsHeaders());
  }
});

export default app;