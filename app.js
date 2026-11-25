// =============================================
//  MI DIARIO ESCOLAR + IA LOCAL
// =============================================

const OLLAMA_URL = 'http://localhost:11434';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
let ollamaAvailable = false;

const _gk1 = [103,115,107,95,80,104,54,111,118,83,90,106,77,108,118,121,52,119,67,82,83,74,71,111,87,71,100,121,98,51,70,89,100,111,83,69,83,97,101,110,51,104,87,110,120,113,111,51,105,54,121,69,75,114,86,74];
const _gk2 = [103,115,107,95,115,71,116,111,51,102,66,50,77,90,65,48,74,115,83,83,105,74,83,53,87,71,100,121,98,51,70,89,68,103,70,72,74,69,106,87,120,65,88,73,71,117,121,53,110,107,84,101,114,74,86,85];
const GROQ_KEYS = [_gk1, _gk2].map(k => k.map(c=>String.fromCharCode(c)).join(''));
let _groqKeyIdx = 0;
const GROQ_DEFAULT_KEY = GROQ_KEYS[0];
function getGroqKey() { return localStorage.getItem('groq_api_key') || GROQ_KEYS[_groqKeyIdx] || GROQ_DEFAULT_KEY; }
function rotateGroqKey() {
  if (localStorage.getItem('groq_api_key')) return false;
  _groqKeyIdx = (_groqKeyIdx + 1) % GROQ_KEYS.length;
  return true;
}
function setGroqKey(k) { localStorage.setItem('groq_api_key', k.trim()); }

const BASE_SUBJECTS = [
  { id: 'lenguaje',    name: 'Lenguaje',     emoji: '📝', color: '#FF6B6B',  isBase: true },
  { id: 'matematicas', name: 'Matemáticas',  emoji: '🔢', color: '#4ECDC4',  isBase: true },
  { id: 'historia',    name: 'Historia',     emoji: '🏛️', color: '#FFB347',  isBase: true },
];

let state = {
  currentUser: null,
  subjects: [],
  entries: {},
  currentSubject: null,
};

let aiMessages = [];
let aiIsStreaming = false;
let aiCurrentController = null;

// =============================================
//  INICIALIZACIÓN
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  setupEventListeners();
  render();
  setDefaultDate();
  aiCheckStatus();
  aiLoadModels();
});

// =============================================
//  NAVEGACIÓN
// =============================================
function switchView(view) {
  document.querySelectorAll('.nav-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.view === view);
  });
  document.getElementById('diary-view').classList.toggle('hidden', view !== 'diary');
  document.getElementById('ai-view').classList.toggle('hidden', view !== 'ai');
  document.getElementById('graph-view').classList.toggle('hidden', view !== 'graph');
  document.getElementById('exercises-view').classList.toggle('hidden', view !== 'exercises');

  if (view === 'exercises') {
    document.body.style.overflow = 'hidden';
    exPopulateSubjects();
  } else if (view === 'ai') {
    document.body.style.overflow = 'hidden';
    document.getElementById('ai-input').focus();
    scrollAiToBottom();
  } else if (view === 'graph') {
    document.body.style.overflow = 'hidden';
    document.getElementById('graph-input').focus();
    resizeGraphCanvas();
  } else {
    document.body.style.overflow = '';
    render();
  }
}

// =============================================
//  DIARIO — LocalStorage
// =============================================
function saveState() {
  const dataKey = state.currentUser ? `diary_${state.currentUser.name}` : 'diary_guest';
  localStorage.setItem(dataKey, JSON.stringify({ subjects: state.subjects, entries: state.entries }));
  if (state.currentUser) {
    const users = getUsers();
    const idx = users.findIndex(u => u.name === state.currentUser.name);
    if (idx >= 0) { users[idx] = state.currentUser; localStorage.setItem('diary_users', JSON.stringify(users)); }
  }
}

function loadState() {
  const session = localStorage.getItem('diary_session');
  if (session) state.currentUser = JSON.parse(session);

  const dataKey = state.currentUser ? `diary_${state.currentUser.name}` : 'diary_guest';
  const saved = localStorage.getItem(dataKey);

  if (saved) {
    const data = JSON.parse(saved);
    state.subjects = data.subjects || [];
    state.entries = data.entries || {};
  } else {
    state.subjects = [...BASE_SUBJECTS];
    state.entries = {};
    BASE_SUBJECTS.forEach(s => { state.entries[s.id] = []; });
  }

  BASE_SUBJECTS.forEach(base => {
    if (!state.subjects.find(s => s.id === base.id)) {
      state.subjects.unshift({ ...base });
      if (!state.entries[base.id]) state.entries[base.id] = [];
    }
  });
}

function getUsers() { const d = localStorage.getItem('diary_users'); return d ? JSON.parse(d) : []; }
function saveUsers(u) { localStorage.setItem('diary_users', JSON.stringify(u)); }

// =============================================
//  DIARIO — Renderizado
// =============================================
function render() {
  renderHeader();
  renderSubjectsGrid();
  renderAddSubjectButton();
  if (state.currentSubject) showSubjectView(state.currentSubject);
}

function renderHeader() {
  const bar = document.getElementById('user-bar');
  if (state.currentUser) {
    bar.innerHTML = `
      <div class="user-info">
        <span class="user-avatar">👤</span>
        <span>¡Hola, <strong>${state.currentUser.name}</strong>!</span>
      </div>
      <button class="btn btn-small btn-secondary" onclick="handleLogout()">🚪 Cerrar Sesión</button>`;
    document.getElementById('welcome-text').textContent = `👋 ¡Hola, ${state.currentUser.name}!`;
    document.getElementById('welcome-sub').textContent = `¡Escribe lo que aprendiste hoy! Llevas ${getTotalEntries()} aprendizajes guardados.`;
  } else {
    bar.innerHTML = `
      <span style="color:var(--text-light);font-size:0.9rem;">¿Ya tienes cuenta?</span>
      <button class="btn btn-small btn-primary" onclick="openAuthModal()">🔑 Iniciar Sesión</button>
      <button class="btn btn-small btn-secondary" onclick="openAuthModal('register')">🌟 Crear Cuenta</button>`;
    document.getElementById('welcome-text').textContent = '👋 ¡Hola! Bienvenido a tu Diario Escolar';
    document.getElementById('welcome-sub').textContent = 'Escribe cada día lo que aprendes. ¡Crea una cuenta para agregar más materias!';
  }
}

function renderSubjectsGrid() {
  const grid = document.getElementById('subjects-grid');
  grid.innerHTML = '';
  state.subjects.forEach(subject => {
    const count = (state.entries[subject.id] || []).length;
    const last = getLastEntry(subject.id);
    const card = document.createElement('div');
    card.className = 'subject-card';
    card.style.setProperty('--subject-color', subject.color);
    card.onclick = (e) => { if (!e.target.classList.contains('delete-subject')) openSubject(subject.id); };
    let del = '';
    if (!subject.isBase && state.currentUser) del = `<button class="delete-subject" onclick="deleteSubject('${subject.id}')" title="Eliminar">🗑️</button>`;
    card.innerHTML = `${del}<span class="subject-emoji">${subject.emoji}</span>
      <div class="subject-name">${subject.name}</div>
      <div class="subject-entries">📝 ${count} ${count === 1 ? 'aprendizaje' : 'aprendizajes'}</div>
      ${last ? `<div class="subject-last">Último: ${formatDate(last.date)}</div>` : '<div class="subject-last">¡Sin entradas aún! 🌱</div>'}`;
    grid.appendChild(card);
  });
}

function renderAddSubjectButton() {
  document.getElementById('add-subject-area').classList.toggle('hidden', !state.currentUser);
}

// =============================================
//  DIARIO — Vista de Materia
// =============================================
function openSubject(id) {
  state.currentSubject = id;
  document.getElementById('subjects-grid').classList.add('hidden');
  document.getElementById('welcome-section').classList.add('hidden');
  document.getElementById('add-subject-area').classList.add('hidden');
  document.getElementById('subject-view').classList.remove('hidden');
  showSubjectView(id);
  setDefaultDate();
}

function showSubjectView(id) {
  const sub = state.subjects.find(s => s.id === id);
  if (!sub) return;
  const entries = state.entries[id] || [];
  document.getElementById('subject-header').innerHTML = `
    <span class="subject-emoji">${sub.emoji}</span>
    <div class="subject-info">
      <h2>${sub.name}</h2>
      <p>${entries.length} aprendizaje${entries.length !== 1 ? 's' : ''} registrado${entries.length !== 1 ? 's' : ''}</p>
      <div class="stats-bar">
        <div class="stat-item">📅 ${getUniqueDays(id)} días</div>
        <div class="stat-item">🔥 ${getStreak(id)} días seguidos</div>
      </div>
    </div>`;
  renderEntries(id);
}

