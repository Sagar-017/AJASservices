// ===== SCHEDULER MODULE - AJAS SERVICES =====
// PocketBase Integration with Role-Based Access Control

import PocketBase from 'https://esm.sh/pocketbase';

// Initialize PocketBase connection
const pb = new PocketBase('https://paperfree.bigbeetle.net/');
pb.autoCancellation(false);

// Global state management
let currentUser = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let events = []; // Shared event state for both Grid and Calendar views
let employees = [];
let editingEvent = null;
let currentView = 'grid'; // Track current view: 'grid' or 'calendar'

// ===== AUTHENTICATION & ROLE MANAGEMENT =====
// Restore auth session from localStorage/sessionStorage
const savedToken = localStorage.getItem('pb_token') || sessionStorage.getItem('pb_token');
const savedModel = localStorage.getItem('pb_model') || sessionStorage.getItem('pb_model');

if (savedToken && savedModel) {
  try {
    pb.authStore.save(savedToken, JSON.parse(savedModel));
    currentUser = pb.authStore.model;
  } catch (error) {
    console.error('Failed to restore auth session:', error);
  }
}

// Redirect to login if not authenticated
if (!pb.authStore.isValid) {
  window.location.href = 'login.html';
}

// Logout functionality
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    pb.authStore.clear();
    localStorage.removeItem('pb_auth');
    window.location.href = 'login.html';
  });
}

// ===== POCKETBASE DATA OPERATIONS =====

// Fetch all employees from PocketBase users collection
async function fetchEmployees() {
  try {
    // PocketBase query: fetch all users with role 'employee' or 'hr'
    const records = await pb.collection('users').getFullList({
      filter: "role='employee' || role='hr'",
      sort: 'name'
    });
    employees = records;
    populateEmployeeSelect();
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    showNotification('Failed to load employees', 'error');
  }
}

// Fetch events from PocketBase based on user role
async function fetchEvents() {
  try {
    let filter = '';
    
    // Role-based filtering for PocketBase queries
    if (currentUser.role === 'admin') {
      // Admin sees all events
      filter = `start_datetime >= "${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01" && start_datetime <= "${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-31"`;
    } else if (currentUser.role === 'hr') {
      // HR sees events they created or are assigned to
      filter = `(created_by = "${currentUser.id}" || assigned_to ?~ "${currentUser.id}") && start_datetime >= "${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01" && start_datetime <= "${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-31"`;
    } else {
      // Employee sees only events assigned to them
      filter = `assigned_to ?~ "${currentUser.id}" && start_datetime >= "${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01" && start_datetime <= "${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-31"`;
    }
    
    // PocketBase query: fetch events with role-based filtering
    const records = await pb.collection('events').getFullList({
      filter: filter,
      expand: 'assigned_to,created_by',
      sort: 'start_datetime'
    });
    
    events = records;
    // Update both views with shared event state
    renderGrid();
    renderCalendar();
  } catch (error) {
    console.error('Failed to fetch events:', error);
    showNotification('Failed to load events', 'error');
  }
}

// Create new event in PocketBase
async function createEvent(eventData) {
  try {
    // PocketBase mutation: create new event
    const record = await pb.collection('events').create({
      title: eventData.title,
      description: eventData.description,
      start_datetime: eventData.start_datetime,
      end_datetime: eventData.end_datetime,
      assigned_to: eventData.assigned_to,
      created_by: currentUser.id,
      type: eventData.type,
      status: eventData.status
    });
    
    showNotification('Event created successfully', 'success');
    // Refresh shared event state and update both views
    await fetchEvents();
    closeModal();
  } catch (error) {
    console.error('Failed to create event:', error);
    showNotification('Failed to create event', 'error');
  }
}

// Update event in PocketBase
async function updateEvent(eventId, eventData) {
  try {
    // PocketBase mutation: update existing event
    const record = await pb.collection('events').update(eventId, {
      title: eventData.title,
      description: eventData.description,
      start_datetime: eventData.start_datetime,
      end_datetime: eventData.end_datetime,
      assigned_to: eventData.assigned_to,
      type: eventData.type,
      status: eventData.status
    });
    
    showNotification('Event updated successfully', 'success');
    // Refresh shared event state and update both views
    await fetchEvents();
    closeModal();
  } catch (error) {
    console.error('Failed to update event:', error);
    showNotification('Failed to update event', 'error');
  }
}

