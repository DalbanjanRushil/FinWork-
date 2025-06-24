const baseURL = "https://fb-finwork.onrender.com";

 // 🔁 Replace with your actual backend URL

const moneyRainCount = window.innerWidth < 600 ? 50 : 120;
function createMoneyRain() {
  const container = document.getElementById("money-rain");
  container.innerHTML = "";
  for (let i = 0; i < moneyRainCount; i++) {
    const money = document.createElement("div");
    money.className = "money";
    money.textContent = "₹";
    money.style.left = Math.random() * 100 + "vw";
    money.style.animationDelay = Math.random() * 5 + "s";
    container.appendChild(money);
  }
}
createMoneyRain();

const nameForm = document.getElementById("name-form");
const nameInput = document.getElementById("nameInput");
const welcomeSection = document.getElementById("welcome-section");
const container = document.querySelector(".container");
const dashboardGreeting = document.getElementById("dashboard-greeting");
const mainLogoRow = document.getElementById("main-logo-row");
const sections = {
  dashboard: document.getElementById("dashboard"),
  budget: document.getElementById("budget"),
  goals: document.getElementById("goals"),
  broadcast: document.getElementById("broadcast"),
  viewTransactions: document.getElementById("view-transactions"),
};

let userName = "";

function navigate(sectionName) {
  Object.values(sections).forEach((s) => s.classList.remove("active"));
  if (sections[sectionName]) {
    sections[sectionName].classList.add("active");
  }
  if (sectionName === "viewTransactions") {
    fetchTransactions();
  } else if (sectionName === "broadcast") {
    fetchBroadcasts();
  }
}

document.getElementById("btnGoBudget").onclick = () => navigate("budget");
document.getElementById("btnGoGoals").onclick = () => navigate("goals");
document.getElementById("btnGoBroadcast").onclick = () => navigate("broadcast");
document.getElementById("btnViewTransactions").onclick = () => navigate("viewTransactions");
document.getElementById("btnBackDashboard1").onclick =
  document.getElementById("btnBackDashboard2").onclick =
  document.getElementById("btnBackDashboard3").onclick =
  document.getElementById("btnBackDashboard4").onclick = () => navigate("dashboard");

nameForm.onsubmit = async (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  if (!name) return;

  userName = name;
  await fetch(`${baseURL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userName }),
  });

  welcomeSection.style.display = "none";
  container.style.display = "block";
  dashboardGreeting.textContent = `Welcome, ${userName}! 👋`;
  mainLogoRow.innerHTML = `<div class="project-title">FinWork</div><div class="user-name">${userName}</div>`;
  populateCategories();
  fetchGoals();
  document.getElementById("trans-date").valueAsDate = new Date();
};

const categories = [
  "Salary", "Business", "Investment", "Food", "Transportation",
  "Entertainment", "Bills", "Shopping", "Healthcare", "Education",
  "Travel", "Savings", "Other"
];

function populateCategories() {
  const select = document.getElementById("trans-category");
  select.innerHTML = '<option value="" disabled>Select category</option>';
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
}

document.getElementById("btnAddCategory").onclick = () => {
  const input = document.getElementById("new-category");
  const newCat = input.value.trim();
  if (newCat && !categories.includes(newCat)) {
    categories.push(newCat);
    populateCategories();
    input.value = "";
  }
};

// 💰 Add Transaction
document.getElementById("transaction-form").onsubmit = async (e) => {
  e.preventDefault();

  const date = document.getElementById("trans-date").value;
  const type = document.getElementById("trans-type").value;
  const category = document.getElementById("trans-category").value;
  const amount = parseFloat(document.getElementById("trans-amount").value);

  const transaction = { userName, date, type, category, amount };
  await fetch(`${baseURL}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transaction),
  });

  e.target.reset();
  document.getElementById("trans-date").valueAsDate = new Date();
};

// 🎯 Add Goal
document.getElementById("goals-form").onsubmit = async (e) => {
  e.preventDefault();
  const title = document.getElementById("goal-title").value;
  const date = document.getElementById("goal-date").value;

  const goal = { userName, title, date, completed: false };
  await fetch(`${baseURL}/goals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(goal),
  });

  fetchGoals();
  e.target.reset();
};

async function fetchGoals() {
  const res = await fetch(`${baseURL}/goals/${userName}`);
  const goals = await res.json();
  const list = document.getElementById("goals-list");

  if (goals.length === 0) {
    list.innerHTML = "<li style='color:#ccc'>No goals set yet.</li>";
  } else {
    list.innerHTML = goals
      .map((g) => `
        <li>
          <strong>${g.title}</strong><br/>
          <small>Target: ${new Date(g.date).toLocaleDateString()}</small>
          <button style="width:auto;padding:6px 12px;font-size:0.9rem;">
            ${g.completed ? "✅ Completed" : "⏳ In Progress"}
          </button>
        </li>`)
      .join("");
  }
}

// 📣 Broadcast
document.getElementById("broadcast-form").onsubmit = async (e) => {
  e.preventDefault();
  const msg = document.getElementById("broadcast-input").value.trim();
  if (!msg) return;

  await fetch(`${baseURL}/broadcasts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: msg, author: userName, timestamp: Date.now() }),
  });

  e.target.reset();
  fetchBroadcasts();
};