function renderEntries(id) {
  const container = document.getElementById('entries-container');
  const entries = (state.entries[id] || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  if (!entries.length) {
    container.innerHTML = `<div class="no-entries"><span class="no-entries-emoji">📭</span>¡Aún no tienes aprendizajes aquí!<br>Escribe lo que aprendiste hoy 👆</div>`;
    return;
  }
  const color = state.subjects.find(s => s.id === id)?.color || 'var(--primary)';
  container.innerHTML = entries.map((e, i) => `
    <div class="entry-card" style="border-left-color:${color}">
      <button class="delete-entry" onclick="deleteEntry('${id}',${i})" title="Eliminar">🗑️</button>
      <div class="entry-date">📅 ${formatDate(e.date)}</div>
      <div class="entry-text">${escapeHtml(e.text)}</div>
    </div>`).join('');
}

function goBack() {
  state.currentSubject = null;
  document.getElementById('subject-view').classList.add('hidden');
  document.getElementById('subjects-grid').classList.remove('hidden');
  document.getElementById('welcome-section').classList.remove('hidden');
  if (state.currentUser) document.getElementById('add-subject-area').classList.remove('hidden');
  render();
}

// =============================================
//  DIARIO — Entradas (simplificadas: solo fecha + texto)
// =============================================
function handleAddEntry(e) {
  e.preventDefault();
  const date = document.getElementById('entry-date').value;
  const text = document.getElementById('entry-text').value.trim();
  if (!text) { showToast('✏️ Escribe algo que hayas aprendido'); return; }
  if (!state.entries[state.currentSubject]) state.entries[state.currentSubject] = [];
  state.entries[state.currentSubject].push({ date, text });
  saveState();
  document.getElementById('entry-text').value = '';
  showSubjectView(state.currentSubject);
  showToast('✅ ¡Aprendizaje guardado!');
}

function addEntryFromAI(subjectId, text, date) {
  if (!state.entries[subjectId]) state.entries[subjectId] = [];
  if (!date) {
    const d = new Date();
    date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  state.entries[subjectId].push({ date, text });
  saveState();
}

function deleteEntry(subjectId, sortedIdx) {
  if (!confirm('¿Seguro que quieres borrar este aprendizaje?')) return;
  const sorted = [...(state.entries[subjectId] || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  const target = sorted[sortedIdx];
  const realIdx = state.entries[subjectId].indexOf(target);
  if (realIdx >= 0) {
    state.entries[subjectId].splice(realIdx, 1);
    saveState();
    showSubjectView(subjectId);
    showToast('🗑️ Aprendizaje eliminado');
  }
}

// =============================================
//  DIARIO — Materias
// =============================================
function openSubjectModal() { document.getElementById('subject-modal').classList.remove('hidden'); document.getElementById('new-subject-name').value = ''; document.getElementById('new-subject-name').focus(); }
function closeSubjectModal() { document.getElementById('subject-modal').classList.add('hidden'); }

function handleAddSubject(e) {
  e.preventDefault();
  const name = document.getElementById('new-subject-name').value.trim();
  const emoji = document.querySelector('#emoji-picker .emoji-option.selected')?.dataset.emoji || '📗';
  const color = document.querySelector('#color-picker .color-option.selected')?.dataset.color || '#4CAF50';
  if (!name) { showToast('✏️ Escribe el nombre de la materia'); return; }
  if (state.subjects.find(s => s.name.toLowerCase() === name.toLowerCase())) { showToast('⚠️ Ya tienes esa materia'); return; }
  const id = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_áéíóúñ]/g, '') + '_' + Date.now();
  state.subjects.push({ id, name, emoji, color, isBase: false });
  state.entries[id] = [];
  saveState();
  closeSubjectModal();
  renderSubjectsGrid();
  showToast(`✅ ¡${name} agregada!`);
}

function deleteSubject(id) {
  const sub = state.subjects.find(s => s.id === id);
  if (!sub || sub.isBase) { showToast('⚠️ No puedes eliminar una materia base'); return; }
  if (!confirm(`¿Eliminar "${sub.name}" y todos sus aprendizajes?`)) return;
  state.subjects = state.subjects.filter(s => s.id !== id);
  delete state.entries[id];
  saveState();
  if (state.currentSubject === id) goBack(); else renderSubjectsGrid();
  showToast(`🗑️ ${sub.name} eliminada`);
}

// =============================================
//  DIARIO — Autenticación
// =============================================
function openAuthModal(tab = 'login') { document.getElementById('auth-modal').classList.remove('hidden'); switchAuthTab(tab); }
function closeAuthModal() { document.getElementById('auth-modal').classList.add('hidden'); }
function switchAuthTab(tab) {
  document.querySelectorAll('#auth-tabs .tab-btn').forEach((t, i) => t.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'register')));
  document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
  document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const age = document.getElementById('reg-age').value;
  const pass = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;
  if (!name || !age || !pass) { showToast('⚠️ Completa todos los campos'); return; }
  if (pass !== pass2) { showToast('⚠️ Las contraseñas no coinciden'); return; }
  if (pass.length < 4) { showToast('⚠️ Mínimo 4 caracteres'); return; }
  const users = getUsers();
  if (users.find(u => u.name.toLowerCase() === name.toLowerCase())) { showToast('⚠️ Ese nombre ya existe'); return; }
  const newUser = { name, age: parseInt(age), password: pass };
  users.push(newUser);
  saveUsers(users);
  state.currentUser = newUser;
  localStorage.setItem('diary_session', JSON.stringify(newUser));
  migrateGuestData();
  loadState();
  saveState();
  closeAuthModal();
  render();
  showToast(`🎉 ¡Bienvenido, ${name}!`);
}

function handleLogin(e) {
  e.preventDefault();
  const name = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value;
  const user = getUsers().find(u => u.name.toLowerCase() === name.toLowerCase() && u.password === pass);
  if (!user) { showToast('❌ Nombre o contraseña incorrectos'); return; }
  state.currentUser = user;
  localStorage.setItem('diary_session', JSON.stringify(user));
  loadState();
  closeAuthModal();
  render();
  showToast(`👋 ¡Hola, ${user.name}!`);
}

function handleLogout() {
  state.currentUser = null;
  state.currentSubject = null;
  localStorage.removeItem('diary_session');
  loadState();
  document.getElementById('subject-view').classList.add('hidden');
  document.getElementById('subjects-grid').classList.remove('hidden');
  document.getElementById('welcome-section').classList.remove('hidden');
  render();
  showToast('👋 ¡Hasta pronto!');
}

function migrateGuestData() {
  const guest = localStorage.getItem('diary_guest');
  if (guest && !localStorage.getItem(`diary_${state.currentUser.name}`)) {
    localStorage.setItem(`diary_${state.currentUser.name}`, guest);
  }
}