// Delete event from PocketBase
async function deleteEvent(eventId) {
  try {
    // PocketBase mutation: delete event
    await pb.collection('events').delete(eventId);
    showNotification('Event deleted successfully', 'success');
    // Refresh shared event state and update both views
    await fetchEvents();
  } catch (error) {
    console.error('Failed to delete event:', error);
    showNotification('Failed to delete event', 'error');
  }
}

// ===== UI RENDERING FUNCTIONS =====

// Populate employee select dropdown
function populateEmployeeSelect() {
  const select = document.getElementById('assignedTo');
  if (!select) return;
  
  select.innerHTML = '';
  employees.forEach(employee => {
    const option = document.createElement('option');
    option.value = employee.id;
    option.textContent = employee.name;
    select.appendChild(option);
  });
}

// Render the Excel-style grid
function renderGrid() {
  const employeeHeaders = document.getElementById('employeeHeaders');
  const gridBody = document.getElementById('gridBody');
  
  if (!employeeHeaders || !gridBody) return;
  
  // Clear existing content
  employeeHeaders.innerHTML = '';
  gridBody.innerHTML = '';
  
  // Render employee headers
  employees.forEach(employee => {
    const header = document.createElement('div');
    header.className = 'employee-header';
    header.innerHTML = `
      ${employee.name}
      <span class="plan-label">Plan</span>
    `;
    employeeHeaders.appendChild(header);
  });
  
  // Render grid rows (days 1-31)
  for (let day = 1; day <= 31; day++) {
    const row = document.createElement('div');
    row.className = 'grid-row';
    
    // Day number cell
    const dayCell = document.createElement('div');
    dayCell.className = 'day-cell';
    dayCell.textContent = day;
    row.appendChild(dayCell);
    
    // Employee cells
    employees.forEach(employee => {
      const cell = document.createElement('div');
      cell.className = 'event-cell';
      
      // Find events for this employee and day
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.start_datetime);
        const eventDay = eventDate.getDate();
        const eventMonth = eventDate.getMonth();
        const eventYear = eventDate.getFullYear();
        
        return eventDay === day && 
               eventMonth === currentMonth && 
               eventYear === currentYear &&
               event.assigned_to.includes(employee.id);
      });
      
      if (dayEvents.length > 0) {
        const event = dayEvents[0]; // Show first event if multiple
        cell.textContent = event.title;
        cell.className += ` has-event type-${event.type}`;
        cell.dataset.eventId = event.id;
        cell.addEventListener('click', () => openEventModal(event));
      } else {
        cell.addEventListener('click', () => openEventModal(null, day, employee.id));
      }
      
      row.appendChild(cell);
    });
    
    // Day number cell (right side)
    const dayCellRight = document.createElement('div');
    dayCellRight.className = 'day-cell';
    dayCellRight.textContent = day;
    row.appendChild(dayCellRight);
    
    // Audit column cell
    const auditCell = document.createElement('div');
    auditCell.className = 'event-cell';
    auditCell.textContent = ''; // Could show audit summary here
    row.appendChild(auditCell);
    
    gridBody.appendChild(row);
  }
}

// Render calendar view
function renderCalendar() {
  const calendarGrid = document.getElementById('calendarGrid');
  if (!calendarGrid) return;
  
  calendarGrid.innerHTML = '';
  
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  // Calendar header
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  weekdays.forEach(day => {
    const dayHeader = document.createElement('div');
    dayHeader.className = 'calendar-day-header';
    dayHeader.textContent = day;
    calendarGrid.appendChild(dayHeader);
  });
  
  // Calendar days
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    if (date.getMonth() !== currentMonth) {
      dayElement.classList.add('other-month');
    }
    
    if (date.toDateString() === new Date().toDateString()) {
      dayElement.classList.add('today');
    }
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'calendar-day-number';
    dayNumber.textContent = date.getDate();
    dayElement.appendChild(dayNumber);
    
    // Add events for this day
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.start_datetime);
      return eventDate.toDateString() === date.toDateString();
    });
    
    if (dayEvents.length > 0) {
      const eventsContainer = document.createElement('div');
      eventsContainer.className = 'calendar-events';
      
      dayEvents.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = `calendar-event type-${event.type}`;
        eventElement.textContent = event.title;
        eventElement.addEventListener('click', () => openEventModal(event));
        eventsContainer.appendChild(eventElement);
      });
      
      dayElement.appendChild(eventsContainer);
    } else {
      // Make empty days clickable for adding events
      dayElement.addEventListener('click', () => {
        if (currentUser.role !== 'employee') {
          openEventModal(null, date.getDate());
        }
      });
    }
    
    calendarGrid.appendChild(dayElement);
  }
}

