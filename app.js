/**
 * GLASSMOPHISM TODO MVP APP JS (KAKAO SSO & SUPABASE INTEGRATED)
 */

const STORAGE_KEY = 'glass_todo_mvp_items';
const SUPABASE_URL_KEY = 'glass_supabase_url';
const SUPABASE_KEY_KEY = 'glass_supabase_key';

// State Management
let todos = [];
let selectedPriority = 'medium';
let selectedEditPriority = 'medium';
let currentFilter = 'all';
let searchQuery = '';
let currentEditTodoId = null;

// Supabase & Kakao Auth References
let supabaseClient = null;
let isSupabaseActive = false;
let currentKakaoUser = null;

// Seed Initial Data
const SEED_TODOS = [
  {
    id: 'todo-seed-1',
    userId: null,
    title: '카카오 SSO 로그인 연결 테스트하기 🚀',
    priority: 'high',
    dueDate: new Date().toISOString().split('T')[0],
    completed: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 'todo-seed-2',
    userId: null,
    title: 'Supabase 데이터베이스 연동 확인',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    completed: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  },
  {
    id: 'todo-seed-3',
    userId: null,
    title: 'Todo MVP UI 디자인 스타일링 적용',
    priority: 'medium',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    completed: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  }
];

// Helper: Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconClass = 'fa-circle-info';
  if (type === 'success') iconClass = 'fa-circle-check';
  if (type === 'error') iconClass = 'fa-circle-exclamation';

  toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${escapeHTML(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease-in forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Helper: Escape HTML
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, match => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return map[match];
  });
}

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  initSupabaseClient();
  await loadData();
  bindEvents();
  initKakaoAuthListener();
  renderApp();
});

// Initialize Supabase Client
function initSupabaseClient() {
  const cfgUrl = window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url ? window.SUPABASE_CONFIG.url.trim() : '';
  const cfgKey = window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.anonKey ? window.SUPABASE_CONFIG.anonKey.trim() : '';

  const url = cfgUrl || localStorage.getItem(SUPABASE_URL_KEY);
  const key = cfgKey || localStorage.getItem(SUPABASE_KEY_KEY);
  const dbModeText = document.getElementById('dbModeText');

  if (url && key && window.supabase) {
    try {
      supabaseClient = window.supabase.createClient(url, key);
      isSupabaseActive = true;
      dbModeText.textContent = 'Supabase 클라우드';
      return;
    } catch (e) {
      console.error('Supabase Init Error:', e);
    }
  }

  isSupabaseActive = false;
  supabaseClient = null;
  dbModeText.textContent = 'LocalStorage';
}

// Initialize Kakao Auth Listener
function initKakaoAuthListener() {
  if (!isSupabaseActive || !supabaseClient) return;

  supabaseClient.auth.getSession().then(({ data: { session } }) => {
    if (session && session.user) {
      currentKakaoUser = session.user;
      updateAuthUI();
      loadData().then(() => renderApp());
    }
  });

  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (session && session.user) {
      currentKakaoUser = session.user;
      updateAuthUI();
      loadData().then(() => renderApp());
    } else {
      currentKakaoUser = null;
      updateAuthUI();
      loadData().then(() => renderApp());
    }
  });
}

// Kakao Login
async function signInWithKakao() {
  if (!isSupabaseActive || !supabaseClient) {
    showToast('Supabase 설정이 필요합니다.', 'error');
    return;
  }

  const { data, error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      scopes: 'profile_nickname profile_image',
      queryParams: {
        scope: 'profile_nickname profile_image'
      },
      redirectTo: window.location.origin
    }
  });

  if (error) {
    showToast(`카카오 로그인 오류: ${error.message}`, 'error');
  }
}

// Kakao Logout
async function signOutKakao() {
  if (supabaseClient) {
    await supabaseClient.auth.signOut();
  }
  currentKakaoUser = null;
  updateAuthUI();
  showToast('로그아웃 되었습니다.', 'info');
  await loadData();
  renderApp();
}

// Update Auth UI
function updateAuthUI() {
  const loginContainer = document.getElementById('kakaoLoginContainer');
  const profileContainer = document.getElementById('kakaoProfileContainer');
  const userAvatar = document.getElementById('kakaoUserAvatar');
  const userName = document.getElementById('kakaoUserName');
  const authBannerText = document.getElementById('authBannerText');

  if (currentKakaoUser) {
    const metadata = currentKakaoUser.user_metadata || {};
    const nickname = metadata.full_name || metadata.name || currentKakaoUser.email || '카카오 회원';
    const avatarUrl = metadata.avatar_url || metadata.picture || 'https://k.kakaocdn.net/dn/dpk9f1/btqmGhA5lTK/7g5A622A5k6k19A56K2l4K/img_640x640.jpg';

    loginContainer.classList.add('hidden');
    profileContainer.classList.remove('hidden');

    userAvatar.src = avatarUrl;
    userName.textContent = nickname;

    authBannerText.innerHTML = `<i class="fa-solid fa-check-circle" style="color: #FEE500;"></i> <strong>${escapeHTML(nickname)}</strong>님으로 로그인됨 (클라우드 실시간 동기화)`;
  } else {
    loginContainer.classList.remove('hidden');
    profileContainer.classList.add('hidden');

    authBannerText.innerHTML = `<i class="fa-solid fa-info-circle"></i> 카카오로 로그인하면 기기 간 할 일 목록이 실시간 동기화됩니다.`;
  }
}

