const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => [...document.querySelectorAll(selector)];

function showNotice(element, message, type = "success") {
  if (!element) return;
  element.className = `notice ${type}`;
  element.textContent = message;
}

async function fetchJSON(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Something went wrong.");
  }
  return data;
}

async function loadSchedules() {
  const tableBody = qs("#schedule-body");
  if (!tableBody) return;

  const suburb = qs("#suburb-filter")?.value || "";
  tableBody.innerHTML = `<tr><td colspan="5">Loading...</td></tr>`;

  try {
    const data = await fetchJSON(`/api/schedules${suburb ? `?suburb=${encodeURIComponent(suburb)}` : ""}`);

    if (!data.length) {
      tableBody.innerHTML = `<tr><td colspan="5">No collection schedules found.</td></tr>`;
      return;
    }

    tableBody.innerHTML = data.map(row => `
      <tr>
        <td>${escapeHTML(row.suburb)}</td>
        <td>${escapeHTML(row.bin_type)}</td>
        <td>${escapeHTML(row.collection_day)}</td>
        <td>${escapeHTML(row.collection_date)}</td>
        <td>Scheduled</td>
      </tr>
    `).join("");
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="5">${escapeHTML(err.message)}</td></tr>`;
  }
}

async function searchRecycling() {
  const results = qs("#recycling-results");
  if (!results) return;

  const q = qs("#recycling-search")?.value || "";
  results.innerHTML = "<p>Searching...</p>";

  try {
    const data = await fetchJSON(`/api/recycling?q=${encodeURIComponent(q)}`);

    if (!data.length) {
      results.innerHTML = `<p>No matching items found. Try a broader word such as "plastic", "glass", or "battery".</p>`;
      return;
    }

    results.innerHTML = data.map(item => `
      <article class="card">
        <h3>${escapeHTML(item.item_name)}</h3>
        <p><strong>Category:</strong> ${escapeHTML(item.category)}</p>
        <p>${escapeHTML(item.disposal_instruction)}</p>
      </article>
    `).join("");
  } catch (err) {
    results.innerHTML = `<p>${escapeHTML(err.message)}</p>`;
  }
}

async function submitReport(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const notice = qs("#report-notice");
  const payload = Object.fromEntries(new FormData(form).entries());

  try {
    const data = await fetchJSON("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    showNotice(notice, `${data.message} Reference number: ${data.reference}`, "success");
    form.reset();
  } catch (err) {
    showNotice(notice, err.message, "error");
  }
}

async function loadDashboard() {
  if (!qs("#report-table-body")) return;

  try {
    const [stats, reports, schedules] = await Promise.all([
      fetchJSON("/api/dashboard"),
      fetchJSON("/api/reports"),
      fetchJSON("/api/schedules")
    ]);

    qs("#stat-total").textContent = stats.total;
    qs("#stat-open").textContent = stats.open;
    qs("#stat-progress").textContent = stats.inProgress;
    qs("#stat-resolved").textContent = stats.resolved;
    qs("#stat-upcoming").textContent = stats.upcomingCollections;

    qs("#report-table-body").innerHTML = reports.map(r => `
      <tr>
        <td>WASTE-${String(r.id).padStart(4, "0")}</td>
        <td>${escapeHTML(r.name)}</td>
        <td>${escapeHTML(r.suburb)}</td>
        <td>${escapeHTML(r.issue_type)}</td>
        <td>${escapeHTML(r.report_date)}</td>
        <td><span class="status ${statusClass(r.status)}">${escapeHTML(r.status)}</span></td>
        <td>
          <select class="status-select" data-id="${r.id}" aria-label="Update report status">
            ${["Open", "In Progress", "Resolved"].map(s =>
              `<option value="${s}" ${s === r.status ? "selected" : ""}>${s}</option>`
            ).join("")}
          </select>
        </td>
      </tr>
    `).join("");

    qs("#admin-schedule-body").innerHTML = schedules.map(s => `
      <tr>
        <td>${s.id}</td>
        <td>${escapeHTML(s.suburb)}</td>
        <td>${escapeHTML(s.bin_type)}</td>
        <td>${escapeHTML(s.collection_date)}</td>
        <td>${escapeHTML(s.collection_day)}</td>
        <td>
          <button class="btn btn-secondary edit-schedule"
            data-id="${s.id}"
            data-suburb="${escapeAttr(s.suburb)}"
            data-bin="${escapeAttr(s.bin_type)}"
            data-date="${escapeAttr(s.collection_date)}"
            data-day="${escapeAttr(s.collection_day)}">
            Edit
          </button>
          <button class="btn btn-danger delete-schedule" data-id="${s.id}">Delete</button>
        </td>
      </tr>
    `).join("");

    qsa(".status-select").forEach(el => el.addEventListener("change", updateStatus));
    qsa(".delete-schedule").forEach(el => el.addEventListener("click", deleteSchedule));
    qsa(".edit-schedule").forEach(el => el.addEventListener("click", fillScheduleForm));

  } catch (err) {
    showNotice(qs("#admin-notice"), err.message, "error");
  }
}

async function updateStatus(event) {
  const id = event.target.dataset.id;
  const status = event.target.value;

  try {
    await fetchJSON(`/api/reports/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    showNotice(qs("#admin-notice"), "Report status updated.", "success");
    loadDashboard();
  } catch (err) {
    showNotice(qs("#admin-notice"), err.message, "error");
  }
}