// ===== MODAL MANAGEMENT =====

// Open event modal for creating or editing
function openEventModal(event = null, day = null, employeeId = null) {
  const modal = document.getElementById('eventModal');
  const modalTitle = document.getElementById('modalTitle');
  const form = document.getElementById('eventForm');
  const deleteBtn = document.getElementById('deleteEventBtn');
  
  editingEvent = event;
  
  if (event) {
    // Edit existing event
    modalTitle.textContent = 'Edit Event';
    
    // Check permissions
    if (currentUser.role === 'hr' && event.created_by !== currentUser.id) {
      showNotification('You can only edit events you created', 'error');
      return;
    }
    
    if (currentUser.role === 'employee') {
      showNotification('Employees cannot edit events', 'error');
      return;
    }
    
    // Show delete button for admin or event creator
    if (deleteBtn) {
      deleteBtn.style.display = (currentUser.role === 'admin' || event.created_by === currentUser.id) ? 'block' : 'none';
    }
    
    // Populate form with event data
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventType').value = event.type;
    document.getElementById('eventDescription').value = event.description || '';
    document.getElementById('eventStatus').value = event.status;
    
    const startDate = new Date(event.start_datetime);
    const endDate = new Date(event.end_datetime);
    
    document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('startTime').value = startDate.toTimeString().slice(0, 5);
    document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
    document.getElementById('endTime').value = endDate.toTimeString().slice(0, 5);
    
    // Set assigned employees
    const assignedSelect = document.getElementById('assignedTo');
    Array.from(assignedSelect.options).forEach(option => {
      option.selected = event.assigned_to.includes(option.value);
    });
  } else {
    // Create new event
    modalTitle.textContent = 'Add Event';
    form.reset();
    
    // Hide delete button for new events
    if (deleteBtn) {
      deleteBtn.style.display = 'none';
    }
    
    if (day && employeeId) {
      // Pre-fill date and employee
      const date = new Date(currentYear, currentMonth, day);
      document.getElementById('startDate').value = date.toISOString().split('T')[0];
      document.getElementById('endDate').value = date.toISOString().split('T')[0];
      
      const assignedSelect = document.getElementById('assignedTo');
      Array.from(assignedSelect.options).forEach(option => {
        option.selected = option.value === employeeId;
      });
    } else if (day) {
      // Pre-fill date only
      const date = new Date(currentYear, currentMonth, day);
      document.getElementById('startDate').value = date.toISOString().split('T')[0];
      document.getElementById('endDate').value = date.toISOString().split('T')[0];
    }
  }
  
  modal.classList.add('show');
}

// Close modal
function closeModal() {
  const modal = document.getElementById('eventModal');
  modal.classList.remove('show');
  editingEvent = null;
}

// Handle form submission
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const eventData = {
    title: formData.get('title'),
    description: formData.get('description'),
    type: formData.get('type'),
    status: formData.get('status'),
    start_datetime: `${formData.get('startDate')}T${formData.get('startTime')}:00`,
    end_datetime: `${formData.get('endDate')}T${formData.get('endTime')}:00`,
    assigned_to: Array.from(document.getElementById('assignedTo').selectedOptions).map(option => option.value)
  };
  
  if (editingEvent) {
    await updateEvent(editingEvent.id, eventData);
  } else {
    await createEvent(eventData);
  }
}

// Handle delete event
async function handleDeleteEvent() {
  if (!editingEvent) return;
  
  if (confirm('Are you sure you want to delete this event?')) {
    await deleteEvent(editingEvent.id);
  }
}

// ===== VIEW TOGGLE FUNCTIONS =====

// Switch between grid and calendar views
function switchView(view) {
  const gridView = document.getElementById('gridView');
  const calendarView = document.getElementById('calendarView');
  const viewBtns = document.querySelectorAll('.view-btn');
  
  currentView = view;
  
  viewBtns.forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-view="${view}"]`).classList.add('active');
  
  if (view === 'grid') {
    gridView.style.display = 'flex';
    calendarView.style.display = 'none';
  } else {
    gridView.style.display = 'none';
    calendarView.style.display = 'block';
    renderCalendar();
  }
}

// ===== EXPORT FUNCTIONALITY =====

// Export events to iCal format
function exportToICS() {
  const icsContent = generateICSContent();
  const blob = new Blob([icsContent], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `scheduler-${currentYear}-${String(currentMonth + 1).padStart(2, '0')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showNotification('Calendar exported successfully', 'success');
}

