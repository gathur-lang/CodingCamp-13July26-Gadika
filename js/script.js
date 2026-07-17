const timeDisplay = document.getElementById('timeDisplay');
const greetingEl = document.getElementById('greeting');
const themeToggle = document.getElementById('themeToggle');
const timerDisplay = document.getElementById('timerDisplay');
const timerStatus = document.getElementById('timerStatus');
const startTimer = document.getElementById('startTimer');
const stopTimer = document.getElementById('stopTimer');
const resetTimer = document.getElementById('resetTimer');
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const sortTasksButton = document.getElementById('sortTasks');
const linkForm = document.getElementById('linkForm');
const linkTitle = document.getElementById('linkTitle');
const linkUrl = document.getElementById('linkUrl');
const linkButtons = document.getElementById('linkButtons');

const STORAGE_TASKS = 'dashboard-tasks';
const STORAGE_LINKS = 'dashboard-links';
const STORAGE_THEME = 'dashboard-theme';
const STORAGE_SORT_ASC = 'dashboard-sort-asc';

let tasks = [];
let links = [];
let timerInterval = null;
let timerSeconds = 25 * 60;
let timerRunning = false;
let sortAscending = true;

function setTheme(theme) {
  document.body.classList.toggle('dark', theme === 'dark');
  themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
  localStorage.setItem(STORAGE_THEME, theme);
}

function formatTime(value) {
  return String(value).padStart(2, '0');
}

function updateTimeDisplay() {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    timeDisplay.textContent = `${timeString} • ${dateString}`;
  if (now.getHours() < 12) {
    timeDisplay.textContent = '🌤️' + `${timeString} • ${dateString}`;
  } else if (now.getHours() < 17) {
    timeDisplay.textContent = '☀️' + `${timeString} • ${dateString}`;
  } else if (now.getHours() < 20) {
    timeDisplay.textContent = '🌥️' + `${timeString} • ${dateString}`;
  } else {
    timeDisplay.textContent = '🌙' + `${timeString} • ${dateString}`;
  }

  const hour = now.getHours();
   if (hour < 12) {
     greetingEl.textContent = "It's Morning! Wakey Wakey!";
   } else if (hour < 15) {
     greetingEl.textContent = "It's Noon! Don't Let the Sun Burn You Down!";
   } else if (hour < 17) {
    greetingEl.textContent = "It's Afternoon! Time to Relax!";
    } else if (hour < 20) {
     greetingEl.textContent = "It's Evening! Time to Grab Your Yummy Dinner!";
   } else {
     greetingEl.textContent = "It's Nighty Nighty! Time to rest!";
   }
}

function updateTimerUI() {
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  timerDisplay.textContent = `${formatTime(minutes)}:${formatTime(seconds)}`;
  timerStatus.textContent = timerRunning ? '▶' : timerSeconds === 25 * 60 ? '🏁' : '⏸';
}

function startCountdown() {
  if (timerRunning) return;
  timerRunning = true;
  timerStatus.textContent = '▶';
  timerInterval = setInterval(() => {
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      timerStatus.textContent = 'Done';
      timerSeconds = 0;
      updateTimerUI();
      return;
    }
    timerSeconds -= 1;
    updateTimerUI();
  }, 1000);
}

function stopCountdown() {
  timerRunning = false;
  clearInterval(timerInterval);
  timerStatus.textContent = timerSeconds === 25 * 60 ? '🏁' : '⏸';
  updateTimerUI();
}

function resetCountdown() {
  timerRunning = false;
  clearInterval(timerInterval);
  timerSeconds = 25 * 60;
  timerStatus.textContent = '🏁';
  updateTimerUI();
}

function loadTasks() {
  const stored = localStorage.getItem(STORAGE_TASKS);
  if (stored) {
    try {
      tasks = JSON.parse(stored);
    } catch {
      tasks = [];
    }
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_TASKS, JSON.stringify(tasks));
}

function loadLinks() {
  const stored = localStorage.getItem(STORAGE_LINKS);
  if (stored) {
    try {
      links = JSON.parse(stored);
    } catch {
      links = [];
    }
  }
  if (links.length === 0) {
    links = [
      { title: 'Search', url: 'https://www.google.com' },
      { title: 'Notes', url: 'https://www.example.com' },
    ];
  }
}

function saveLinks() {
  localStorage.setItem(STORAGE_LINKS, JSON.stringify(links));
}

