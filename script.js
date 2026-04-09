// ---------- App State ----------
let appointments = [];

try {
  const data = localStorage.getItem('appointments');
  appointments = data ? JSON.parse(data) : [
    { id: '1', patient: 'Henry James', doctor: 'James Marry', hospital: 'Salus Center', specialty: 'Dermatology', date: '2026-04-09', time: '03:24' },
    { id: '2', patient: 'James Marry', doctor: 'Dhivya Rohan', hospital: 'Apolo Hospitals', specialty: 'Cardiology', date: '2026-04-20', time: '12:00' }
  ];
} catch {
  appointments = [];
}

let currentMonthOffset = 0;
let currentView = 'calendar';

// ---------- DOM ----------
const calendarGrid = document.getElementById('calendar-grid');
const currentMonthDisplay = document.getElementById('current-month-display');
const appointmentTableBody = document.getElementById('appointment-table-body');
const appointmentForm = document.getElementById('appointment-form');

// ---------- Helpers ----------
function formatYMD(date) {
  return date.toISOString().split('T')[0];
}

function saveToLocal() {
  localStorage.setItem('appointments', JSON.stringify(appointments));
}

// ---------- Calendar ----------
function initCalendar() {
  const today = new Date();
const target = new Date(
  today.getFullYear(),
  today.getMonth() + currentMonthOffset,
  1
);
currentMonthDisplay.innerText = target.toLocaleString('default', {
  month: 'long',
  year: 'numeric'
});


  calendarGrid.innerHTML = '';

  // 🔥 ADD THIS (weekday headers)
  const weekdays = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  weekdays.forEach(day => {
    const header = document.createElement('div');
    header.className = 'day-header';
    header.innerText = day;
    calendarGrid.appendChild(header);
  });

  const firstDay = target.getDay();
  const daysInMonth = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();

  const totalCells = 35; // 🔥 42 - 7 header

  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement('div');
    cell.className = 'day-cell';

    const dayNumber = i - firstDay + 1;

    if (i >= firstDay && dayNumber > 0 && dayNumber <= daysInMonth) {
      const dateObj = new Date(target.getFullYear(), target.getMonth(), dayNumber);
      const dateStr = formatYMD(dateObj);

      cell.innerHTML = `<b>${dayNumber}</b>`;

      getFilteredAppointments().filter(a => a.date === dateStr)
        .forEach(app => {
          const badge = document.createElement('div');
          badge.className = 'appt-badge';

          badge.innerHTML = `
  <div><b>${app.time}</b></div>
  <div>${app.patient}</div>
  <div style="font-size:10px; color:#555;">Dr. ${app.doctor}</div>

  <div style="margin-left:auto; display:flex; gap:6px;">
    <i class="fa-solid fa-pen" onclick="event.stopPropagation(); editAppointment('${app.id}')"></i>
    <i class="fa-solid fa-trash" onclick="event.stopPropagation(); deleteAppointment('${app.id}')"></i>
  </div>
`;
          cell.appendChild(badge);
        });

      cell.onclick = () => {
        openModal();
        document.getElementById('form-date').value = dateStr;
      };
    } else {
      cell.classList.add('empty');
    }

    calendarGrid.appendChild(cell);
  }
}

/*renderTable */
function renderTable(list = appointments) {
  appointmentTableBody.innerHTML = '';

  if (list.length === 0) {
    appointmentTableBody.innerHTML = `
      <tr><td colspan="7" style="text-align:center;">No appointments found</td></tr>
    `;
    return;
  }

  list.forEach(a => {
    appointmentTableBody.innerHTML += `
      <tr>
        <td>${a.patient}</td>
        <td>${a.doctor}</td>
        <td>${a.hospital}</td>
        <td>${a.specialty}</td>
        <td>${a.date}</td>
        <td>${a.time}</td>
        <td class="action-cell">
          <i class="fa-solid fa-pen" onclick="editAppointment('${a.id}')"></i>
          <i class="fa-solid fa-trash" onclick="deleteAppointment('${a.id}')"></i>
        </td>
      </tr>
    `;
  });
}
// ---------- CRUD ----------