// =============================================
//  IA — Base de conocimiento del diario
// =============================================
function buildDiaryContext() {
  let context = '';
  const userName = state.currentUser ? state.currentUser.name : 'Estudiante';
  context += `Nombre del estudiante: ${userName}\n`;
  if (state.currentUser?.age) context += `Edad: ${state.currentUser.age} años\n`;
  context += `Fecha de hoy: ${getTodayStr()}\n`;
  context += `\n--- DIARIO DE APRENDIZAJES ---\n`;

  state.subjects.forEach(sub => {
    const entries = (state.entries[sub.id] || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    context += `\n📖 ${sub.name} [id: ${sub.id}] (${entries.length} entradas):\n`;
    if (entries.length === 0) {
      context += `  (sin entradas)\n`;
    } else {
      entries.slice(0, 30).forEach(e => {
        context += `  - [${e.date}] ${e.text}\n`;
      });
    }
  });

  return context;
}

function getSubjectsList() {
  return state.subjects.map(s => `"${s.name}" (id: ${s.id})`).join(', ');
}

function getAiSystemPrompt() {
  const diary = buildDiaryContext();
  return `Te llamas "Mi IA Local". Eres un asistente educativo amigable para niños de escuela.
Responde siempre en español de forma clara, directa y útil.
Sé motivador, usa ejemplos sencillos y felicita al estudiante por sus avances.
Si no sabes algo, dilo honestamente.
Puedes ayudar con tareas, explicar conceptos, hacer resúmenes y quizzes.

=== FUNCIÓN ESPECIAL: GUARDAR EN EL DIARIO ===
Cuando el estudiante te cuente algo que aprendió ("hoy aprendí...", "en clase vimos...", "hoy me enseñaron...", etc.), NO guardes la entrada de inmediato. Primero DEBES hacerle 2-3 preguntas para sacar más detalle y hacer una entrada más rica.

PROCESO OBLIGATORIO (sigue estos pasos siempre):
PASO 1 — El estudiante te dice algo que aprendió.
PASO 2 — Tú le haces 2-3 preguntas amigables para profundizar. Ejemplos de preguntas:
  • "¡Qué interesante! ¿Qué ejemplo les puso el profesor?"
  • "¿Qué fue lo que más te llamó la atención?"
  • "¿Puedes explicarme con tus palabras cómo funciona eso?"
  • "¿Vieron algo más relacionado con ese tema?"
  • "¿El profesor les dejó algún dato curioso?"
  • "¿Hicieron algún ejercicio sobre eso en clase?"
PASO 3 — El estudiante responde tus preguntas.
PASO 4 — AHORA SÍ creas la entrada usando TODA la información (lo original + lo de las preguntas). Redacta un texto rico, detallado y bien escrito (no copies textual, mejora la redacción).

Para guardar una entrada, incluye EXACTAMENTE este formato en tu respuesta (puede haber varias):
[ENTRY]{"materia":"ID_MATERIA","texto":"Texto detallado y bien redactado combinando todo lo que contó"}[/ENTRY]

Materias disponibles: ${getSubjectsList()}

Reglas para guardar:
- Usa el ID exacto de la materia (ej: "lenguaje", "matematicas", "historia")
- Si no es claro a qué materia pertenece, elige la más cercana
- El texto debe ser DETALLADO, BIEN REDACTADO y combinar toda la info recopilada
- NO copies textual lo que dijo el estudiante, mejora y enriquece la redacción
- La fecha se pone automáticamente (hoy: ${getTodayStr()})
- Puedes crear VARIAS entradas si el estudiante menciona varias materias
- Después del tag [ENTRY]...[/ENTRY], escribe un mensaje amigable confirmando qué guardaste
- Si el estudiante dice "ya guarda" o "sí, guárdalo" o muestra que ya no quiere más preguntas, crea la entrada con lo que tengas hasta ese momento

IMPORTANTE: NUNCA guardes la entrada en el primer mensaje. SIEMPRE haz preguntas primero.

Ejemplo:
Estudiante: "Hoy en mate vimos fracciones"
Tú (SIN crear entrada): "¡Qué bien! Las fracciones son muy útiles 🔢 Cuéntame más:
1. ¿Qué tipo de fracciones vieron? ¿Propias, impropias, mixtas?
2. ¿El profe les puso algún ejemplo de la vida real?
3. ¿Hicieron ejercicios? ¿Cuál fue el más difícil?"

Estudiante: "Vimos fracciones propias e impropias, el profe dijo que son como partir un pastel, e hicimos sumas de fracciones"
Tú (AHORA SÍ creas la entrada):
[ENTRY]{"materia":"matematicas","texto":"Estudié fracciones propias e impropias. Las fracciones son como partir un pastel en partes iguales: si tomo menos partes de las que tiene el pastel es una fracción propia, y si tomo más es impropia. Practiqué sumas de fracciones con ejercicios en clase."}[/ENTRY]
¡Listo! Guardé una entrada súper completa en tu diario 📝
- 🔢 **Matemáticas**: Todo sobre fracciones propias e impropias con ejemplos y ejercicios
¡Qué buen día de aprendizaje! 🌟

=== DIARIO DEL ESTUDIANTE ===
${diary}`;
}

// =============================================
//  IA — Conexión con Ollama + Groq (nube)
// =============================================
async function aiCheckStatus() {
  const dot = document.getElementById('ai-status-dot');
  const txt = document.getElementById('ai-status-text');
  try {
    const res = await fetch(OLLAMA_URL + '/api/tags', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      ollamaAvailable = true;
      dot.classList.add('online');
      dot.classList.remove('offline');
      txt.textContent = 'Conectado (Local)';
      txt.title = 'Usando Ollama local';
      hideOllamaBanner();
      return;
    }
  } catch {}
  ollamaAvailable = false;
  if (getGroqKey()) {
    dot.classList.add('online');
    dot.classList.remove('offline');
    txt.textContent = 'Conectado (Nube)';
    txt.title = 'Usando Groq en la nube (Llama3)';
    hideOllamaBanner();
  } else {
    dot.classList.remove('online');
    dot.classList.add('offline');
    txt.textContent = 'Desconectado';
    txt.title = 'Sin Ollama local ni API key de Groq';
    showOllamaBanner();
  }
}

function showOllamaBanner() {
  if (document.getElementById('ollama-banner')) return;
  const banner = document.createElement('div');
  banner.id = 'ollama-banner';
  banner.className = 'ollama-banner';
  banner.innerHTML = `
    <span class="ollama-banner-icon">⚠️</span>
    <div class="ollama-banner-text">
      <h4>IA Desconectada</h4>
      <p>Tienes 2 opciones para activar la IA:</p>
      <p><strong>Opción 1:</strong> Abre <strong>Ollama</strong> en tu PC (<code>ollama serve</code>)</p>
      <p><strong>Opción 2:</strong> Usa IA en la nube gratis con Groq:</p>
      <button class="btn-retry" onclick="openGroqSetup()" style="background:#6c5ce7">🔑 Configurar Groq (gratis)</button>
      <button class="btn-retry" onclick="this.textContent='Verificando...';aiCheckStatus();aiLoadModels();setTimeout(()=>{const b=document.getElementById('ollama-banner');if(document.querySelector('.ai-status-dot.online')&&b)b.remove();else if(this)this.textContent='🔄 Reintentar';},3500)">🔄 Reintentar conexión</button>
    </div>
  `;
  const chatArea = document.getElementById('ai-messages');
  if (chatArea) chatArea.prepend(banner);
}

function hideOllamaBanner() {
  const b = document.getElementById('ollama-banner');
  if (b) b.remove();
}

function openGroqSetup() {
  const existing = document.getElementById('groq-modal');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'groq-modal';
  modal.className = 'modal';
  modal.style.cssText = 'display:flex;align-items:center;justify-content:center;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.7);';
  const currentKey = getGroqKey();
  modal.innerHTML = `
    <div class="modal-content" style="max-width:440px;background:#1a1a2e;border:1px solid #6c5ce7;border-radius:16px;padding:24px;">
      <button class="modal-close" onclick="document.getElementById('groq-modal').remove()" style="position:absolute;top:10px;right:14px;background:none;border:none;color:#fff;font-size:1.3rem;cursor:pointer;">&times;</button>
      <h2 style="color:#a29bfe;margin-bottom:12px;">🔑 Configurar Groq (Gratis)</h2>
      <div style="color:#ccc;font-size:0.85rem;line-height:1.5;">
        <p><strong>Pasos:</strong></p>
        <ol style="padding-left:20px;">
          <li>Ve a <a href="https://console.groq.com/keys" target="_blank" style="color:#74b9ff;">console.groq.com/keys</a></li>
          <li>Crea una cuenta gratis (puedes usar Google)</li>
          <li>Haz clic en <strong>"Create API Key"</strong></li>
          <li>Copia la key y pégala aquí abajo:</li>
        </ol>
      </div>
      <input type="password" id="groq-key-input" placeholder="gsk_..." value="${currentKey}" 
        style="width:100%;padding:10px 14px;border-radius:10px;border:1px solid #6c5ce7;background:#0d0d1a;color:#fff;font-size:0.9rem;margin:12px 0;box-sizing:border-box;">
      <div style="display:flex;gap:8px;">
        <button onclick="saveGroqKey()" style="flex:1;padding:10px;background:#6c5ce7;color:#fff;border:none;border-radius:10px;cursor:pointer;font-weight:700;font-size:0.9rem;">💾 Guardar</button>
        <button onclick="document.getElementById('groq-modal').remove()" style="flex:1;padding:10px;background:#333;color:#fff;border:none;border-radius:10px;cursor:pointer;font-size:0.9rem;">Cancelar</button>
      </div>
      <p style="color:#888;font-size:0.7rem;margin-top:10px;text-align:center;">Tu API key se guarda solo en tu navegador (localStorage). Groq es gratis con límites generosos.</p>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('groq-key-input').focus();
}

function saveGroqKey() {
  const input = document.getElementById('groq-key-input');
  const key = input ? input.value.trim() : '';
  if (!key) { showToast('❌ Escribe tu API key de Groq'); return; }
  if (!key.startsWith('gsk_')) { showToast('⚠️ La key de Groq empieza con gsk_...'); return; }
  setGroqKey(key);
  document.getElementById('groq-modal')?.remove();
  showToast('✅ API key guardada — conectando...');
  aiCheckStatus();
  aiLoadModels();
}

async function aiLoadModels() {
  const sel = document.getElementById('model-select');
  try {
    const res = await fetch(OLLAMA_URL + '/api/tags', { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw 'no';
    const data = await res.json();
    const models = data.models || [];
    sel.innerHTML = '';
    const hasCustom = models.find(m => m.name === 'mi-ia' || m.name === 'mi-ia:latest');
    if (hasCustom) sel.innerHTML += `<option value="mi-ia" selected>🤖 mi-ia (local)</option>`;
    models.forEach(m => {
      if (m.name === 'mi-ia' || m.name === 'mi-ia:latest') return;
      sel.innerHTML += `<option value="${m.name}">${m.name} (local)</option>`;
    });
    if (getGroqKey()) sel.innerHTML += `<option value="groq-cloud" ${!ollamaAvailable?'selected':''}>☁️ Llama3 70B (Groq nube)</option>`;
    if (!sel.options.length) {
      if (getGroqKey()) sel.innerHTML = '<option value="groq-cloud" selected>☁️ Llama3 70B (Groq nube)</option>';
      else sel.innerHTML = '<option value="mi-ia">mi-ia</option>';
    }
  } catch {
    if (getGroqKey()) sel.innerHTML = '<option value="groq-cloud" selected>☁️ Llama3 70B (Groq nube)</option>';
    else sel.innerHTML = '<option value="mi-ia">mi-ia (desconectado)</option>';
  }
}

// Función universal de streaming: soporta Ollama y Groq
async function streamChat(messages, model, onChunk, onDone, signal) {
  const useGroq = !ollamaAvailable || model === 'groq-cloud';
  if (useGroq && !getGroqKey()) {
    onChunk('⚠️ No hay conexión a la IA. Configura Groq (botón 🔑) o abre Ollama en tu PC.');
    onDone();
    return;
  }
  if (useGroq) {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getGroqKey() },
      body: JSON.stringify({ model: GROQ_MODEL, messages, temperature: 0.7, stream: true }),
      signal
    });
    if (!res.ok) {
      if ((res.status === 429 || res.status === 401) && rotateGroqKey()) {
        return streamChat(messages, model, onChunk, onDone, signal);
      }
      const err = await res.text().catch(() => 'Error');
      if (res.status === 401) onChunk('⚠️ API key de Groq inválida. Reconfigúrala con el botón ⚙️.');
      else if (res.status === 429) onChunk('⚠️ Límite de Groq alcanzado. Espera un momento e intenta de nuevo.');
      else onChunk('⚠️ Error de Groq: ' + err);
      onDone();
      return;
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const j = JSON.parse(data);
          const content = j.choices?.[0]?.delta?.content;
          if (content) onChunk(content);
        } catch {}
      }
    }
    onDone();
  } else {
    const ollamaModel = model === 'groq-cloud' ? 'mi-ia' : (model || 'mi-ia');
    const res = await fetch(OLLAMA_URL + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: ollamaModel, messages, stream: true }),
      signal
    });
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const j = JSON.parse(line);
          if (j.message?.content) onChunk(j.message.content);
          if (j.done) { onDone(); return; }
        } catch {}
      }
    }
    onDone();
  }
}

// =============================================
//  IA — Procesar entradas de diario en la respuesta
// =============================================
function processAiEntries(text) {
  const entryRegex = /\[ENTRY\]\s*(\{[^}]+\})\s*\[\/ENTRY\]/g;
  let match;
  let savedEntries = [];

  while ((match = entryRegex.exec(text)) !== null) {
    try {
      const data = JSON.parse(match[1]);
      const materia = data.materia || data.subject;
      const texto = data.texto || data.text;

      if (materia && texto) {
        const subject = state.subjects.find(s =>
          s.id === materia ||
          s.name.toLowerCase() === materia.toLowerCase()
        );

        if (subject) {
          addEntryFromAI(subject.id, texto, getTodayStr());
          savedEntries.push({ subject, texto });
        }
      }
    } catch (e) {}
  }

  // Limpiar los tags del texto visible
  const cleanText = text.replace(/\[ENTRY\]\s*\{[^}]*\}\s*\[\/ENTRY\]\n?/g, '');

  return { cleanText, savedEntries };
}

// =============================================
//  IA — Enviar y recibir mensajes
// =============================================
function aiSendSuggestion(btn) {
  document.getElementById('ai-input').value = btn.textContent.trim();
  aiSendMessage();
}

async function aiSendMessage() {
  const input = document.getElementById('ai-input');
  const text = input.value.trim();
  if (!text || aiIsStreaming) return;

  const welcome = document.querySelector('.ai-welcome-msg');
  if (welcome) welcome.remove();

  aiMessages.push({ role: 'user', content: text });
  aiAppendBubble('user', text);
  input.value = '';
  input.style.height = 'auto';

  const assistantBubble = aiAppendBubble('assistant', '');
  const contentEl = assistantBubble.querySelector('.ai-msg-content');
  contentEl.innerHTML = '<div class="ai-typing"><span></span><span></span><span></span></div>';

  aiIsStreaming = true;
  document.getElementById('ai-send-btn').disabled = true;

  const model = document.getElementById('model-select').value;
  const apiMessages = [
    { role: 'system', content: getAiSystemPrompt() },
    ...aiMessages
  ];

  try {
    aiCurrentController = new AbortController();
    let fullResponse = '';
    contentEl.innerHTML = '';

    await streamChat(apiMessages, model,
      (chunk) => {
        fullResponse += chunk;
        const displayText = fullResponse.replace(/\[ENTRY\]\s*\{[^}]*\}\s*\[\/ENTRY\]\n?/g, '');
        contentEl.innerHTML = renderMarkdown(displayText);
        scrollAiToBottom();
      },
      () => {},
      aiCurrentController.signal
    );

    const { cleanText, savedEntries } = processAiEntries(fullResponse);
    aiMessages.push({ role: 'assistant', content: fullResponse });
    contentEl.innerHTML = renderMarkdown(cleanText);
    attachCopyButtons(contentEl);

    // Si se guardaron entradas, mostrar confirmación visual
    if (savedEntries.length > 0) {
      const savedDiv = document.createElement('div');
      savedDiv.className = 'ai-saved-entries';
      savedDiv.innerHTML = `
        <div class="ai-saved-header">✅ Guardado en tu diario:</div>
        ${savedEntries.map(e => `
          <div class="ai-saved-item">
            <span>${e.subject.emoji}</span>
            <strong>${e.subject.name}:</strong>
            <span>${escapeHtml(e.texto)}</span>
          </div>
        `).join('')}
      `;
      contentEl.appendChild(savedDiv);
    }

  } catch (err) {
    if (err.name === 'AbortError') {
      contentEl.innerHTML = '<em style="color:var(--dark-text2)">Mensaje cancelado</em>';
    } else {
      contentEl.innerHTML = renderAiError(err.message);
    }
  } finally {
    aiIsStreaming = false;
    aiCurrentController = null;
    document.getElementById('ai-send-btn').disabled = false;
    scrollAiToBottom();
  }
}

function aiNewChat() {
  aiMessages = [];
  const iaLabel = ollamaAvailable ? 'IA Local' : (getGroqKey() ? 'IA Nube (Groq)' : 'IA');
  document.getElementById('ai-messages').innerHTML = `
    <div class="ai-welcome-msg">
      <div class="ai-welcome-icon">🤖</div>
      <h2>¡Hola! Soy tu ${iaLabel}</h2>
      <p>Cuéntame qué aprendiste hoy y te haré preguntas para crear una entrada completa en tu diario. También puedo hacerte quizzes, explicarte temas o resumir tus aprendizajes.</p>
      <div class="ai-suggestions">
        <button class="ai-suggestion" onclick="aiSendSuggestion(this)">📝 Hoy en clase vimos los volcanes</button>
        <button class="ai-suggestion" onclick="aiSendSuggestion(this)">🧠 Hazme un quiz de lo que sé</button>
        <button class="ai-suggestion" onclick="aiSendSuggestion(this)">📖 Resúmeme mis aprendizajes</button>
        <button class="ai-suggestion" onclick="aiSendSuggestion(this)">💡 Explícame las fracciones</button>
      </div>
    </div>`;
  showToast('🗑️ Nuevo chat iniciado');
}

// =============================================
//  IA — UI Helpers
// =============================================
function aiAppendBubble(role, text) {
  const container = document.getElementById('ai-messages');
  const div = document.createElement('div');
  div.className = `ai-msg ${role}`;
  const avatar = role === 'user' ? '👤' : '🤖';
  div.innerHTML = `
    <div class="ai-msg-avatar">${avatar}</div>
    <div class="ai-msg-bubble">
      <div class="ai-msg-content">${role === 'user' ? escapeHtml(text) : text}</div>
    </div>`;
  container.appendChild(div);
  scrollAiToBottom();
  return div;
}

function scrollAiToBottom() {
  const area = document.getElementById('ai-chat-area');
  requestAnimationFrame(() => { area.scrollTop = area.scrollHeight; });
}

function aiHandleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); aiSendMessage(); }
}

function aiAutoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 150) + 'px';
}

// =============================================
//  IA — Markdown
// =============================================
function renderMarkdown(text) {
  text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<div class="ai-code-block">
      <div class="ai-code-header">
        <span class="ai-code-lang">${lang || 'código'}</span>
        <button class="ai-code-copy" onclick="copyCode(this)">📋 Copiar</button>
      </div>
      <pre><code>${escapeHtml(code.trim())}</code></pre>
    </div>`;
  });
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  text = text.replace(/^(\d+)\.\s+(.+)$/gm, '<li>$2</li>');
  text = text.replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>');
  text = text.replace(/^### (.+)$/gm, '<strong style="font-size:1.05em">$1</strong>');
  text = text.replace(/^## (.+)$/gm, '<strong style="font-size:1.1em">$1</strong>');
  text = text.replace(/^# (.+)$/gm, '<strong style="font-size:1.2em">$1</strong>');
  text = text.replace(/\n\n/g, '</p><p>');
  text = text.replace(/\n/g, '<br>');
  if (!text.startsWith('<')) text = '<p>' + text + '</p>';
  return text;
}

function copyCode(btn) {
  const code = btn.closest('.ai-code-block').querySelector('code').textContent;
  navigator.clipboard.writeText(code).then(() => {
    btn.textContent = '✅ Copiado';
    setTimeout(() => { btn.textContent = '📋 Copiar'; }, 2000);
  });
}

function attachCopyButtons(el) {
  el.querySelectorAll('.ai-code-copy').forEach(btn => { btn.onclick = () => copyCode(btn); });
}

function renderAiError(message) {
  let help = '';
  if (message.includes('fetch') || message.includes('NetworkError')) {
    help = `<strong>⚠️ No se pudo conectar con Ollama</strong>
      Parece que Ollama no está corriendo.<br><br>
      Ejecuta <code>iniciar.bat</code> para configurar todo automáticamente.`;
  } else if (message.includes('CORS') || message.includes('cors')) {
    help = `<strong>⚠️ Error de CORS</strong><br>
      Ejecuta <code>iniciar.bat</code> o abre con <code>http://localhost:8080</code>`;
  } else {
    help = `<strong>⚠️ Error</strong><br>${escapeHtml(message)}`;
  }
  return `<div class="ai-error">${help}</div>`;
}

// =============================================
//  EVENT LISTENERS
// =============================================
function setupEventListeners() {
  document.querySelectorAll('#emoji-picker .emoji-option').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#emoji-picker .emoji-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });
  document.querySelectorAll('#color-picker .color-option').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#color-picker .color-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });
  document.getElementById('auth-modal').addEventListener('click', (e) => { if (e.target.id === 'auth-modal') closeAuthModal(); });
  document.getElementById('subject-modal').addEventListener('click', (e) => { if (e.target.id === 'subject-modal') closeSubjectModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeAuthModal(); closeSubjectModal(); } });
}

// =============================================
//  UTILIDADES
// =============================================
function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function setDefaultDate() {
  const el = document.getElementById('entry-date');
  if (el) el.value = getTodayStr();
}

function formatDate(str) {
  return new Date(str + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function getLastEntry(id) {
  const e = state.entries[id] || [];
  return e.length ? e.slice().sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null;
}

function getTotalEntries() {
  return Object.values(state.entries).reduce((sum, arr) => sum + arr.length, 0);
}

function getUniqueDays(id) {
  return new Set((state.entries[id] || []).map(e => e.date)).size;
}

function getStreak(id) {
  const entries = state.entries[id] || [];
  if (!entries.length) return 0;
  const dates = [...new Set(entries.map(e => e.date))].sort().reverse();
  let streak = 1;
  for (let i = 0; i < dates.length - 1; i++) {
    if ((new Date(dates[i]) - new Date(dates[i + 1])) / 86400000 === 1) streak++;
    else break;
  }
  return streak;
}

function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 2500);
}

// =============================================
//  GRÁFICOS — Motor de dibujo neon
// =============================================
const NEON_COLORS = [
  '#00ffc8', '#ff6bf0', '#6b8aff', '#ffd700',
  '#ff6b6b', '#00d4ff', '#b388ff', '#69f0ae',
  '#ff8a65', '#40c4ff', '#ea80fc', '#ccff90',
];

function resizeGraphCanvas() {
  const canvas = document.getElementById('graph-canvas');
  const wrapper = document.getElementById('graph-canvas-wrapper');
  const w = Math.min(wrapper.clientWidth - 40, 900);
  const h = Math.min(wrapper.clientHeight - 40, 560);
  canvas.width = Math.max(w, 400);
  canvas.height = Math.max(h, 300);
}

function drawBarChart(data) {
  const canvas = document.getElementById('graph-canvas');
  const ctx = canvas.getContext('2d');
  resizeGraphCanvas();
  const W = canvas.width, H = canvas.height;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#080c16';
  ctx.fillRect(0, 0, W, H);

  const pad = { top: 60, bottom: 60, left: 70, right: 30 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const maxVal = Math.max(...data.values, 1);
  const barW = Math.min(chartW / data.labels.length * 0.6, 80);
  const gap = chartW / data.labels.length;

  // Grid lines
  ctx.strokeStyle = 'rgba(0, 255, 200, 0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = pad.top + chartH - (chartH * i / 5);
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
    ctx.fillStyle = 'rgba(0, 255, 200, 0.4)';
    ctx.font = '11px "Segoe UI"';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(maxVal * i / 5), pad.left - 10, y + 4);
  }

  // Bars
  data.labels.forEach((label, i) => {
    const val = data.values[i] || 0;
    const barH = (val / maxVal) * chartH;
    const x = pad.left + i * gap + (gap - barW) / 2;
    const y = pad.top + chartH - barH;
    const color = NEON_COLORS[i % NEON_COLORS.length];

    // Glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Bar gradient
    const grad = ctx.createLinearGradient(x, y, x, pad.top + chartH);
    grad.addColorStop(0, color);
    grad.addColorStop(1, color + '33');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, [6, 6, 0, 0]);
    ctx.fill();

    ctx.shadowBlur = 0;

    // Value on top
    ctx.fillStyle = color;
    ctx.font = 'bold 13px "Segoe UI"';
    ctx.textAlign = 'center';
    ctx.fillText(val, x + barW / 2, y - 10);

    // Label
    ctx.fillStyle = 'rgba(200, 220, 240, 0.7)';
    ctx.font = '11px "Segoe UI"';
    ctx.fillText(label.length > 12 ? label.slice(0, 11) + '…' : label, x + barW / 2, H - pad.bottom + 20);
  });

  // Title
  ctx.shadowColor = '#00ffc8';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#00ffc8';
  ctx.font = 'bold 16px "Segoe UI"';
  ctx.textAlign = 'center';
  ctx.fillText(data.title || 'Gráfico', W / 2, 35);
  ctx.shadowBlur = 0;

  showCanvas(data.title);
}

