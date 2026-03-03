const noteTextEl = document.getElementById('noteText');
const createBtnEl = document.getElementById('createBtn');
const clearBtnEl = document.getElementById('clearBtn');
const exportBtnEl = document.getElementById('exportBtn');
const statusEl = document.getElementById('status');
const notesListEl = document.getElementById('notesList');

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? '#c62828' : '#1b5e20';
}

function formatDate(isoDate) {
  try {
    return new Date(isoDate).toLocaleString('zh-TW', { hour12: false });
  } catch {
    return isoDate;
  }
}

function renderList(notes) {
  notesListEl.innerHTML = '';
  notes.forEach((note) => {
    const li = document.createElement('li');
    li.textContent = `[${formatDate(note.createdAt)}] ${note.text}`;
    notesListEl.appendChild(li);
  });
}

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzTRszzMdzJ22uF4zHgKumhvSK5W_wuCWVMg2rR7df3WlP_GDnZH7k9m-yjcevW7eAI/exec';

async function loadNotes() {
  const res = await fetch(SCRIPT_URL, { cache: 'no-store' });
  const data = await res.json();
  renderList(data.notes || []);
}

async function createNote() {
  const text = noteTextEl.value.trim();
  if (!text) {
    setStatus('請先輸入文字內容。', true);
    return;
  }

  createBtnEl.disabled = true;
  setStatus('送出中...');

  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      const errorPayload = await res.json().catch(() => ({}));
      throw new Error(errorPayload.error || '新增失敗');
    }

    noteTextEl.value = '';
    setStatus('新增成功');
    await loadNotes();
  } catch (error) {
    setStatus(error.message || '發生錯誤', true);
  } finally {
    createBtnEl.disabled = false;
  }
}

createBtnEl.addEventListener('click', createNote);

clearBtnEl.addEventListener('click', async () => {
  if (!confirm('確定要清空所有的留言嗎？清空後無法復原。')) return;

  clearBtnEl.disabled = true;
  setStatus('清空中...');
  try {
    // Apps script handles DELETE via POST with action
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'delete' }),
    });
    if (!res.ok) throw new Error('清空失敗');
    setStatus('已清空所有留言！');
    await loadNotes();
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    clearBtnEl.disabled = false;
  }
});

exportBtnEl.addEventListener('click', () => {
  window.open(SCRIPT_URL + '?action=export', '_blank');
});

loadNotes().catch((error) => {
  setStatus(`讀取失敗：${error.message}`, true);
});