// Load Data
async function loadData() {
  if (isSupabaseActive && supabaseClient) {
    try {
      let query = supabaseClient.from('todos').select('*').order('created_at', { ascending: false });
      
      if (currentKakaoUser) {
        query = query.eq('user_id', currentKakaoUser.id);
      }

      const { data, error } = await query;

      if (!error && data) {
        todos = data.map(item => ({
          id: item.id,
          userId: item.user_id,
          title: item.title,
          priority: item.priority || 'medium',
          dueDate: item.due_date || '',
          completed: Boolean(item.completed),
          createdAt: item.created_at
        }));
        return;
      }
    } catch (e) {
      console.warn('Supabase todos fetch error, falling back to LocalStorage:', e);
    }
  }

  // Fallback LocalStorage
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      todos = JSON.parse(stored);
    } catch (e) {
      todos = SEED_TODOS;
    }
  } else {
    todos = SEED_TODOS;
    saveLocalData();
  }
}

// Save Local Data
function saveLocalData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// Bind DOM Events
function bindEvents() {
  // Kakao Login / Logout
  document.getElementById('kakaoLoginBtn').addEventListener('click', signInWithKakao);
  document.getElementById('kakaoLogoutBtn').addEventListener('click', signOutKakao);

  // Priority Selector Buttons
  const priorityBtns = document.querySelectorAll('.priority-selector .priority-btn');
  priorityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      priorityBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedPriority = btn.dataset.priority;
    });
  });

  // Edit Priority Selector Buttons
  const editPriorityBtns = document.querySelectorAll('#editPrioritySelector .priority-btn');
  editPriorityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      editPriorityBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedEditPriority = btn.dataset.priority;
    });
  });

  // Todo Form Submit
  document.getElementById('todoForm').addEventListener('submit', handleAddTodo);

  // Filter Tabs
  const tabBtns = document.querySelectorAll('.filter-tabs .tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTodoList();
    });
  });

  // Search Input
  document.getElementById('searchInput').addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    renderTodoList();
  });

  // Clear Completed
  document.getElementById('clearCompletedBtn').addEventListener('click', handleClearCompleted);

  // Edit Modal Controls
  document.getElementById('closeEditModalBtn').addEventListener('click', closeEditModal);
  document.getElementById('cancelEditModalBtn').addEventListener('click', closeEditModal);
  document.getElementById('editTodoForm').addEventListener('submit', handleSaveEditTodo);
}

// Add Todo
async function handleAddTodo(e) {
  e.preventDefault();

  const titleInput = document.getElementById('todoTitleInput');
  const dueDateInput = document.getElementById('todoDueDateInput');

  const title = titleInput.value.trim();
  const dueDate = dueDateInput.value;

  if (!title) {
    showToast('할 일 제목을 입력해주세요.', 'error');
    return;
  }

  const todoId = `todo-${Date.now()}`;
  const nowIso = new Date().toISOString();
  const userId = currentKakaoUser ? currentKakaoUser.id : null;

  const newTodo = {
    id: todoId,
    userId: userId,
    title: title,
    priority: selectedPriority,
    dueDate: dueDate || '',
    completed: false,
    createdAt: nowIso
  };

  if (isSupabaseActive && supabaseClient) {
    const payload = {
      id: todoId,
      title: title,
      priority: selectedPriority,
      due_date: dueDate || null,
      completed: false,
      created_at: nowIso
    };
    if (userId) payload.user_id = userId;

    const { error } = await supabaseClient.from('todos').insert([payload]);
    if (error) {
      console.error('Supabase Insert Error:', error);
      showToast('Supabase 저장 실패', 'error');
      return;
    }
  }

  todos.unshift(newTodo);
  saveLocalData();

  // Reset Form
  titleInput.value = '';
  dueDateInput.value = '';
  
  renderApp();
  showToast('새 할 일이 추가되었습니다! ✨', 'success');
}

// Toggle Complete Status
async function toggleTodoComplete(todoId) {
  const item = todos.find(t => t.id === todoId);
  if (!item) return;

  item.completed = !item.completed;

  if (isSupabaseActive && supabaseClient) {
    await supabaseClient
      .from('todos')
      .update({ completed: item.completed })
      .eq('id', todoId);
  }

  saveLocalData();
  renderApp();

  if (item.completed) {
    showToast('할 일을 완료했습니다! 🎉', 'success');
  }
}