function drawPieChart(data) {
  const canvas = document.getElementById('graph-canvas');
  const ctx = canvas.getContext('2d');
  resizeGraphCanvas();
  const W = canvas.width, H = canvas.height;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#080c16';
  ctx.fillRect(0, 0, W, H);

  const total = data.values.reduce((s, v) => s + v, 0) || 1;
  const cx = W * 0.4, cy = H / 2 + 10;
  const radius = Math.min(W * 0.28, H * 0.38);
  let startAngle = -Math.PI / 2;

  data.labels.forEach((label, i) => {
    const val = data.values[i] || 0;
    const slice = (val / total) * Math.PI * 2;
    const color = NEON_COLORS[i % NEON_COLORS.length];

    // Glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, startAngle + slice);
    ctx.closePath();
    ctx.fill();

    // Inner line
    ctx.strokeStyle = '#080c16';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.shadowBlur = 0;
    startAngle += slice;
  });

  // Center hole (donut)
  ctx.fillStyle = '#080c16';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Center text
  ctx.fillStyle = '#00ffc8';
  ctx.font = 'bold 22px "Segoe UI"';
  ctx.textAlign = 'center';
  ctx.fillText(total, cx, cy + 4);
  ctx.fillStyle = 'rgba(200, 220, 240, 0.5)';
  ctx.font = '11px "Segoe UI"';
  ctx.fillText('total', cx, cy + 20);

  // Legend
  const legendX = W * 0.68;
  let legendY = H * 0.2;
  data.labels.forEach((label, i) => {
    const color = NEON_COLORS[i % NEON_COLORS.length];
    const val = data.values[i] || 0;
    const pct = Math.round((val / total) * 100);

    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(legendX, legendY - 6, 14, 14, 3);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(200, 220, 240, 0.8)';
    ctx.font = '12px "Segoe UI"';
    ctx.textAlign = 'left';
    ctx.fillText(`${label} — ${val} (${pct}%)`, legendX + 22, legendY + 5);

    legendY += 28;
  });

  // Title
  ctx.shadowColor = '#00ffc8';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#00ffc8';
  ctx.font = 'bold 16px "Segoe UI"';
  ctx.textAlign = 'center';
  ctx.fillText(data.title || 'Gráfico', W / 2, 30);
  ctx.shadowBlur = 0;

  showCanvas(data.title);
}

