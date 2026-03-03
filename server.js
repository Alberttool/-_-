const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const DB_DIR = path.join(__dirname, 'db');
const DB_FILE = path.join(DB_DIR, 'notes.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

async function ensureDbFile() {
  await fs.mkdir(DB_DIR, { recursive: true });
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, '[]', 'utf8');
  }
}

async function readNotes() {
  await ensureDbFile();
  const raw = await fs.readFile(DB_FILE, 'utf8');
  const notes = JSON.parse(raw);
  return Array.isArray(notes) ? notes : [];
}

async function writeNotes(notes) {
  await ensureDbFile();
  await fs.writeFile(DB_FILE, JSON.stringify(notes, null, 2), 'utf8');
}

app.get('/api/notes', async (_req, res) => {
  try {
    const notes = await readNotes();
    notes.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    res.json({ notes });
  } catch (error) {
    res.status(500).json({ error: '讀取資料失敗', detail: error.message });
  }
});

app.post('/api/notes', async (req, res) => {
  try {
    const text = (req.body?.text || '').trim();
    if (!text) {
      return res.status(400).json({ error: 'text 為必填欄位' });
    }

    const notes = await readNotes();
    const note = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      text,
      createdAt: new Date().toISOString(),
    };

    notes.push(note);
    await writeNotes(notes);
    res.status(201).json({ note });
  } catch (error) {
    res.status(500).json({ error: '新增資料失敗', detail: error.message });
  }
});

app.delete('/api/notes', async (_req, res) => {
  try {
    await writeNotes([]);
    res.json({ message: '所有留言已清空' });
  } catch (error) {
    res.status(500).json({ error: '清空失敗', detail: error.message });
  }
});

app.get('/api/notes/export.txt', async (_req, res) => {
  try {
    const notes = await readNotes();
    notes.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const lines = notes.map(
      (note, index) => `${index + 1}. [${note.createdAt}] ${String(note.text).replace(/\r?\n/g, ' ')}`,
    );
    const content = lines.join('\n');

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="notes-export.txt"');
    res.send(content);
  } catch (error) {
    res.status(500).json({ error: '匯出失敗', detail: error.message });
  }
});

app.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

ensureDbFile()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('初始化失敗:', error);
    process.exit(1);
  });