// Open Edit Modal
function openEditModal(todoId) {
  const item = todos.find(t => t.id === todoId);
  if (!item) return;

  currentEditTodoId = todoId;
  selectedEditPriority = item.priority || 'medium';

  const modal = document.getElementById('editTodoModal');
  const titleInput = document.getElementById('editTitleInput');
  const dueDateInput = document.getElementById('editDueDateInput');

  titleInput.value = item.title;
  dueDateInput.value = item.dueDate || '';

  const editPriorityBtns = document.querySelectorAll('#editPrioritySelector .priority-btn');
  editPriorityBtns.forEach(b => {
    b.classList.remove('selected');
    if (b.dataset.priority === selectedEditPriority) b.classList.add('selected');
  });

  modal.classList.remove('hidden');
  titleInput.focus();
}

function closeEditModal() {
  document.getElementById('editTodoModal').classList.add('hidden');
  currentEditTodoId = null;
}

// Save Edited Todo
async function handleSaveEditTodo(e) {
  e.preventDefault();
  if (!currentEditTodoId) return;

  const item = todos.find(t => t.id === currentEditTodoId);
  if (!item) return;

  const title = document.getElementById('editTitleInput').value.trim();
  const dueDate = document.getElementById('editDueDateInput').value;

  if (!title) {
    showToast('제목을 입력해 주세요.', 'error');
    return;
  }

  item.title = title;
  item.priority = selectedEditPriority;
  item.dueDate = dueDate || '';

  if (isSupabaseActive && supabaseClient) {
    await supabaseClient
      .from('todos')
      .update({
        title: title,
        priority: selectedEditPriority,
        due_date: dueDate || null
      })
      .eq('id', currentEditTodoId);
  }

  saveLocalData();
  closeEditModal();
  renderApp();
  showToast('할 일이 수정되었습니다.', 'success');
}

// Delete Single Todo
async function deleteTodo(todoId) {
  const item = todos.find(t => t.id === todoId);
  if (!item) return;

  if (isSupabaseActive && supabaseClient) {
    await supabaseClient.from('todos').delete().eq('id', todoId);
  }

  todos = todos.filter(t => t.id !== todoId);
  saveLocalData();
  renderApp();
  showToast('할 일이 삭제되었습니다.', 'info');
}

// Clear Completed Todos
async function handleClearCompleted() {
  const completedCount = todos.filter(t => t.completed).length;
  if (completedCount === 0) {
    showToast('완료된 항목이 없습니다.', 'info');
    return;
  }

  if (isSupabaseActive && supabaseClient) {
    await supabaseClient.from('todos').delete().eq('completed', true);
  }

  todos = todos.filter(t => !t.completed);
  saveLocalData();
  renderApp();
  showToast(`${completedCount}개의 완료된 항목이 정리되었습니다.`, 'success');
}

// Render Full App
function renderApp() {
  renderStats();
  renderTodoList();
}

// Render Stats & Progress Bar
function renderStats() {
  const totalCount = todos.length;
  const completedCount = todos.filter(t => t.completed).length;
  const activeCount = totalCount - completedCount;

  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  document.getElementById('completedStatsText').textContent = `${completedCount} / ${totalCount} 완료`;
  document.getElementById('progressPercentText').textContent = `${percent}%`;
  document.getElementById('progressBarFill').style.width = `${percent}%`;

  document.getElementById('countAll').textContent = totalCount;
  document.getElementById('countActive').textContent = activeCount;
  document.getElementById('countCompleted').textContent = completedCount;
}

// Render Todo List
function renderTodoList() {
  const listContainer = document.getElementById('todoList');
  const emptyState = document.getElementById('emptyState');
  listContainer.innerHTML = '';

  let filtered = todos.filter(t => {
    // Tab Filter
    if (currentFilter === 'active' && t.completed) return false;
    if (currentFilter === 'completed' && !t.completed) return false;

    // Search Filter
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery)) return false;

    return true;
  });

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  filtered.forEach(item => {
    const el = createTodoElement(item);
    listContainer.appendChild(el);
  });
}

// Create Todo Card Element
function createTodoElement(item) {
  const div = document.createElement('div');
  div.className = `todo-item ${item.completed ? 'completed' : ''}`;
  div.dataset.id = item.id;

  let priorityLabel = '보통';
  if (item.priority === 'high') priorityLabel = '높음';
  if (item.priority === 'low') priorityLabel = '낮음';

  const dueDateText = item.dueDate ? `<span class="todo-date"><i class="fa-regular fa-calendar"></i> ${item.dueDate}</span>` : '';

  div.innerHTML = `
    <div class="todo-left">
      <div class="custom-checkbox" onclick="toggleTodoComplete('${item.id}')">
        <i class="fa-solid fa-check"></i>
      </div>
      <div class="todo-content-box">
        <span class="todo-title">${escapeHTML(item.title)}</span>
        <div class="todo-meta">
          <span class="badge-priority ${item.priority || 'medium'}">${priorityLabel}</span>
          ${dueDateText}
        </div>
      </div>
    </div>

    <div class="todo-right">
      <button class="btn-icon-action" onclick="openEditModal('${item.id}')" title="수정">
        <i class="fa-solid fa-pen-to-square"></i>
      </button>
      <button class="btn-icon-action delete" onclick="deleteTodo('${item.id}')" title="삭제">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>
  `;

  return div;
}