function loadTheme() {
  const stored = localStorage.getItem(STORAGE_THEME);
  setTheme(stored === 'dark' ? 'dark' : 'light');
}

function loadSort() {
  const stored = localStorage.getItem(STORAGE_SORT_ASC);
  sortAscending = stored === null ? true : stored === 'true';
}

function saveSort() {
  localStorage.setItem(STORAGE_SORT_ASC, String(sortAscending));
}

function renderTasks() {
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return sortAscending ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
  });
  taskList.innerHTML = sortedTasks
    .map(task => {
      const checkedClass = task.done ? 'done' : '';
      return `
        <li class="task-item ${checkedClass}" data-id="${task.id}">
          <button class="button button-secondary" data-action="toggle">${task.done ? '✓' : '○'}</button>
          <div class="task-title">${task.title}</div>
          <div class="task-actions">
            <button data-action="edit">Edit</button>
            <button data-action="delete">Delete</button>
          </div>
        </li>
      `;
    })
    .join('');
}

function renderLinks() {
  linkButtons.innerHTML = links
    .map(link => `<a class="link-button" href="${link.url}" target="_blank" rel="noopener noreferrer">${link.title}</a>`)
    .join('');
}

function addTask(title) {
  const normalized = title.trim();
  if (!normalized) return;
  const duplicate = tasks.some(task => task.title.toLowerCase() === normalized.toLowerCase());
  if (duplicate) {
    alert('This task already exists.');
    return;
  }
  tasks.push({ id: Date.now().toString(), title: normalized, done: false });
  saveTasks();
  renderTasks();
}

function toggleTask(taskId) {
  tasks = tasks.map(task => (task.id === taskId ? { ...task, done: !task.done } : task));
  saveTasks();
  renderTasks();
}

function editTask(taskId) {
  const task = tasks.find(item => item.id === taskId);
  if (!task) return;
  const updated = prompt('Update task title', task.title)?.trim();
  if (!updated) return;
  const duplicate = tasks.some(item => item.id !== task.id && item.title.toLowerCase() === updated.toLowerCase());
  if (duplicate) {
    alert('A task with that title already exists.');
    return;
  }
  task.title = updated;
  saveTasks();
  renderTasks();
}

function deleteTask(taskId) {
  tasks = tasks.filter(task => task.id !== taskId);
  saveTasks();
  renderTasks();
}

function addLink(title, url) {
  const normalizedTitle = title.trim();
  const normalizedUrl = url.trim();
  if (!normalizedTitle || !normalizedUrl) return;
  const validUrl = normalizedUrl.startsWith('http://') || normalizedUrl.startsWith('https://') ? normalizedUrl : `https://${normalizedUrl}`;
  const duplicate = links.some(link => link.url.toLowerCase() === validUrl.toLowerCase() || link.title.toLowerCase() === normalizedTitle.toLowerCase());
  if (duplicate) {
    alert('This link title or URL already exists.');
    return;
  }
  links.push({ title: normalizedTitle, url: validUrl });
  saveLinks();
  renderLinks();
}

updateTimeDisplay();
setInterval(updateTimeDisplay, 1000);
loadTheme();
loadSort();
loadTasks();
loadLinks();
renderTasks();
renderLinks();
updateTimerUI();

themeToggle.addEventListener('click', () => {
  const nextTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
  setTheme(nextTheme);
});

startTimer.addEventListener('click', startCountdown);
stopTimer.addEventListener('click', stopCountdown);
resetTimer.addEventListener('click', resetCountdown);

taskForm.addEventListener('submit', event => {
  event.preventDefault();
  addTask(taskInput.value);
  taskInput.value = '';
  taskInput.focus();
});

sortTasksButton.addEventListener('click', () => {
  sortAscending = !sortAscending;
  sortTasksButton.textContent = sortAscending ? 'Sort tasks' : 'Reverse sort';
  saveSort();
  renderTasks();
});

taskList.addEventListener('click', event => {
  const action = event.target.dataset.action;
  const item = event.target.closest('.task-item');
  if (!item || !action) return;
  const taskId = item.dataset.id;
  if (action === 'toggle') {
    toggleTask(taskId);
  } else if (action === 'edit') {
    editTask(taskId);
  } else if (action === 'delete') {
    deleteTask(taskId);
  }
});

linkForm.addEventListener('submit', event => {
  event.preventDefault();
  addLink(linkTitle.value, linkUrl.value);
  linkTitle.value = '';
  linkUrl.value = '';
  linkTitle.focus();
});