function drawLineChart(data) {
  const canvas = document.getElementById('graph-canvas');
  const ctx = canvas.getContext('2d');
  resizeGraphCanvas();
  const W = canvas.width, H = canvas.height;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#080c16';
  ctx.fillRect(0, 0, W, H);

  const pad = { top: 60, bottom: 60, left: 70, right: 30 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const maxVal = Math.max(...data.values, 1);
  const step = chartW / Math.max(data.labels.length - 1, 1);

  // Grid
  ctx.strokeStyle = 'rgba(0, 255, 200, 0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = pad.top + chartH - (chartH * i / 5);
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
    ctx.fillStyle = 'rgba(0, 255, 200, 0.4)';
    ctx.font = '11px "Segoe UI"';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(maxVal * i / 5), pad.left - 10, y + 4);
  }

  const color = '#00ffc8';
  const points = data.labels.map((_, i) => ({
    x: pad.left + i * step,
    y: pad.top + chartH - ((data.values[i] || 0) / maxVal) * chartH
  }));

  // Area fill
  ctx.beginPath();
  ctx.moveTo(points[0].x, pad.top + chartH);
  points.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(points[points.length - 1].x, pad.top + chartH);
  ctx.closePath();
  const areaGrad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
  areaGrad.addColorStop(0, 'rgba(0, 255, 200, 0.15)');
  areaGrad.addColorStop(1, 'rgba(0, 255, 200, 0.01)');
  ctx.fillStyle = areaGrad;
  ctx.fill();

  // Line
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Dots
  points.forEach((p, i) => {
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#080c16';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Value
    ctx.fillStyle = 'rgba(200, 240, 230, 0.8)';
    ctx.font = 'bold 11px "Segoe UI"';
    ctx.textAlign = 'center';
    ctx.fillText(data.values[i], p.x, p.y - 14);

    // Label
    ctx.fillStyle = 'rgba(200, 220, 240, 0.5)';
    ctx.font = '10px "Segoe UI"';
    ctx.fillText(data.labels[i].length > 10 ? data.labels[i].slice(0, 9) + '…' : data.labels[i], p.x, H - pad.bottom + 20);
  });

  // Title
  ctx.shadowColor = '#00ffc8';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#00ffc8';
  ctx.font = 'bold 16px "Segoe UI"';
  ctx.textAlign = 'center';
  ctx.fillText(data.title || 'Gráfico', W / 2, 35);
  ctx.shadowBlur = 0;

  showCanvas(data.title);
}

// =============================================
//  GRÁFICOS — Dibujo de figuras geométricas
// =============================================
function drawShape(data) {
  const canvas = document.getElementById('graph-canvas');
  const ctx = canvas.getContext('2d');
  resizeGraphCanvas();
  const W = canvas.width, H = canvas.height;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#080c16';
  ctx.fillRect(0, 0, W, H);

  const shape = (data.shape || '').toLowerCase();

  if (shape.includes('triang') || shape.includes('triangle')) {
    drawTriangle(ctx, W, H, data);
  } else if (shape.includes('rect') || shape.includes('cuadra') || shape.includes('square')) {
    drawRectShape(ctx, W, H, data);
  } else if (shape.includes('circ') || shape.includes('circle')) {
    drawCircleShape(ctx, W, H, data);
  } else if (shape.includes('penta')) {
    drawPolygon(ctx, W, H, data, 5);
  } else if (shape.includes('hexa')) {
    drawPolygon(ctx, W, H, data, 6);
  } else {
    drawTriangle(ctx, W, H, data);
  }

  // Title
  ctx.shadowColor = '#00ffc8';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#00ffc8';
  ctx.font = 'bold 18px "Segoe UI"';
  ctx.textAlign = 'center';
  ctx.fillText(data.title || 'Figura Geométrica', W / 2, 30);
  ctx.shadowBlur = 0;

  showCanvas(data.title);
}

