// backend/index.js
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { Pool } from 'pg';

dotenv.config();

// Инициализация Firebase Admin
const serviceAccount = JSON.parse(
  fs.readFileSync('serviceAccountKey.json', 'utf8')
);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(cors());
app.use(express.json());

// Инициализация PostgreSQL
const pool = new Pool({ connectionString: process.env.SUPABASE_URL });

// Мидлвар для проверки Firebase ID Token
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // содержит uid, email и т.д.
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// Тестовый эндпоинт
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(process.env.PORT, () => {
  console.log(`Backend running on port ${process.env.PORT}`);
});