async function fetchBroadcasts() {
  const res = await fetch(`${baseURL}/broadcasts`);
  const data = await res.json();
  document.getElementById("broadcast-list").innerHTML = data.map(b =>
    `<li><strong>${b.author}:</strong> ${b.message} <small>${new Date(b.timestamp).toLocaleString()}</small></li>`
  ).join("");
}

// 📋 View Transactions
async function fetchTransactions() {
  const res = await fetch(`${baseURL}/transactions/${userName}`);
  const transactions = await res.json();
  const income = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expense;

  document.getElementById("total-income").textContent = `₹${income.toFixed(2)}`;
  document.getElementById("total-expense").textContent = `₹${expense.toFixed(2)}`;
  const balanceEl = document.getElementById("balance");
  balanceEl.textContent = `₹${balance.toFixed(2)}`;
  balanceEl.style.color = balance > 0 ? "#10b981" : balance < 0 ? "#ef4444" : "#fff";

  const tbody = document.querySelector("#transactions-table tbody");
  if (transactions.length === 0) {
    tbody.innerHTML = '<tr class="no-data"><td colspan="4">No transactions added yet.</td></tr>';
    return;
  }

  const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  tbody.innerHTML = sorted.map(t => `
    <tr>
      <td>${new Date(t.date).toLocaleDateString()}</td>
      <td style="color:${t.type === "income" ? "#10b981" : "#ef4444"}; font-weight:600;">
        ${t.type === "income" ? "💰 Income" : "💸 Expense"}
      </td>
      <td>${t.category}</td>
      <td style="font-weight:600;color:${t.type === "income" ? "#10b981" : "#ef4444"};">
        ${t.type === "income" ? "+" : "-"}₹${t.amount.toFixed(2)}
      </td>
    </tr>
  `).join("");

  renderCharts(transactions);
}

// 📊 Charts
let pieChart, barChart;

function renderCharts(transactions) {
  renderPieChart(transactions);
  renderBarChart(transactions);
}

function renderPieChart(transactions) {
  const ctx = document.getElementById("pieCategoryChart").getContext("2d");
  if (pieChart) pieChart.destroy();

  const expenses = transactions.filter(t => t.type === "expense");
  const totals = {};
  expenses.forEach(t => { totals[t.category] = (totals[t.category] || 0) + t.amount; });

  const labels = Object.keys(totals);
  const data = Object.values(totals);

  pieChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          "#ffd700", "#ffe066", "#ffb347", "#ffcc80",
          "#f9d423", "#f4e285", "#f7cac9", "#b5ead7"
        ],
        borderColor: "#fff",
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom", labels: { color: "#fff" } },
        title: { display: true, text: "Expenses by Category", color: "#fff" }
      }
    }
  });
}

function renderBarChart(transactions) {
  const ctx = document.getElementById("barMonthlyChart").getContext("2d");
  if (barChart) barChart.destroy();

  const monthlyData = {};
  transactions.forEach(t => {
    const month = new Date(t.date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
    if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
    monthlyData[month][t.type] += t.amount;
  });

  const labels = Object.keys(monthlyData).sort();
  const incomeData = labels.map(m => monthlyData[m].income);
  const expenseData = labels.map(m => monthlyData[m].expense);

  barChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Income", data: incomeData, backgroundColor: "#10b981" },
        { label: "Expense", data: expenseData, backgroundColor: "#ef4444" }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "#fff" } },
        title: { display: true, text: "Monthly Income vs Expenses", color: "#fff" }
      },
      scales: {
        y: { ticks: { color: "#fff" }, grid: { color: "rgba(255,255,255,0.1)" } },
        x: { ticks: { color: "#fff" }, grid: { color: "rgba(255,255,255,0.1)" } }
      }
    }
  });
}


function startVoice() {
  const input = document.getElementById("broadcast-input");

  if (!("webkitSpeechRecognition" in window)) {
    alert("Voice recognition is not supported in your browser.");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onstart = () => {
    console.log("🎙 Listening...");
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    input.value += (input.value ? ' ' : '') + transcript;
  };

  recognition.onerror = (event) => {
    alert("❌ Voice recognition error: " + event.error);
  };
}


recognition.onerror = (event) => {
  if (event.error === "aborted") {
    alert("🎙 Mic was interrupted. Please try again and allow microphone access.");
  } else {
    alert("❌ Voice recognition error: " + event.error);
  }
};