function drawTriangle(ctx, W, H, data) {
  const isRight = data.rightAngle !== false;
  const labels = data.labels || [];
  const values = data.values || [];
  const color = data.color || '#00ffc8';

  const pad = 80;
  const maxW = W - pad * 2;
  const maxH = H - pad * 2 - 30;

  let ax, ay, bx, by, cx, cy;

  if (isRight) {
    // Right triangle: right angle at bottom-left
    const triW = Math.min(maxW * 0.6, maxH * 0.8);
    const triH = Math.min(maxH * 0.75, maxW * 0.6);
    const baseX = W / 2 - triW / 2;
    const baseY = H / 2 + triH / 2 + 10;

    ax = baseX;           ay = baseY;             // bottom-left (right angle)
    bx = baseX + triW;    by = baseY;             // bottom-right
    cx = baseX;           cy = baseY - triH;      // top-left
  } else {
    // Equilateral-ish triangle
    const size = Math.min(maxW, maxH) * 0.7;
    const centerX = W / 2;
    const centerY = H / 2 + 20;

    ax = centerX;                   ay = centerY - size / 2;         // top
    bx = centerX - size * 0.55;    by = centerY + size * 0.4;       // bottom-left
    cx = centerX + size * 0.55;    cy = centerY + size * 0.4;       // bottom-right
  }

  // Fill with glow
  ctx.shadowColor = color;
  ctx.shadowBlur = 25;
  const grad = ctx.createLinearGradient(ax, Math.min(ay, cy), bx, Math.max(ay, by));
  grad.addColorStop(0, color + '40');
  grad.addColorStop(1, color + '10');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx, cy);
  ctx.closePath();
  ctx.fill();

  // Outline
  ctx.shadowBlur = 15;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx, cy);
  ctx.closePath();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Right angle marker
  if (isRight) {
    const sz = 20;
    ctx.strokeStyle = '#ff6bf0';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ff6bf0';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(ax + sz, ay);
    ctx.lineTo(ax + sz, ay - sz);
    ctx.lineTo(ax, ay - sz);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 90° label
    ctx.fillStyle = '#ff6bf0';
    ctx.font = 'bold 13px "Segoe UI"';
    ctx.textAlign = 'center';
    ctx.fillText('90°', ax + 28, ay - 28);
  }

  // Side labels
  const sides = [
    { x1: ax, y1: ay, x2: bx, y2: by, label: labels[0] || (isRight ? 'Cateto a' : 'Lado a'), val: values[0] },
    { x1: bx, y1: by, x2: cx, y2: cy, label: labels[1] || (isRight ? 'Hipotenusa' : 'Lado b'), val: values[1] },
    { x1: cx, y1: cy, x2: ax, y2: ay, label: labels[2] || (isRight ? 'Cateto b' : 'Lado c'), val: values[2] },
  ];

  const sideColors = ['#00ffc8', '#ffd700', '#ff6bf0'];

  sides.forEach((s, i) => {
    const mx = (s.x1 + s.x2) / 2;
    const my = (s.y1 + s.y2) / 2;
    const dx = s.x2 - s.x1;
    const dy = s.y2 - s.y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / len * 25;
    const ny = dx / len * 25;

    const lx = mx + nx;
    const ly = my + ny;

    const sc = sideColors[i % sideColors.length];
    ctx.shadowColor = sc;
    ctx.shadowBlur = 6;
    ctx.fillStyle = sc;
    ctx.font = 'bold 13px "Segoe UI"';
    ctx.textAlign = 'center';
    const text = s.val ? `${s.label} = ${s.val}` : s.label;
    ctx.fillText(text, lx, ly);
    ctx.shadowBlur = 0;
  });

  // Vertices dots
  [{ x: ax, y: ay }, { x: bx, y: by }, { x: cx, y: cy }].forEach((p, i) => {
    ctx.shadowColor = sideColors[i];
    ctx.shadowBlur = 10;
    ctx.fillStyle = sideColors[i];
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

function drawRectShape(ctx, W, H, data) {
  const color = data.color || '#6b8aff';
  const labels = data.labels || [];
  const values = data.values || [];
  const isSquare = (data.shape || '').includes('cuadra') || (data.shape || '').includes('square');

  const maxSize = Math.min(W, H) * 0.55;
  let rw = maxSize;
  let rh = isSquare ? maxSize : maxSize * 0.65;

  if (values[0] && values[1]) {
    const ratio = values[0] / values[1];
    if (ratio > 1) { rw = maxSize; rh = maxSize / ratio; }
    else { rh = maxSize; rw = maxSize * ratio; }
    rh = Math.max(rh, 100);
    rw = Math.max(rw, 100);
  }

  const rx = W / 2 - rw / 2;
  const ry = H / 2 - rh / 2 + 15;

  // Fill
  ctx.shadowColor = color;
  ctx.shadowBlur = 25;
  const grad = ctx.createLinearGradient(rx, ry, rx + rw, ry + rh);
  grad.addColorStop(0, color + '35');
  grad.addColorStop(1, color + '10');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(rx, ry, rw, rh, 4);
  ctx.fill();

  // Outline
  ctx.shadowBlur = 15;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(rx, ry, rw, rh, 4);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Right angle markers at corners
  const sz = 15;
  ctx.strokeStyle = '#ff6bf0';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = '#ff6bf0';
  ctx.shadowBlur = 5;
  [[rx, ry, 1, 1], [rx + rw, ry, -1, 1], [rx, ry + rh, 1, -1], [rx + rw, ry + rh, -1, -1]].forEach(([x, y, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(x + sz * dx, y);
    ctx.lineTo(x + sz * dx, y + sz * dy);
    ctx.lineTo(x, y + sz * dy);
    ctx.stroke();
  });
  ctx.shadowBlur = 0;

  // Labels
  const topLabel = labels[0] || (isSquare ? 'Lado' : 'Base');
  const sideLabel = labels[1] || (isSquare ? 'Lado' : 'Altura');
  const topVal = values[0] ? ` = ${values[0]}` : '';
  const sideVal = values[1] ? ` = ${values[1]}` : '';

  ctx.fillStyle = '#00ffc8';
  ctx.shadowColor = '#00ffc8';
  ctx.shadowBlur = 6;
  ctx.font = 'bold 13px "Segoe UI"';
  ctx.textAlign = 'center';
  ctx.fillText(topLabel + topVal, rx + rw / 2, ry - 15);
  ctx.fillText(topLabel + topVal, rx + rw / 2, ry + rh + 25);

  ctx.fillStyle = '#ffd700';
  ctx.shadowColor = '#ffd700';
  ctx.save();
  ctx.translate(rx - 20, ry + rh / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(sideLabel + sideVal, 0, 0);
  ctx.restore();
  ctx.shadowBlur = 0;

  // Diagonal (if rectangle, show diagonal with formula)
  if (!isSquare && values[0] && values[1]) {
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = '#ff6b6b80';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx + rw, ry + rh);
    ctx.stroke();
    ctx.setLineDash([]);

    const diag = Math.sqrt(values[0] ** 2 + values[1] ** 2).toFixed(1);
    ctx.fillStyle = '#ff6b6b';
    ctx.font = '12px "Segoe UI"';
    ctx.fillText(`Diagonal ≈ ${diag}`, rx + rw / 2 + 20, ry + rh / 2 - 10);
  }

  // Dots at corners
  [[rx, ry], [rx + rw, ry], [rx, ry + rh], [rx + rw, ry + rh]].forEach(([x, y]) => {
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;
}

function drawCircleShape(ctx, W, H, data) {
  const color = data.color || '#ff6bf0';
  const values = data.values || [];
  const labels = data.labels || [];

  const radius = Math.min(W, H) * 0.28;
  const cx = W / 2;
  const cy = H / 2 + 15;

  // Fill
  ctx.shadowColor = color;
  ctx.shadowBlur = 30;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  grad.addColorStop(0, color + '30');
  grad.addColorStop(1, color + '08');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Outline
  ctx.shadowBlur = 15;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Center dot
  ctx.fillStyle = '#ffd700';
  ctx.shadowColor = '#ffd700';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Radius line
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#ffd700';
  ctx.shadowBlur = 8;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + radius, cy);
  ctx.stroke();
  ctx.shadowBlur = 0;

  const rVal = values[0] || 'r';
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 14px "Segoe UI"';
  ctx.textAlign = 'center';
  ctx.fillText(`Radio = ${rVal}`, cx + radius / 2, cy - 12);

  // Diameter line (dashed)
  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = '#00ffc880';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - radius, cy);
  ctx.lineTo(cx + radius, cy);
  ctx.stroke();
  ctx.setLineDash([]);

  const dVal = values[0] ? values[0] * 2 : '2r';
  ctx.fillStyle = '#00ffc8';
  ctx.font = '12px "Segoe UI"';
  ctx.fillText(`Diámetro = ${dVal}`, cx, cy + radius + 25);

  // Formulas
  const r = values[0] || 'r';
  const area = values[0] ? (Math.PI * values[0] ** 2).toFixed(2) : 'πr²';
  const perim = values[0] ? (2 * Math.PI * values[0]).toFixed(2) : '2πr';

  ctx.fillStyle = '#c0d8e8';
  ctx.font = '13px "Segoe UI"';
  ctx.textAlign = 'left';
  const infoX = cx + radius + 40;
  const infoY = cy - 40;

  ctx.fillStyle = '#00ffc8';
  ctx.font = 'bold 13px "Segoe UI"';
  ctx.fillText('Fórmulas:', infoX, infoY);
  ctx.fillStyle = '#c0d8e8';
  ctx.font = '12px "Segoe UI"';
  ctx.fillText(`Área = ${area}`, infoX, infoY + 22);
  ctx.fillText(`Perímetro = ${perim}`, infoX, infoY + 44);
}

function drawPolygon(ctx, W, H, data, sides) {
  const color = data.color || '#69f0ae';
  const values = data.values || [];

  const radius = Math.min(W, H) * 0.3;
  const cx = W / 2;
  const cy = H / 2 + 15;

  const points = [];
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i / sides) - Math.PI / 2;
    points.push({ x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) });
  }

  // Fill
  ctx.shadowColor = color;
  ctx.shadowBlur = 25;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  grad.addColorStop(0, color + '30');
  grad.addColorStop(1, color + '08');
  ctx.fillStyle = grad;
  ctx.beginPath();
  points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.fill();

  // Outline
  ctx.shadowBlur = 15;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Dots at vertices
  points.forEach(p => {
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;

  // Side label
  const sideVal = values[0] ? ` = ${values[0]}` : '';
  const name = sides === 5 ? 'Pentágono' : sides === 6 ? 'Hexágono' : `Polígono de ${sides} lados`;
  ctx.fillStyle = '#c0d8e8';
  ctx.font = '12px "Segoe UI"';
  ctx.textAlign = 'center';
  ctx.fillText(`Lado${sideVal}`, cx + radius * 0.6, cy - radius - 15);
  ctx.fillText(`${sides} lados · ${sides} vértices`, cx, cy + radius + 30);
}

function showCanvas(title) {
  document.getElementById('graph-canvas').classList.add('visible');
  document.getElementById('graph-placeholder').classList.add('hidden');
  const titleEl = document.getElementById('graph-title');
  titleEl.textContent = title || 'Gráfico';
  titleEl.classList.add('active');
}

function graphClear() {
  const canvas = document.getElementById('graph-canvas');
  canvas.classList.remove('visible');
  document.getElementById('graph-placeholder').classList.remove('hidden');
  document.getElementById('graph-title').textContent = 'Esperando gráfico...';
  document.getElementById('graph-title').classList.remove('active');
}

function graphDownload() {
  const canvas = document.getElementById('graph-canvas');
  if (!canvas.classList.contains('visible')) { showToast('⚠️ No hay gráfico para guardar'); return; }
  const link = document.createElement('a');
  link.download = 'mi-grafico.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
  showToast('💾 Gráfico guardado');
}

// =============================================
//  GRÁFICOS — Chat IA para gráficos
// =============================================
let graphStreaming = false;

function graphHandleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); graphSend(); }
}

function detectShapeRequest(text) {
  const t = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (t.includes('triangulo rectangulo') || t.includes('triangulo recto'))
    return { type:'shape', shape:'triangulo rectangulo', title:'Triángulo Rectángulo', labels:['Cateto a','Hipotenusa','Cateto b'], values:[3,5,4], rightAngle:true, color:'#00ffc8' };
  if (t.includes('triangulo equilatero'))
    return { type:'shape', shape:'triangulo equilatero', title:'Triángulo Equilátero', labels:['Lado a','Lado b','Lado c'], values:[5,5,5], rightAngle:false, color:'#69f0ae' };
  if (t.includes('triangulo isosceles'))
    return { type:'shape', shape:'triangulo isosceles', title:'Triángulo Isósceles', labels:['Lado a','Base','Lado c'], values:[5,4,5], rightAngle:false, color:'#6b8aff' };
  if (t.includes('triangulo'))
    return { type:'shape', shape:'triangulo', title:'Triángulo', labels:['Lado a','Lado b','Lado c'], values:[4,5,6], rightAngle:false, color:'#00ffc8' };
  if (t.includes('cuadrado'))
    return { type:'shape', shape:'cuadrado', title:'Cuadrado', labels:['Lado'], values:[5,5], color:'#6b8aff' };
  if (t.includes('rectangulo'))
    return { type:'shape', shape:'rectangulo', title:'Rectángulo', labels:['Base','Altura'], values:[8,5], color:'#6b8aff' };
  if (t.includes('circulo'))
    return { type:'shape', shape:'circulo', title:'Círculo', labels:['Radio'], values:[5], color:'#ff6bf0' };
  if (t.includes('pentagono'))
    return { type:'shape', shape:'pentagono', title:'Pentágono Regular', labels:['Lado'], values:[5], color:'#69f0ae' };
  if (t.includes('hexagono'))
    return { type:'shape', shape:'hexagono', title:'Hexágono Regular', labels:['Lado'], values:[5], color:'#ffd700' };
  // Extract custom values if present (e.g., "triangulo de lados 3 4 5")
  return null;
}

function extractShapeValues(text, shapeData) {
  const nums = text.match(/\d+(\.\d+)?/g);
  if (nums && nums.length > 0) {
    const parsed = nums.map(Number);
    if (shapeData.shape.includes('triangulo') && parsed.length >= 3) {
      shapeData.values = parsed.slice(0, 3);
      if (shapeData.rightAngle) {
        // Sort so hypotenuse is correct (largest value)
        const sorted = [...shapeData.values].sort((a, b) => a - b);
        shapeData.values = [sorted[0], sorted[2], sorted[1]]; // cateto a, hipotenusa, cateto b
      }
    } else if (shapeData.shape.includes('rect') && parsed.length >= 2) {
      shapeData.values = [parsed[0], parsed[1]];
    } else if (shapeData.shape.includes('cuadra') && parsed.length >= 1) {
      shapeData.values = [parsed[0], parsed[0]];
    } else if (parsed.length >= 1) {
      shapeData.values = [parsed[0]];
    }
  }
  return shapeData;
}