function fillScheduleForm(event) {
  const btn = event.currentTarget;
  qs("#schedule-id").value = btn.dataset.id;
  qs("#admin-suburb").value = btn.dataset.suburb;
  qs("#admin-bin").value = btn.dataset.bin;
  qs("#admin-date").value = btn.dataset.date;
  qs("#admin-day").value = btn.dataset.day;
  qs("#schedule-submit").textContent = "Update Schedule";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function submitSchedule(event) {
  event.preventDefault();

  const id = qs("#schedule-id").value;
  const payload = {
    suburb: qs("#admin-suburb").value,
    bin_type: qs("#admin-bin").value,
    collection_date: qs("#admin-date").value,
    collection_day: qs("#admin-day").value
  };

  try {
    await fetchJSON(id ? `/api/schedules/${id}` : "/api/schedules", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    showNotice(qs("#admin-notice"), id ? "Schedule updated." : "Schedule added.", "success");
    event.currentTarget.reset();
    qs("#schedule-id").value = "";
    qs("#schedule-submit").textContent = "Add Schedule";
    loadDashboard();
  } catch (err) {
    showNotice(qs("#admin-notice"), err.message, "error");
  }
}

async function deleteSchedule(event) {
  const id = event.currentTarget.dataset.id;
  if (!confirm("Delete this collection schedule?")) return;

  try {
    await fetchJSON(`/api/schedules/${id}`, { method: "DELETE" });
    showNotice(qs("#admin-notice"), "Schedule deleted.", "success");
    loadDashboard();
  } catch (err) {
    showNotice(qs("#admin-notice"), err.message, "error");
  }
}

function statusClass(status) {
  if (status === "Open") return "open";
  if (status === "In Progress") return "progress";
  return "resolved";
}

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value = "") {
  return escapeHTML(value);
}

document.addEventListener("DOMContentLoaded", () => {
  loadSchedules();
  searchRecycling();
  loadDashboard();

  qs("#schedule-filter-form")?.addEventListener("submit", e => {
    e.preventDefault();
    loadSchedules();
  });

  qs("#recycling-search-form")?.addEventListener("submit", e => {
    e.preventDefault();
    searchRecycling();
  });

  qs("#report-form")?.addEventListener("submit", submitReport);
  qs("#schedule-admin-form")?.addEventListener("submit", submitSchedule);

  const dateInput = qs("#report-date");
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().slice(0, 10);
  }
});