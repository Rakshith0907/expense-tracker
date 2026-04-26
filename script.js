let expenses = []; 
let budget = 0; 

let expenseList = document.getElementById("expenseList");
const sortSelect = document.getElementById("sortSelect");
const filterSelect = document.getElementById("filterSelect");
const expenseForm = document.getElementById("expenseForm");
const titleInput = document.getElementById("titleInput");
const amountInput = document.getElementById("amountInput");
const categoryInput = document.getElementById("categoryInput");
const notesInput = document.getElementById("notesInput");
const budgetInput = document.getElementById("budgetInput");
const setBudgetBtn = document.getElementById("setBudgetBtn");
 
const themeToggleBtn = document.getElementById("theme-toggle");

let editingId = null;
let monthlyBudget = 0;

let savedTheme = localStorage.getItem("theme");


if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggleBtn.textContent = "🌞"; 
} else {
    themeToggleBtn.textContent = "🌙"; 
}

themeToggleBtn.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-mode");
    themeToggleBtn.classList.add("rotate");
    setTimeout(() => themeToggleBtn.classList.remove("rotate"), 300);
    themeToggleBtn.textContent = isDark ? "🌞" : "🌙";
    localStorage.setItem("theme", isDark ? "dark" : "light");
});


window.addEventListener("scroll", () => {
    const header = document.querySelector(".glass-header");

    if (window.scrollY > 10) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
});

function updateBudgetUI() {
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remaining = monthlyBudget - totalSpent;

    document.getElementById("spentAmount").textContent = totalSpent;
    document.getElementById("remainingAmount").textContent = remaining;

    const progress = (totalSpent / monthlyBudget) * 100;
    document.getElementById("budgetProgress").style.width = progress + "%";
}


function createExpenseItem(expense) {
    const li = document.createElement("li");
    li.className = "list-group-item expense-item d-flex justify-content-between align-items-start";
    li.setAttribute("data-id", expense.id);

    li.innerHTML = `
      <div>
        <div>
        <strong class="exp-title">${escapeHtml(expense.title)}</strong>
        <span class="category-badge category-${escapeHtml(expense.category).toLowerCase()}">
            ${escapeHtml(expense.category)}
        </span>
        </div>
            <span class="date-badge date-${escapeHtml(expense.date).toLowerCase()}">${escapeHtml(expense.date)}</span>
        ${expense.notes ? `<div class="notes-badge small mt-1">${escapeHtml(expense.notes)}</div>` : ''}
      </div>

      <div class="text-end">
        <div class="expense-amount">₹${Number(expense.amount).toFixed(2)}</div>
        <button class="btn btn-sm btn-outline-danger mt-2 delete-btn" aria-label="Delete expense"><i class="fa-solid fa-trash-can"></i></button>
      </div>
    `;
    return li;
}

function escapeHtml(str) {
    if (!str && str !== 0) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}   

function renderExpenses() {
    expenseList.innerHTML = "";

    const filtered = getFilteredExpenses();

    filtered.forEach(exp => {
        const item = createExpenseItem(exp);
        expenseList.appendChild(item);
    });
    updateBudgetUI();
}

expenseForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!titleInput.value || !amountInput.value) {
        alert("Please enter a title and amount.");
        return;
    }

    if (editingId) {
        const exp = expenses.find(x => x.id === editingId);

        exp.title = titleInput.value;
        exp.amount = Number(amountInput.value);
        exp.category = categoryInput.value;
        exp.notes = notesInput.value || "";
        exp.date = new Date().toISOString().split("T")[0];

        editingId = null;
        submitBtn.textContent = "Add Expense";

        saveExpenses();
        renderExpenses();
        expenseForm.reset();
        return;
    }

    const expense = {
        id: Date.now(),
        title: titleInput.value,
        amount: Number(amountInput.value),
        category: categoryInput.value,
        notes: notesInput.value || "",
        date: new Date().toISOString().split("T")[0]
    };

    expenses.push(expense);

    saveExpenses();
    renderExpenses();
    expenseForm.reset();
});

function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

function loadExpenses() {
    const saved = localStorage.getItem("expenses");
    if (saved) {
        expenses = JSON.parse(saved);
        renderExpenses();
    }
}

loadExpenses();

function sortExpenses() {
    const sortValue = sortSelect.value;
    if (sortValue === "date-desc") {

        expenses.sort((a, b) => b.id - a.id);
    } else if (sortValue === "date-asc") {

        expenses.sort((a, b) => a.id - b.id);
    } else if (sortValue === "amount-desc") {
        expenses.sort((a, b) => b.amount - a.amount);
    } else if (sortValue === "amount-asc") {
        expenses.sort((a, b) => a.amount - b.amount);
    } else if (sortValue === "category") {
        expenses.sort((a, b) => a.category.localeCompare(b.category));
    }
    renderExpenses();
}

function getFilteredExpenses() {
    const filterValue = filterSelect.value;
    if (filterValue === "all") {
        return expenses;
    }
    return expenses.filter(exp => 
        exp.category.toLowerCase() === filterValue.toLowerCase()
    );
}

sortSelect.addEventListener("change", () => {
    sortExpenses();
    saveExpenses();
});

filterSelect.addEventListener("change", () => {
    renderExpenses();
});

document.addEventListener("DOMContentLoaded", () => {
  if (!expenseList) expenseList = document.getElementById("expenseList");
  if (!expenseList) {
    console.error("Expense list element not found (id='expenseList'). Please check your HTML.");
    return;
  }
  function renderExpenses() {
    expenseList.innerHTML = "";
    const visible = (typeof getFilteredExpenses === "function") ? getFilteredExpenses() : expenses;
    visible.forEach(exp => {
      const li = createExpenseItem(exp);
      expenseList.appendChild(li);
    });
  }
  expenseList.addEventListener("click", function (e) {
    const btn = e.target.closest(".delete-btn");
    if (!btn) return;

    const li = btn.closest("[data-id]");
    if (!li) {
      console.warn("Delete clicked but no parent with data-id found.");
      return;
    }

    const idStr = li.getAttribute("data-id");
    const id = Number(idStr);
    if (Number.isNaN(id)) {
      console.warn("Invalid id for delete:", idStr);
      return;
    }
    li.classList.add("remove");
    setTimeout(() => {
      expenses = expenses.filter(e => Number(e.id) !== id);
      localStorage.setItem("expenses", JSON.stringify(expenses));
      renderExpenses();
      if (typeof updateTotals === "function") updateTotals();
    }, 300);
  });

  if (typeof loadExpenses === "function") loadExpenses();
  else renderExpenses();
});

const savedBudget = localStorage.getItem("monthlyBudget");
if (savedBudget) {
    monthlyBudget = Number(savedBudget);
    budgetInput.value = monthlyBudget;
    updateBudgetUI();
}

setBudgetBtn.addEventListener("click", () => {
    const value = Number(budgetInput.value);
    if (value <= 0 || isNaN(value)) {
        alert("Please enter a valid budget.");
        return;
    }

    monthlyBudget = value;
    saveBudget();
    updateBudgetUI();
});

function saveBudget() {
    localStorage.setItem("monthlyBudget", monthlyBudget);
}


document.getElementById("downloadCSV").addEventListener("click", () => {
    if (expenses.length === 0) {
        alert("No expenses to export!");
        return;
    }

    let csv = "Title,Amount,Category,Notes,Date\n";

    expenses.forEach(exp => {
        csv += `${exp.title},${exp.amount},${exp.category},${exp.notes || ""},${exp.date}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "expenses.csv";
    a.click();

    URL.revokeObjectURL(url);
});