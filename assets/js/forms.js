/**
 * forms.js — Accordions, filters, search, calendar, form validation
 * EFREI CS Department Website
 */

(function () {
  'use strict';

  /* ===================================================
     ACCORDION
     =================================================== */
  function initAccordions() {
    document.querySelectorAll('.accordion-header').forEach(function (header) {
      header.addEventListener('click', function () {
        const body = this.nextElementSibling;
        const isOpen = this.classList.contains('open');

        // Close all in same group
        const group = this.closest('.accordion-group');
        if (group) {
          group.querySelectorAll('.accordion-header.open').forEach(function (h) {
            h.classList.remove('open');
            h.setAttribute('aria-expanded', 'false');
            const b = h.nextElementSibling;
            if (b) b.classList.remove('open');
          });
        }

        if (!isOpen) {
          this.classList.add('open');
          this.setAttribute('aria-expanded', 'true');
          if (body) body.classList.add('open');
        }
      });

      header.setAttribute('aria-expanded', 'false');
      header.setAttribute('role', 'button');
      header.setAttribute('tabindex', '0');

      header.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    });
  }

  /* ===================================================
     COURSE FILTER
     =================================================== */
  function initCourseFilter() {
    const filterTabs = document.querySelectorAll('.filter-tab[data-filter]');
    const courseCards = document.querySelectorAll('.course-card[data-category]');
    const noResults = document.querySelector('.no-results');
    if (!filterTabs.length || !courseCards.length) return;

    filterTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        filterTabs.forEach(function (t) { t.classList.remove('active'); });
        this.classList.add('active');

        const filter = this.getAttribute('data-filter');
        let visible = 0;

        courseCards.forEach(function (card) {
          const categories = card.getAttribute('data-category').split(' ');
          const matches = filter === 'all' || categories.includes(filter);
          if (matches) {
            card.style.display = '';
            card.style.animation = 'fadeInUp 0.4s ease both';
            visible++;
          } else {
            card.style.display = 'none';
          }
        });

        if (noResults) {
          noResults.classList.toggle('show', visible === 0);
        }
      });
    });
  }

  /* ===================================================
     FACULTY LIVE SEARCH
     =================================================== */
  function initFacultySearch() {
    const searchInput = document.getElementById('faculty-search');
    const facultyCards = document.querySelectorAll('.faculty-card');
    const noResults = document.getElementById('faculty-no-results');
    if (!searchInput || !facultyCards.length) return;

    searchInput.addEventListener('input', function () {
      const query = this.value.toLowerCase().trim();
      let visible = 0;

      facultyCards.forEach(function (card) {
        const name = (card.querySelector('.faculty-name') || {}).textContent || '';
        const role = (card.querySelector('.faculty-role') || {}).textContent || '';
        const tags = (card.querySelector('.faculty-tags') || {}).textContent || '';
        const text = (name + ' ' + role + ' ' + tags).toLowerCase();
        const matches = !query || text.includes(query);

        card.style.display = matches ? '' : 'none';
        if (matches) visible++;
      });

      if (noResults) {
        noResults.classList.toggle('show', visible === 0);
      }
    });

    // Clear button
    const clearBtn = document.getElementById('faculty-search-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
        searchInput.focus();
      });
    }
  }

  /* ===================================================
     EVENTS CALENDAR
     =================================================== */
  function initCalendar() {
    const calendarEl = document.getElementById('events-calendar');
    if (!calendarEl) return;

    const events = [
      { date: '2026-04-14', title: 'AI & ML Seminar', type: 'seminar' },
      { date: '2026-04-17', title: 'Open Source Day', type: 'event' },
      { date: '2026-04-22', title: 'Spring Hackathon', type: 'hackathon' },
      { date: '2026-04-25', title: 'Faculty Symposium', type: 'seminar' },
      { date: '2026-04-28', title: 'Career Fair', type: 'event' },
      { date: '2026-05-01', title: 'Labour Day (Holiday)', type: 'holiday' },
      { date: '2026-05-08', title: 'EFREI Research Day', type: 'seminar' },
      { date: '2026-05-15', title: 'Cybersecurity Workshop', type: 'event' },
      { date: '2026-05-20', title: 'Start-up Challenge Finals', type: 'hackathon' },
    ];

    let currentDate = new Date(2026, 3, 1); // April 2026

    function renderCalendar(date) {
      const year = date.getFullYear();
      const month = date.getMonth();
      const today = new Date();

      const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      calendarEl.innerHTML = '';

      // Header
      const header = document.createElement('div');
      header.className = 'calendar-header flex-between';
      header.innerHTML = `
        <button class="calendar-nav-btn" id="cal-prev" aria-label="Previous month">&#8249;</button>
        <span class="calendar-month-label">${monthNames[month]} ${year}</span>
        <button class="calendar-nav-btn" id="cal-next" aria-label="Next month">&#8250;</button>
      `;
      calendarEl.appendChild(header);

      // Weekdays
      const weekdaysRow = document.createElement('div');
      weekdaysRow.className = 'calendar-grid calendar-weekdays-row';
      dayNames.forEach(function (d) {
        const cell = document.createElement('div');
        cell.className = 'calendar-weekday';
        cell.textContent = d;
        weekdaysRow.appendChild(cell);
      });
      calendarEl.appendChild(weekdaysRow);

      // Days grid
      const grid = document.createElement('div');
      grid.className = 'calendar-grid';

      // Empty cells before first day
      for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-cell calendar-empty';
        grid.appendChild(empty);
      }

      // Day cells
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayEvents = events.filter(function (e) { return e.date === dateStr; });
        const isToday = (today.getFullYear() === year && today.getMonth() === month && today.getDate() === day);

        const cell = document.createElement('div');
        cell.className = 'calendar-cell' + (isToday ? ' calendar-today' : '') + (dayEvents.length ? ' has-event' : '');
        cell.setAttribute('data-date', dateStr);

        const numSpan = document.createElement('span');
        numSpan.className = 'calendar-day-num';
        numSpan.textContent = day;
        cell.appendChild(numSpan);

        if (dayEvents.length) {
          dayEvents.forEach(function (ev) {
            const dot = document.createElement('div');
            dot.className = 'calendar-event-dot event-' + ev.type;
            dot.setAttribute('title', ev.title);
            cell.appendChild(dot);
          });

          cell.addEventListener('click', function () {
            showEventTooltip(cell, dayEvents, dateStr);
          });
        }

        grid.appendChild(cell);
      }
      calendarEl.appendChild(grid);

      // Nav buttons
      document.getElementById('cal-prev').addEventListener('click', function () {
        currentDate = new Date(year, month - 1, 1);
        renderCalendar(currentDate);
      });

      document.getElementById('cal-next').addEventListener('click', function () {
        currentDate = new Date(year, month + 1, 1);
        renderCalendar(currentDate);
      });
    }

    function showEventTooltip(cell, dayEvents, dateStr) {
      // Remove existing tooltips
      document.querySelectorAll('.event-tooltip').forEach(function (t) { t.remove(); });

      const tooltip = document.createElement('div');
      tooltip.className = 'event-tooltip';
      tooltip.innerHTML = `
        <strong>${dateStr}</strong>
        <ul>
          ${dayEvents.map(function (e) {
            return `<li class="event-item event-${e.type}">
              <span class="event-dot-label"></span>${e.title}
            </li>`;
          }).join('')}
        </ul>
        <button class="tooltip-close" aria-label="Close">&#x2715;</button>
      `;

      cell.appendChild(tooltip);
      tooltip.querySelector('.tooltip-close').addEventListener('click', function (e) {
        e.stopPropagation();
        tooltip.remove();
      });

      // Close on outside click
      setTimeout(function () {
        document.addEventListener('click', function handler(ev) {
          if (!tooltip.contains(ev.target)) {
            tooltip.remove();
            document.removeEventListener('click', handler);
          }
        });
      }, 0);
    }

    renderCalendar(currentDate);
  }

  /* ===================================================
     CONTACT FORM VALIDATION
     =================================================== */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const successMsg = document.getElementById('form-success');
    const fields = {
      name:    { el: document.getElementById('contact-name'),    errorId: 'name-error' },
      email:   { el: document.getElementById('contact-email'),   errorId: 'email-error' },
      subject: { el: document.getElementById('contact-subject'), errorId: 'subject-error' },
      message: { el: document.getElementById('contact-message'), errorId: 'message-error' }
    };

    function showError(field, msg) {
      field.el.classList.add('error');
      field.el.classList.remove('success');
      const errEl = document.getElementById(field.errorId);
      if (errEl) { errEl.textContent = msg; errEl.classList.add('show'); }
    }

    function showSuccess(field) {
      field.el.classList.remove('error');
      field.el.classList.add('success');
      const errEl = document.getElementById(field.errorId);
      if (errEl) errEl.classList.remove('show');
    }

    function validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validateField(key) {
      const field = fields[key];
      if (!field.el) return true;
      const val = field.el.value.trim();

      if (key === 'name') {
        if (!val) { showError(field, 'Full name is required.'); return false; }
        if (val.length < 2) { showError(field, 'Name must be at least 2 characters.'); return false; }
      } else if (key === 'email') {
        if (!val) { showError(field, 'Email address is required.'); return false; }
        if (!validateEmail(val)) { showError(field, 'Please enter a valid email address.'); return false; }
      } else if (key === 'subject') {
        if (!val) { showError(field, 'Please select a subject.'); return false; }
      } else if (key === 'message') {
        if (!val) { showError(field, 'Message cannot be empty.'); return false; }
        if (val.length < 20) { showError(field, 'Message must be at least 20 characters.'); return false; }
      }

      showSuccess(field);
      return true;
    }

    // Real-time validation on blur
    Object.keys(fields).forEach(function (key) {
      const field = fields[key];
      if (!field.el) return;
      field.el.addEventListener('blur', function () { validateField(key); });
      field.el.addEventListener('input', function () {
        if (field.el.classList.contains('error')) validateField(key);
      });
    });

    // Submit
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      let allValid = true;
      Object.keys(fields).forEach(function (key) {
        if (!validateField(key)) allValid = false;
      });

      if (allValid) {
        const btn = form.querySelector('[type="submit"]');
        const origText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="loading-dots"><span></span><span></span><span></span></span>';

        setTimeout(function () {
          btn.disabled = false;
          btn.innerHTML = origText;
          form.reset();
          Object.keys(fields).forEach(function (key) {
            const field = fields[key];
            if (field.el) { field.el.classList.remove('success', 'error'); }
          });
          if (successMsg) {
            successMsg.style.display = 'flex';
            setTimeout(function () { successMsg.style.display = 'none'; }, 5000);
          }
        }, 1500);
      }
    });
  }

  /* ===================================================
     INIT ALL
     =================================================== */
  document.addEventListener('DOMContentLoaded', function () {
    initAccordions();
    initCourseFilter();
    initFacultySearch();
    initCalendar();
    initContactForm();
  });

})();