async function graphSend(text) {
  if (!text) text = document.getElementById('graph-input').value.trim();
  if (!text || graphStreaming) return;
  document.getElementById('graph-input').value = '';

  graphAppendMsg('user', text);

  // Detect shape requests client-side (don't rely on AI for JSON format)
  let shapeData = detectShapeRequest(text);
  if (shapeData) {
    shapeData = extractShapeValues(text, shapeData);
    drawShape(shapeData);

    // Now ask AI for educational explanation only
    graphStreaming = true;
    const bubbleEl = graphAppendMsg('ai', '<div class="ai-typing"><span></span><span></span><span></span></div>');
    try {
      const model = document.getElementById('model-select')?.value || 'mi-ia';
      const shapeDesc = shapeData.shape.includes('triangulo') && shapeData.rightAngle
        ? `un triángulo rectángulo con catetos de ${shapeData.values[0]} y ${shapeData.values[2]} e hipotenusa de ${shapeData.values[1]}`
        : shapeData.shape.includes('circulo')
        ? `un círculo con radio ${shapeData.values[0]}`
        : `${shapeData.title} con medidas ${shapeData.values.join(', ')}`;
      const shapeMessages = [
        { role: 'system', content: 'Eres un profesor de geometría amigable para niños. Responde en español de forma clara y educativa. No generes JSON ni etiquetas [CHART].' },
        { role: 'user', content: `Ya dibujé ${shapeDesc}. Explícame brevemente qué es esta figura, sus propiedades principales y algún dato curioso o fórmula útil. Sé breve (máximo 4-5 oraciones).` }
      ];
      let full = '';
      await streamChat(shapeMessages, model,
        (chunk) => { full += chunk; bubbleEl.innerHTML = renderMarkdown(full); },
        () => {},
        null
      );
      bubbleEl.innerHTML = renderMarkdown(full) || '✅ ¡Figura dibujada!';
    } catch (err) {
      bubbleEl.innerHTML = '✅ ¡Figura dibujada!';
    } finally {
      graphStreaming = false;
      scrollGraphChat();
    }
    return;
  }

  const diaryData = buildGraphDiaryData();
  const systemPrompt = `Eres un asistente que crea gráficos y dibuja figuras geométricas. Responde SIEMPRE en español.
Responde con UN bloque JSON entre [CHART] y [/CHART].

HAY DOS MODOS:

=== MODO 1: GRÁFICOS DE DATOS ===
Para gráficos de barras, circular o línea:
[CHART]{"type":"bar|pie|line","title":"Título","labels":["A","B","C"],"values":[10,20,30]}[/CHART]

=== MODO 2: FIGURAS GEOMÉTRICAS ===
Cuando el usuario pida dibujar una FIGURA (triángulo, rectángulo, cuadrado, círculo, pentágono, hexágono):
[CHART]{"type":"shape","shape":"nombre_figura","title":"Título","labels":["Lado a","Lado b","Lado c"],"values":[3,4,5],"rightAngle":true,"color":"#00ffc8"}[/CHART]

Figuras disponibles:
- "triangulo rectangulo" → rightAngle: true, labels para catetos e hipotenusa, values con sus medidas
- "triangulo equilatero" → rightAngle: false, 3 lados iguales
- "triangulo" → cualquier triángulo, rightAngle: false
- "rectangulo" → labels: ["Base","Altura"], values: [base, altura]
- "cuadrado" → labels: ["Lado"], values: [lado]
- "circulo" → labels: ["Radio"], values: [radio_numerico]
- "pentagono" → labels: ["Lado"], values: [lado]
- "hexagono" → labels: ["Lado"], values: [lado]

EJEMPLO triángulo rectángulo:
[CHART]{"type":"shape","shape":"triangulo rectangulo","title":"Triángulo Rectángulo","labels":["Cateto a","Hipotenusa","Cateto b"],"values":[3,5,4],"rightAngle":true}[/CHART]

EJEMPLO círculo:
[CHART]{"type":"shape","shape":"circulo","title":"Círculo","labels":["Radio"],"values":[5]}[/CHART]

IMPORTANTE: Si el usuario pide una FIGURA GEOMÉTRICA (triángulo, cuadrado, rectángulo, círculo, etc.), usa type:"shape". NO uses type:"bar" para figuras geométricas.
Si pide un gráfico de datos, usa type:"bar", "pie" o "line".

Datos del diario del estudiante:
${diaryData}

Reglas:
- SIEMPRE incluye el bloque [CHART]...[/CHART]
- Para figuras: pon medidas numéricas correctas y verifica que sean geométricamente válidas (ej: en triángulo rectángulo, hipotenusa² = cateto_a² + cateto_b² por Pitágoras)
- Para gráficos: usa datos del diario cuando corresponda
- Después del bloque, escribe una breve explicación educativa
- Los valores DEBEN ser números`;

  graphStreaming = true;
  const bubbleEl = graphAppendMsg('ai', '<div class="ai-typing"><span></span><span></span><span></span></div>');

  try {
    const model = document.getElementById('model-select')?.value || 'mi-ia';
    const graphMessages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text }
    ];
    let full = '';
    await streamChat(graphMessages, model,
      (chunk) => {
        full += chunk;
        const display = full.replace(/\[CHART\][\s\S]*?\[\/CHART\]\n?/g, '');
        bubbleEl.innerHTML = renderMarkdown(display) || '<em style="color:#3a5a50">Generando gráfico...</em>';
      },
      () => {},
      null
    );

    const chartMatch = full.match(/\[CHART\]\s*(\{[\s\S]*?\})\s*\[\/CHART\]/);
    if (chartMatch) {
      try {
        const chartData = JSON.parse(chartMatch[1]);
        if (chartData.type === 'shape') drawShape(chartData);
        else if (chartData.type === 'pie') drawPieChart(chartData);
        else if (chartData.type === 'line') drawLineChart(chartData);
        else drawBarChart(chartData);
      } catch (e) {
        bubbleEl.innerHTML += `<br><em style="color:#ff6b6b">Error al dibujar: ${e.message}</em>`;
      }
    }

    const cleanText = full.replace(/\[CHART\][\s\S]*?\[\/CHART\]\n?/g, '');
    bubbleEl.innerHTML = renderMarkdown(cleanText) || '✅ ¡Gráfico generado!';

  } catch (err) {
    bubbleEl.innerHTML = `<span style="color:#ff6b81">⚠️ Error: ${escapeHtml(err.message)}</span>`;
  } finally {
    graphStreaming = false;
    scrollGraphChat();
  }
}

function buildGraphDiaryData() {
  let data = '';
  state.subjects.forEach(sub => {
    const count = (state.entries[sub.id] || []).length;
    const days = new Set((state.entries[sub.id] || []).map(e => e.date)).size;
    data += `${sub.emoji} ${sub.name}: ${count} entradas, ${days} días activos\n`;
  });
  return data || '(Sin datos aún)';
}

function graphAppendMsg(role, content) {
  const container = document.getElementById('graph-messages');
  const div = document.createElement('div');
  div.className = role === 'user' ? 'graph-user-msg' : 'graph-ai-msg';
  const avatarClass = role === 'user' ? 'graph-user-avatar' : 'graph-ai-avatar';
  const bubbleClass = role === 'user' ? 'graph-user-bubble' : 'graph-ai-bubble';
  const icon = role === 'user' ? '👤' : '🤖';
  const bubbleId = 'gb_' + Date.now();
  div.innerHTML = `
    <span class="${avatarClass}">${icon}</span>
    <div class="${bubbleClass}" id="${bubbleId}">${role === 'user' ? escapeHtml(content) : content}</div>`;
  container.appendChild(div);
  scrollGraphChat();
  return document.getElementById(bubbleId);
}

function scrollGraphChat() {
  const chat = document.getElementById('graph-chat');
  requestAnimationFrame(() => { chat.scrollTop = chat.scrollHeight; });
}

window.addEventListener('resize', () => {
  if (!document.getElementById('graph-view').classList.contains('hidden')) {
    resizeGraphCanvas();
  }
});

// =============================================
//  EJERCICIOS — Sistema Interactivo 3D
// =============================================
let exState = {
  type: 'mixed',
  amount: 5,
  questions: [],
  answers: {},
  score: 0,
  total: 0,
  checked: {},
  history: [],
};

function exPopulateSubjects() {
  const sel = document.getElementById('ex-subject-select');
  if (!sel) return;
  sel.innerHTML = '<option value="all">🌟 Todas las materias</option>';
  state.subjects.forEach(s => {
    sel.innerHTML += `<option value="${s.id}">${s.emoji} ${s.name}</option>`;
  });
}