// ✅ SINGLE submit handler (fixed)
appointmentForm.addEventListener("submit", function(e) {
  e.preventDefault();

  const id = document.getElementById('appointment-id').value;

  const newApp = {
    id: id || Date.now().toString(),
    patient: document.getElementById('form-patient-name').value,
    doctor: document.getElementById('form-doctor-name').value,
    hospital: document.getElementById('form-hospital-name').value,
    specialty: document.getElementById('form-specialty').value,
    date: document.getElementById('form-date').value,
    time: document.getElementById('form-time').value
  };

  if (id) {
    // edit
    appointments = appointments.map(a => a.id === id ? newApp : a);
  } else {
    // add
    appointments.push(newApp);
  }

  saveToLocal();
  closeModal();
  initCalendar();   // 🔥 FIXED
  renderTable();
});

// EDIT
function editAppointment(id) {
  const app = appointments.find(a => a.id === id);
  if (!app) return;

  openModal();

  document.getElementById('appointment-id').value = app.id;
  document.getElementById('form-patient-name').value = app.patient;
  document.getElementById('form-doctor-name').value = app.doctor;
  document.getElementById('form-hospital-name').value = app.hospital;
  document.getElementById('form-specialty').value = app.specialty;
  document.getElementById('form-date').value = app.date;
  document.getElementById('form-time').value = app.time;
}

// DELETE
function deleteAppointment(id) {
  appointments = appointments.filter(a => a.id !== id);
  saveToLocal();
  initCalendar();
  renderTable();
}

// ---------- UI ----------
function openModal() {
  document.getElementById("modal-overlay").classList.remove("hidden");
  appointmentForm.reset();
  document.getElementById('appointment-id').value = "";
}

function closeModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
}
/* switch view */
function switchView(view) {
  currentView = view;

  const calendar = document.getElementById('calendar-view');
  const dashboard = document.getElementById('dashboard-view');

  if (view === 'calendar') {
    calendar.style.display = 'block';
    dashboard.style.display = 'none';
    initCalendar();
  } else {
    calendar.style.display = 'none';
    dashboard.style.display = 'block';
    renderTable(); // 🔥 VERY IMPORTANT
  }
}
// ---------- Init ----------

document.addEventListener('DOMContentLoaded', () => {
  initCalendar();
  renderTable();
  switchView('calendar');
});

/* search appoinments */

document.getElementById('search-patient').addEventListener('input', searchAppointments);
document.getElementById('search-doctor').addEventListener('input', searchAppointments);
document.getElementById('search-date').addEventListener('change', searchAppointments);

document.getElementById('search-time').addEventListener('change', searchAppointments);

function changeMonth(delta) {
  currentMonthOffset += delta;
  initCalendar(); // 🔥 re-render calendar
}
function goToToday() {
  currentMonthOffset = 0;
  initCalendar();
}
function getFilteredAppointments() {
  const patient = document.getElementById('search-patient').value.toLowerCase();
  const doctor = document.getElementById('search-doctor').value.toLowerCase();
  const fromDate = document.getElementById('search-date-from')?.value;
  const toDate = document.getElementById('search-date-to')?.value;
  const time = document.getElementById('search-time').value;

  return appointments.filter(a => {
    return (
      (!patient || a.patient.toLowerCase().includes(patient)) &&
      (!doctor || a.doctor.toLowerCase().includes(doctor)) &&
      (!time || a.time.startsWith(time)) &&
      (!fromDate || a.date >= fromDate) &&
      (!toDate || a.date <= toDate)
    );
  });
}
function applyFilters() {
  const filtered = getFilteredAppointments();
  renderTable(filtered);
  initCalendar();
}