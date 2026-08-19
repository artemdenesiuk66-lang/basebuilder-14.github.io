const SERVER = {
  host: "46.174.49.52",
  port: 27013,
  type: "counterstrike16",
  api: "https://gamedig-api.hexane.co/counterstrike16/ip=46.174.49.52&port=27013"
};

const $ = (id) => document.getElementById(id);
const toast = (msg) => {
  const el = $("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

async function loadServer() {
  const row = $("serverRows").querySelector("tr");
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);
    const response = await fetch(SERVER.api, { signal: controller.signal, cache: "no-store" });
    clearTimeout(timer);
    if (!response.ok) throw new Error("HTTP " + response.status);
    const data = await response.json();

    const online = data.online !== false;
    const name = data.name || data.raw?.name || "Сервер Counter-Strike 1.6";
    const players = Number(data.players?.length ?? data.raw?.numplayers ?? data.numplayers ?? 0);
    const maxPlayers = Number(data.maxplayers ?? data.raw?.maxplayers ?? 32);
    const map = data.map || data.raw?.map || "Неизвестно";
    const ping = data.ping != null ? Math.round(data.ping) : null;

    $("serverRows").innerHTML = `
      <tr data-connect="${SERVER.host}:${SERVER.port}">
        <td class="num">1</td>
        <td><span class="${online ? "online-dot" : "online-dot offline-dot"}"></span>${escapeHtml(name)}</td>
        <td>${players} / ${maxPlayers}</td>
        <td>${escapeHtml(map)}</td>
        <td>${SERVER.host}:${SERVER.port}</td>
      </tr>`;
    $("serverCount").textContent = `${players} / ${maxPlayers}`;
    $("miniName").textContent = name;
    $("miniStatus").textContent = online
      ? `Онлайн${ping !== null ? " • " + ping + " ms" : ""}`
      : "Оффлайн";
    $("statusDot").className = "status-dot " + (online ? "" : "offline");
    $("statPlayers").textContent = players;
    document.title = name;

    const tr = $("serverRows").querySelector("tr");
    tr.addEventListener("click", () => {
      navigator.clipboard?.writeText(`connect ${SERVER.host}:${SERVER.port}`);
      toast(`Скопировано: connect ${SERVER.host}:${SERVER.port}`);
    });
  } catch (e) {
    $("serverRows").innerHTML = `
      <tr>
        <td class="num">1</td>
        <td colspan="4">
          <span class="online-dot offline-dot"></span>
          Сервер не отвечает на запрос статуса
        </td>
      </tr>`;
    $("serverCount").textContent = "0 / 32";
    $("miniName").textContent = "Сервер недоступен";
    $("miniStatus").textContent = "Проверьте A2S-запрос";
    $("statusDot").className = "status-dot offline";
    $("statPlayers").textContent = "0";
  }
}

$("connectBtn").addEventListener("click", () => {
  navigator.clipboard?.writeText(`connect ${SERVER.host}:${SERVER.port}`);
  toast(`IP скопирован: ${SERVER.host}:${SERVER.port}`);
});

$("forgotBtn").addEventListener("click", () => {
  toast("В рабочем сайте сюда подключается восстановление пароля.");
});

$("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const login = $("login").value.trim();
  const users = JSON.parse(localStorage.getItem("epic_users") || "{}");
  if (!users[login]) {
    toast("Пользователь не найден. Сначала зарегистрируйтесь.");
    return;
  }
  if (users[login].password !== $("password").value) {
    toast("Неверный пароль.");
    return;
  }
  localStorage.setItem("epic_session", login);
  toast(`Добро пожаловать, ${login}!`);
});

$("registerForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const login = $("regLogin").value.trim();
  const pass = $("regPassword").value;
  const pass2 = $("regPassword2").value;
  const email = $("regEmail").value.trim();

  if (pass !== pass2) {
    toast("Пароли не совпадают.");
    return;
  }
  const users = JSON.parse(localStorage.getItem("epic_users") || "{}");
  if (users[login]) {
    toast("Такой логин уже зарегистрирован.");
    return;
  }
  users[login] = { password: pass, email };
  localStorage.setItem("epic_users", JSON.stringify(users));
  $("usersCount").textContent = Object.keys(users).length;
  $("registerForm").reset();
  toast("Регистрация сохранена в этом браузере.");
});

function updateLocalStats() {
  const users = JSON.parse(localStorage.getItem("epic_users") || "{}");
  $("usersCount").textContent = Object.keys(users).length;
}
updateLocalStats();
loadServer();
setInterval(loadServer, 30000);
