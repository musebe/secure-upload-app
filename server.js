// server.js (CommonJS)

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { v2: cloudinary } = require('cloudinary');

// load .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// parse JSON bodies (for webhook)
app.use(express.json());

// allow requests from browser
app.use(cors());

// configure Cloudinary from env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// serve static files locally (Vercel will use /public instead,
// but this is nice for local dev)
const rootDir = __dirname;
app.use(express.static(rootDir));

// simple health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// DEBUG endpoint to confirm it works on Vercel
app.get('/api/debug', (req, res) => {
  res.json({
    ok: true,
    message: 'Secure upload backend is running',
    time: new Date().toISOString(),
  });
});

// status endpoint the front end polls
app.get('/api/status/:publicId', async (req, res) => {
  const publicId = req.params.publicId;

  try {
    console.log('Status check for:', publicId);

    const resource = await cloudinary.api.resource(publicId, {
      resource_type: 'image',
    });

    const moderationArr = resource.moderation || [];
    const moderation = moderationArr.find((m) => m.kind === 'perception_point');

    const status = moderation ? moderation.status : 'none';

    console.log('Status result:', publicId, '->', status);

    res.json({
      status,
      kind: moderation ? moderation.kind : null,
    });
  } catch (err) {
    console.error('Error fetching status:', err.message);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

// webhook (logging only)
app.post('/api/cloudinary-webhook', (req, res) => {
  console.log('Incoming webhook:', req.body);
  res.status(200).json({ received: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