// Generate iCal content
function generateICSContent() {
  let ics = 'BEGIN:VCALENDAR\r\n';
  ics += 'VERSION:2.0\r\n';
  ics += 'PRODID:-//AJAS Services//Scheduler//EN\r\n';
  ics += 'CALSCALE:GREGORIAN\r\n';
  ics += 'METHOD:PUBLISH\r\n';
  
  events.forEach(event => {
    ics += 'BEGIN:VEVENT\r\n';
    ics += `UID:${event.id}@ajasservices.com\r\n`;
    ics += `DTSTART:${formatDateForICS(event.start_datetime)}\r\n`;
    ics += `DTEND:${formatDateForICS(event.end_datetime)}\r\n`;
    ics += `SUMMARY:${event.title}\r\n`;
    ics += `DESCRIPTION:${event.description || ''}\r\n`;
    ics += `STATUS:${event.status.toUpperCase()}\r\n`;
    ics += 'END:VEVENT\r\n';
  });
  
  ics += 'END:VCALENDAR\r\n';
  return ics;
}

// Format date for iCal
function formatDateForICS(dateString) {
  const date = new Date(dateString);
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

// ===== UTILITY FUNCTIONS =====

// Show notification
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: var(--radius);
    color: white;
    font-weight: 600;
    z-index: 1001;
    animation: slideIn 0.3s ease;
  `;
  
  if (type === 'success') {
    notification.style.background = '#4caf50';
  } else if (type === 'error') {
    notification.style.background = '#f44336';
  } else {
    notification.style.background = '#215B8D';
  }
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// ===== EVENT LISTENERS =====

// Initialize event listeners
function initializeEventListeners() {
  // View toggle buttons
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const view = e.target.dataset.view;
      switchView(view);
    });
  });
  
  // Add event button
  const addEventBtn = document.getElementById('addEventBtn');
  if (addEventBtn) {
    addEventBtn.addEventListener('click', () => {
      // Check permissions
      if (currentUser.role === 'employee') {
        showNotification('Employees cannot create events', 'error');
        return;
      }
      openEventModal();
    });
  }
  
  // Export button
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportToICS);
  }
  
  // Modal close buttons
  const closeModalBtn = document.getElementById('closeModal');
  const cancelEventBtn = document.getElementById('cancelEvent');
  
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }
  
  if (cancelEventBtn) {
    cancelEventBtn.addEventListener('click', closeModal);
  }
  
  // Delete event button
  const deleteEventBtn = document.getElementById('deleteEventBtn');
  if (deleteEventBtn) {
    deleteEventBtn.addEventListener('click', handleDeleteEvent);
  }
  
  // Modal backdrop click
  const modal = document.getElementById('eventModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }
  
  // Form submission
  const eventForm = document.getElementById('eventForm');
  if (eventForm) {
    eventForm.addEventListener('submit', handleFormSubmit);
  }
  
  // Calendar navigation
  const prevMonthBtn = document.getElementById('prevMonth');
  const nextMonthBtn = document.getElementById('nextMonth');
  
  if (prevMonthBtn) {
    prevMonthBtn.addEventListener('click', () => {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      updateMonthDisplay();
      fetchEvents();
    });
  }
  
  if (nextMonthBtn) {
    nextMonthBtn.addEventListener('click', () => {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      updateMonthDisplay();
      fetchEvents();
    });
  }
}

// Update month display
function updateMonthDisplay() {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];
  
  const monthTitle = document.querySelector('.scheduler-title h2');
  const calendarTitle = document.getElementById('calendarTitle');
  
  if (monthTitle) {
    monthTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;
  }
  
  if (calendarTitle) {
    calendarTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;
  }
}

// ===== INITIALIZATION =====

// Initialize the scheduler module
async function initializeScheduler() {
  try {
    // Check user permissions
    if (!currentUser) {
      window.location.href = 'login.html';
      return;
    }
    
    // Initialize UI
    initializeEventListeners();
    updateMonthDisplay();
    
    // Load data
    await fetchEmployees();
    await fetchEvents();
    
    // Set initial view based on user role
    if (currentUser.role === 'employee') {
      // Employees default to calendar view on mobile
      if (window.innerWidth <= 768) {
        switchView('calendar');
      }
    }
    
  } catch (error) {
    console.error('Failed to initialize scheduler:', error);
    showNotification('Failed to initialize scheduler', 'error');
  }
}

// Start the application
document.addEventListener('DOMContentLoaded', initializeScheduler);