function exSelectType(btn) {
  document.querySelectorAll('.ex-type-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  exState.type = btn.dataset.type;
}

function exSelectAmount(btn) {
  document.querySelectorAll('.ex-amount-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  exState.amount = parseInt(btn.dataset.n);
}

async function exGenerate() {
  const btn = document.querySelector('.ex-generate-btn');
  btn.disabled = true;
  btn.textContent = '⏳ Generando...';

  document.getElementById('ex-placeholder').classList.add('hidden');
  document.getElementById('ex-questions').classList.add('hidden');
  document.getElementById('ex-results').classList.add('hidden');
  document.getElementById('ex-loading').classList.remove('hidden');

  exState.questions = [];
  exState.answers = {};
  exState.checked = {};
  exState.score = 0;

  const subjectId = document.getElementById('ex-subject-select').value;
  const diaryCtx = buildExerciseDiaryContext(subjectId);

  let typeInstr = '';
  if (exState.type === 'multiple') typeInstr = 'SOLO genera preguntas de opción múltiple (type: "multiple").';
  else if (exState.type === 'truefalse') typeInstr = 'SOLO genera preguntas de verdadero/falso (type: "truefalse").';
  else if (exState.type === 'fill') typeInstr = 'SOLO genera preguntas de completar (type: "fill").';
  else typeInstr = 'Mezcla los 3 tipos: "multiple", "truefalse" y "fill".';

  // Check if student has diary entries
  const hasEntries = diaryCtx.includes('- ');
  if (!hasEntries) {
    document.getElementById('ex-loading').classList.add('hidden');
    document.getElementById('ex-placeholder').classList.remove('hidden');
    btn.disabled = false;
    btn.textContent = '🚀 Generar Ejercicios';
    showToast('📝 Primero escribe en tu diario lo que aprendiste. ¡La IA hará ejercicios sobre eso!');
    return;
  }

  const prompt = `Genera exactamente ${exState.amount} ejercicios en español.
${typeInstr}

REGLA MÁS IMPORTANTE: Los ejercicios DEBEN estar basados ÚNICAMENTE en los aprendizajes del diario del estudiante que aparecen abajo. NO inventes temas que el estudiante no haya escrito. Cada pregunta debe relacionarse directamente con algo que el estudiante anotó en su diario.

REGLA DE PRECISIÓN: Todos los datos, fechas, nombres, conceptos y respuestas DEBEN ser 100% correctos y verificables. Si no estás seguro de un dato, no lo uses. Prefiere preguntas conceptuales simples sobre lo que el estudiante escribió.

Responde SOLO con un bloque JSON entre [EXERCISES] y [/EXERCISES]. Nada más.

Formato EXACTO:
[EXERCISES]
[
  {
    "type": "multiple",
    "question": "¿Pregunta basada en el diario?",
    "options": ["Opción correcta", "Opción incorrecta 1", "Opción incorrecta 2", "Opción incorrecta 3"],
    "answer": 0
  },
  {
    "type": "truefalse",
    "question": "Afirmación basada en lo que aprendió el estudiante",
    "answer": true
  },
  {
    "type": "fill",
    "question": "Según lo que aprendiste, _____ es...",
    "answer": "respuesta"
  }
]
[/EXERCISES]

Para "multiple": answer es el índice (0-3) de la opción correcta. Siempre 4 opciones.
Para "truefalse": answer es true o false.
Para "fill": answer es la palabra o frase que completa el espacio. Usa _____ en la pregunta.

APRENDIZAJES DEL ESTUDIANTE (basa TODOS los ejercicios en estos temas):
${diaryCtx}

Recuerda: SOLO preguntas sobre lo que el estudiante ya aprendió según su diario. Las respuestas deben ser correctas.`;

  try {
    const model = document.getElementById('model-select')?.value || 'mi-ia';
    const exMessages = [
      { role: 'system', content: 'Eres un generador de ejercicios educativos PRECISOS. Generas preguntas SOLO basadas en lo que el estudiante escribió en su diario. NUNCA inventes temas que no estén en el diario. Todas las respuestas deben ser correctas y verificables. Responde SOLO con el JSON solicitado.' },
      { role: 'user', content: prompt }
    ];
    let content = '';
    await streamChat(exMessages, model,
      (chunk) => { content += chunk; },
      () => {},
      null
    );
    if (!content) throw new Error('Sin respuesta de la IA');

    const match = content.match(/\[EXERCISES\]\s*([\s\S]*?)\s*\[\/EXERCISES\]/);
    let questions = [];

    if (match) {
      questions = JSON.parse(match[1]);
    } else {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) questions = JSON.parse(jsonMatch[0]);
    }

    if (!Array.isArray(questions) || questions.length === 0) throw new Error('No se generaron ejercicios');

    exState.questions = questions;
    exState.total = questions.length;
    renderExercises();

  } catch (err) {
    document.getElementById('ex-loading').classList.add('hidden');
    document.getElementById('ex-placeholder').classList.remove('hidden');
    showToast('⚠️ Error al generar: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '🚀 Generar Ejercicios';
  }
}

function buildExerciseDiaryContext(subjectId) {
  let ctx = '';
  const userName = state.currentUser ? state.currentUser.name : 'Estudiante';
  ctx += `Estudiante: ${userName}\n`;
  if (state.currentUser?.age) ctx += `Edad: ${state.currentUser.age} años\n`;

  const subjects = subjectId === 'all' ? state.subjects : state.subjects.filter(s => s.id === subjectId);
  subjects.forEach(sub => {
    const entries = (state.entries[sub.id] || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    if (entries.length > 0) {
      ctx += `\n${sub.emoji} ${sub.name}:\n`;
      entries.slice(0, 15).forEach(e => { ctx += `  - ${e.text}\n`; });
    }
  });

  if (!ctx.includes('-')) ctx += '\n(Sin entradas en el diario, genera ejercicios de conocimiento general escolar)\n';
  return ctx;
}

function renderExercises() {
  document.getElementById('ex-loading').classList.add('hidden');
  const container = document.getElementById('ex-questions');
  container.classList.remove('hidden');
  container.innerHTML = '';

  exState.questions.forEach((q, i) => {
    const card = document.createElement('div');
    card.className = 'ex-card-3d';
    card.id = `ex-q-${i}`;

    let typeLabel = '';
    let body = '';

    if (q.type === 'multiple') {
      typeLabel = 'Opción múltiple';
      const opts = (q.options || []).map((opt, oi) => {
        const letter = String.fromCharCode(65 + oi);
        return `<div class="ex-option" data-qi="${i}" data-oi="${oi}" onclick="exSelectOption(${i}, ${oi})">
          <span class="ex-option-letter">${letter}</span>
          <span class="ex-option-text">${escapeHtml(opt)}</span>
        </div>`;
      }).join('');
      body = `<div class="ex-options">${opts}</div>`;

    } else if (q.type === 'truefalse') {
      typeLabel = 'Verdadero / Falso';
      body = `<div class="ex-tf-row">
        <button class="ex-tf-btn" data-qi="${i}" data-val="true" onclick="exSelectTF(${i}, true)">✅ Verdadero</button>
        <button class="ex-tf-btn" data-qi="${i}" data-val="false" onclick="exSelectTF(${i}, false)">❌ Falso</button>
      </div>`;

    } else if (q.type === 'fill') {
      typeLabel = 'Completar';
      body = `<input type="text" class="ex-fill-input" id="ex-fill-${i}" placeholder="Escribe tu respuesta..." autocomplete="off">
        <div class="ex-fill-answer" id="ex-fillanswer-${i}">✅ Respuesta correcta: <strong>${escapeHtml(String(q.answer))}</strong></div>`;
    }

    card.innerHTML = `<div class="ex-card-inner">
      <span class="ex-card-num">${i + 1}</span>
      <span class="ex-card-type">${typeLabel}</span>
      <div class="ex-question">${escapeHtml(q.question)}</div>
      ${body}
      <div class="ex-feedback" id="ex-fb-${i}"></div>
      <button class="ex-check-btn" id="ex-check-${i}" onclick="exCheckAnswer(${i})">Verificar ✓</button>
    </div>`;

    container.appendChild(card);
  });

  updateScoreboard();
  document.getElementById('ex-scoreboard').classList.remove('hidden');
}

function exSelectOption(qi, oi) {
  if (exState.checked[qi]) return;
  exState.answers[qi] = oi;
  document.querySelectorAll(`.ex-option[data-qi="${qi}"]`).forEach(el => {
    el.classList.toggle('selected', parseInt(el.dataset.oi) === oi);
  });
}

function exSelectTF(qi, val) {
  if (exState.checked[qi]) return;
  exState.answers[qi] = val;
  document.querySelectorAll(`.ex-tf-btn[data-qi="${qi}"]`).forEach(el => {
    el.classList.toggle('selected', el.dataset.val === String(val));
  });
}

function exCheckAnswer(qi) {
  if (exState.checked[qi]) return;
  const q = exState.questions[qi];
  let isCorrect = false;

  if (q.type === 'multiple') {
    if (exState.answers[qi] === undefined) { showToast('⚠️ Selecciona una opción'); return; }
    isCorrect = exState.answers[qi] === q.answer;
    document.querySelectorAll(`.ex-option[data-qi="${qi}"]`).forEach(el => {
      const oi = parseInt(el.dataset.oi);
      el.classList.add('disabled');
      if (oi === q.answer) el.classList.add('correct');
      else if (oi === exState.answers[qi] && !isCorrect) el.classList.add('wrong');
    });

  } else if (q.type === 'truefalse') {
    if (exState.answers[qi] === undefined) { showToast('⚠️ Selecciona Verdadero o Falso'); return; }
    isCorrect = exState.answers[qi] === q.answer;
    document.querySelectorAll(`.ex-tf-btn[data-qi="${qi}"]`).forEach(el => {
      el.classList.add('disabled');
      const val = el.dataset.val === 'true';
      if (val === q.answer) el.classList.add('correct');
      else if (val === exState.answers[qi] && !isCorrect) el.classList.add('wrong');
    });

  } else if (q.type === 'fill') {
    const input = document.getElementById(`ex-fill-${qi}`);
    const userAnswer = input.value.trim();
    if (!userAnswer) { showToast('⚠️ Escribe tu respuesta'); return; }
    exState.answers[qi] = userAnswer;
    isCorrect = userAnswer.toLowerCase().replace(/[.,;:!?]/g, '') === String(q.answer).toLowerCase().replace(/[.,;:!?]/g, '');
    input.classList.add(isCorrect ? 'correct' : 'wrong');
    input.readOnly = true;
    if (!isCorrect) document.getElementById(`ex-fillanswer-${qi}`).classList.add('show');
  }

  exState.checked[qi] = true;
  if (isCorrect) exState.score++;

  const fb = document.getElementById(`ex-fb-${qi}`);
  fb.classList.add('show', isCorrect ? 'correct-fb' : 'wrong-fb');
  fb.textContent = isCorrect ? '🎉 ¡Correcto!' : '😕 Incorrecto';

  const btn = document.getElementById(`ex-check-${qi}`);
  btn.disabled = true;
  btn.textContent = isCorrect ? '✅ Correcto' : '❌ Incorrecto';

  updateScoreboard();

  if (Object.keys(exState.checked).length === exState.total) {
    setTimeout(showResults, 800);
  }
}

function updateScoreboard() {
  const total = exState.total;
  const checked = Object.keys(exState.checked).length;
  const score = exState.score;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  document.getElementById('ex-score-big').textContent = `${score}/${total}`;
  document.getElementById('ex-score-bar').style.width = `${total > 0 ? (score / total) * 100 : 0}%`;
  document.getElementById('ex-score-pct').textContent = `${pct}% · ${checked}/${total} respondidas`;
  document.getElementById('ex-score-text').textContent = `Puntos: ${score}`;
}

function showResults() {
  document.getElementById('ex-questions').classList.add('hidden');
  const results = document.getElementById('ex-results');
  results.classList.remove('hidden');

  const pct = Math.round((exState.score / exState.total) * 100);
  let icon = '🏆', title = '¡Excelente!', sub = '¡Dominas este tema!';
  if (pct < 40) { icon = '📚'; title = '¡Sigue practicando!'; sub = 'Repasa un poco más y lo lograrás.'; }
  else if (pct < 70) { icon = '💪'; title = '¡Buen trabajo!'; sub = 'Vas por buen camino, sigue así.'; }
  else if (pct < 90) { icon = '🌟'; title = '¡Muy bien!'; sub = '¡Casi perfecto!'; }

  results.innerHTML = `
    <div class="ex-results-icon">${icon}</div>
    <div class="ex-results-title">${title}</div>
    <div class="ex-results-sub">${sub}</div>
    <div class="ex-results-score">${exState.score}/${exState.total}</div>
    <div style="color:#7a6a50;margin-top:8px;font-size:1.1rem;">${pct}% de aciertos</div>
    <button class="ex-retry-btn" onclick="exRetry()">🔄 Intentar de nuevo</button>
    <button class="ex-retry-btn" onclick="exGenerate()" style="background:linear-gradient(135deg,#6b8aff,#a78bfa);margin-left:10px;">🆕 Nuevos ejercicios</button>
  `;

  exState.history.unshift({ date: getTodayStr(), score: exState.score, total: exState.total, pct });
  renderHistory();
}

function exRetry() {
  exState.answers = {};
  exState.checked = {};
  exState.score = 0;
  document.getElementById('ex-results').classList.add('hidden');
  renderExercises();
}

function renderHistory() {
  const list = document.getElementById('ex-history-list');
  if (!list) return;
  list.innerHTML = exState.history.slice(0, 10).map(h =>
    `<div class="ex-hist-item"><strong>${h.score}/${h.total}</strong> (${h.pct}%) — ${h.date}</div>`
  ).join('') || '<div class="ex-hist-item" style="color:#5a4a30">Sin historial aún</div>';
}
