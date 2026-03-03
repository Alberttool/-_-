const POLL_INTERVAL_MS = 5000;
const MAX_NOTES = 45;

const wallEl = document.getElementById('wall');
const renderedIds = new Set();
const renderedQueue = [];
const notesLayouts = []; // Track active layouts to avoid overlap
let zIndexCounter = 10;

function getRandomLayout(note) {
  const noteW = 6.5; // CSS width%
  // Estimate height: base 34%, add ~12% for every 10 chars past 15
  const estimatedExtraH = Math.max(0, Math.floor((note.text.length - 15) / 10)) * 12;
  const noteH = 34 + estimatedExtraH;
  let bestX = 0;
  let bestY = 0;
  let minOverlap = Infinity;

  // Try random spots and pick the one with the smallest overlap area
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * (100 - noteW);
    const y = Math.random() * (100 - noteH);

    let overlap = 0;
    for (const layout of notesLayouts) {
      if (layout.id === note.id) continue;
      const intersectX = Math.max(0, Math.min(x + noteW, layout.x + layout.w) - Math.max(x, layout.x));
      const intersectY = Math.max(0, Math.min(y + noteH, layout.y + layout.h) - Math.max(y, layout.y));
      if (intersectX > 0 && intersectY > 0) {
        overlap += intersectX * intersectY;
      }
    }

    if (overlap === 0) {
      bestX = x;
      bestY = y;
      minOverlap = 0;
      break;
    }

    if (overlap < minOverlap) {
      minOverlap = overlap;
      bestX = x;
      bestY = y;
    }
  }

  const rotation = Math.random() * 10 - 5;

  // Store the layout so future notes can avoid it (with a 2% margin padding)
  notesLayouts.push({ id: note.id, x: bestX, y: bestY, w: noteW + 2, h: noteH + 3 });

  return { x: bestX, y: bestY, rotation };
}

function createNoteElement(note) {
  const { x, y, rotation } = getRandomLayout(note);
  const el = document.createElement('article');
  el.className = 'note';
  el.dataset.id = note.id;
  el.style.left = `${x}%`;
  el.style.top = `${y}%`;
  el.style.setProperty('--rotation', `${rotation.toFixed(2)}deg`);
  el.style.zIndex = zIndexCounter++; // Ensure newest notes are always stacked on top
  el.textContent = note.text;
  return el;
}

function removeOldestIfNeeded() {
  if (renderedQueue.length <= MAX_NOTES) {
    return;
  }

  const oldest = renderedQueue.shift();
  if (!oldest?.el) {
    return;
  }

  oldest.el.classList.add('removing');
  oldest.el.addEventListener(
    'animationend',
    () => {
      oldest.el.remove();
      renderedIds.delete(oldest.id);

      // Free up this coordinate space for new notes
      const layoutIdx = notesLayouts.findIndex(l => l.id === oldest.id);
      if (layoutIdx !== -1) notesLayouts.splice(layoutIdx, 1);
    },
    { once: true },
  );
}

function addNoteToWall(note) {
  if (renderedIds.has(note.id)) {
    return;
  }

  const el = createNoteElement(note);
  wallEl.appendChild(el);
  renderedIds.add(note.id);
  renderedQueue.push({ id: note.id, el });
  removeOldestIfNeeded();
}

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzTRszzMdzJ22uF4zHgKumhvSK5W_wuCWVMg2rR7df3WlP_GDnZH7k9m-yjcevW7eAI/exec';

async function fetchNotes() {
  const res = await fetch(SCRIPT_URL, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('讀取失敗');
  }
  const data = await res.json();
  return Array.isArray(data.notes) ? data.notes : [];
}

function seedInitialNotes(notes) {
  const initial = notes.slice(-MAX_NOTES);
  initial.forEach(addNoteToWall);
}

async function syncNotes(isInitial = false) {
  const notes = await fetchNotes();

  if (isInitial) {
    seedInitialNotes(notes);
    return;
  }

  notes.forEach((note) => {
    if (!renderedIds.has(note.id)) {
      addNoteToWall(note);
    }
  });
}

async function bootstrap() {
  try {
    await syncNotes(true);
  } catch (error) {
    console.error(error);
  }

  setInterval(async () => {
    try {
      await syncNotes(false);
    } catch (error) {
      console.error(error);
    }
  }, POLL_INTERVAL_MS);
}

bootstrap();
