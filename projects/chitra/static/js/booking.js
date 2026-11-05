document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('booking-form');
    const steps = Array.from(document.querySelectorAll('.booking-step'));
    const dots = Array.from(document.querySelectorAll('.progress-dot'));
    const lines = Array.from(document.querySelectorAll('.progress-line'));
    const stepNumber = document.getElementById('step-number');
    const nextButton = document.getElementById('next-button');
    const backButton = document.getElementById('back-button');
    const bookingImage = document.querySelector('.booking-image img');
    const bookingCard = document.getElementById('booking-card');
    const bookingPanel = document.querySelector('.booking-panel');
    const confetti = document.getElementById('booking-confetti');
    const businessFields = document.getElementById('business-fields');
    const businessInputs = businessFields.querySelectorAll('input');
    const success = document.getElementById('booking-success');
    const stepStorageKey = 'chitra-booking-step';
    const formStorageKey = 'chitra-booking-values';
    const calendarTrigger = document.getElementById('calendar-trigger');
    const calendar = document.getElementById('calendar');
    const calendarDays = document.getElementById('calendar-days');
    const calendarMonth = document.getElementById('calendar-month');
    const calendarPrevious = document.getElementById('calendar-previous');
    const calendarNext = document.getElementById('calendar-next');
    const dateInput = document.getElementById('event-date');
    const monthNames = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
    const today = new Date();
    const minimumDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    let calendarView = new Date(minimumDate.getFullYear(), minimumDate.getMonth(), 1);
    let calendarFocusDate = null;
    let currentStep = 0;

    function updateProgress() {
        stepNumber.textContent = currentStep + 1;
        dots.forEach(function (dot, index) {
            dot.classList.toggle('is-active', index <= currentStep);
        });
        lines.forEach(function (line, index) {
            line.style.opacity = index < currentStep ? '1' : '.8';
        });
        backButton.hidden = false;
        backButton.style.visibility = currentStep === 0 ? 'hidden' : 'visible';
        nextButton.innerHTML = currentStep === steps.length - 1 ? 'Send forespørsel <span aria-hidden="true">›</span>' : 'Neste <span aria-hidden="true">›</span>';
    }

    function showStep(index) {
        steps.forEach(function (step, stepIndex) {
            step.classList.toggle('is-active', stepIndex === index);
        });
        const imageStep = steps[index].dataset.image;
        if (imageStep) {
            bookingImage.src = imageStep;
            bookingImage.alt = steps[index].dataset.imageAlt || '';
        }
        currentStep = index;
        sessionStorage.setItem(stepStorageKey, String(index));
        updateProgress();
    }

    function updateBookingType() {
        const isBusiness = document.querySelector('input[name="booking_type"]:checked').value === 'bedrift';
        businessFields.hidden = !isBusiness;
        businessInputs.forEach(function (input) {
            input.required = isBusiness;
        });
    }

    function dateKey(date) {
        return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
    }

    const longDateFormatter = new Intl.DateTimeFormat('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' });
    function formatLongDate(date) {
        return longDateFormatter.format(date);
    }

    function addDays(date, amount) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
    }

    function startOfWeek(date) {
        return addDays(date, -((date.getDay() + 6) % 7));
    }

    function addMonths(date, amount) {
        const target = new Date(date.getFullYear(), date.getMonth() + amount, 1);
        const daysInTarget = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
        target.setDate(Math.min(date.getDate(), daysInTarget));
        return target;
    }

    function renderCalendar(direction) {
        if (direction === 'next' || direction === 'prev') {
            const animationClass = direction === 'next' ? 'is-animating-next' : 'is-animating-prev';
            calendarDays.classList.remove('is-animating-next', 'is-animating-prev');
            calendarMonth.classList.remove('is-animating');
            void calendarDays.offsetWidth;
            calendarDays.classList.add(animationClass);
            calendarMonth.classList.add('is-animating');
        }
        const year = calendarView.getFullYear();
        const month = calendarView.getMonth();
        const firstDay = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const mondayOffset = (firstDay.getDay() + 6) % 7;
        const selectedDate = dateInput.value;
        let referenceDate = calendarFocusDate;
        if (!referenceDate || referenceDate.getFullYear() !== year || referenceDate.getMonth() !== month) {
            referenceDate = null;
            if (selectedDate) {
                const selected = new Date(selectedDate + 'T00:00:00');
                if (selected.getFullYear() === year && selected.getMonth() === month) referenceDate = selected;
            }
            if (!referenceDate && minimumDate.getFullYear() === year && minimumDate.getMonth() === month) {
                referenceDate = minimumDate;
            }
            if (!referenceDate) referenceDate = new Date(year, month, 1);
        }
        calendarFocusDate = referenceDate;
        const referenceKey = dateKey(referenceDate);
        const minimumKey = dateKey(minimumDate);
        calendarMonth.textContent = monthNames[month] + ' ' + year;
        calendarDays.innerHTML = '';
        for (let index = 0; index < mondayOffset; index += 1) {
            calendarDays.appendChild(document.createElement('span'));
        }
        for (let day = 1; day <= daysInMonth; day += 1) {
            const date = new Date(year, month, day);
            const key = dateKey(date);
            const label = document.createElement('label');
            label.className = 'calendar-day';
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'calendar-day';
            input.value = key;
            input.disabled = date < minimumDate;
            input.tabIndex = key === referenceKey ? 0 : -1;
            input.checked = key === selectedDate;
            input.setAttribute('aria-label', formatLongDate(date));
            const span = document.createElement('span');
            span.textContent = day;
            label.appendChild(input);
            label.appendChild(span);
            if (key === minimumKey) label.classList.add('is-today');
            calendarDays.appendChild(label);
        }
        calendarPrevious.disabled = year === minimumDate.getFullYear() && month === minimumDate.getMonth();
        if (calendar.matches(':popover-open')) positionCalendarPopover();
    }

    function focusCalendarDate(date) {
        calendarFocusDate = date;
        const target = calendarDays.querySelector('input[value="' + dateKey(date) + '"]');
        if (target) target.focus();
    }

    function updateCalendarTriggerLabel() {
        if (!dateInput.value) {
            calendarTrigger.textContent = 'Velg dato';
            return;
        }
        const date = new Date(dateInput.value + 'T12:00:00');
        calendarTrigger.textContent = formatLongDate(date);
    }

    function positionCalendarPopover() {
        const panelRect = bookingPanel.getBoundingClientRect();
        const left = panelRect.left + (panelRect.width - calendar.offsetWidth) / 2;
        const top = panelRect.top + (panelRect.height - calendar.offsetHeight) / 2;
        calendar.style.left = Math.max(panelRect.left, left) + 'px';
        calendar.style.top = Math.max(panelRect.top, top) + 'px';
    }

    function goToMonth(newView, focusDate) {
        const direction = newView > calendarView ? 'next' : 'prev';
        calendarView = newView;
        calendarFocusDate = focusDate;
        renderCalendar(direction);
    }

    function moveCalendarFocus(newDate) {
        if (newDate < minimumDate) newDate = new Date(minimumDate);
        const monthChanged = newDate.getFullYear() !== calendarView.getFullYear() || newDate.getMonth() !== calendarView.getMonth();
        if (monthChanged) {
            goToMonth(new Date(newDate.getFullYear(), newDate.getMonth(), 1), newDate);
        } else {
            calendarFocusDate = newDate;
            renderCalendar();
        }
        focusCalendarDate(newDate);
    }

    function selectDate(value) {
        dateInput.value = value;
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
        calendarFocusDate = new Date(value + 'T00:00:00');
        calendarView = new Date(calendarFocusDate.getFullYear(), calendarFocusDate.getMonth(), 1);
        updateCalendarTriggerLabel();
        calendar.hidePopover();
        calendarTrigger.focus();
    }

    function saveFormState() {
        const values = {};
        Array.from(form.elements).forEach(function (field) {
            if (!field.name || field.type === 'button') return;
            if (field.type === 'radio' || field.type === 'checkbox') {
                if (field.checked) values[field.name] = field.value;
            } else {
                values[field.name] = field.value;
            }
        });
        sessionStorage.setItem(formStorageKey, JSON.stringify(values));
    }

    function restoreFormState() {
        const savedValues = sessionStorage.getItem(formStorageKey);
        if (!savedValues) return;
        const values = JSON.parse(savedValues);
        Array.from(form.elements).forEach(function (field) {
            if (!field.name || values[field.name] === undefined) return;
            if (field.type === 'radio' || field.type === 'checkbox') {
                field.checked = field.value === values[field.name];
            } else {
                field.value = values[field.name];
            }
        });
    }

    function showConfirmation() {
        const eventName = document.getElementById('event-type').selectedOptions[0].text;
        const dateValue = document.getElementById('event-date').value;
        const date = new Date(dateValue + 'T12:00:00');
        const dateText = formatLongDate(date);
        document.getElementById('confirmation-event').textContent = eventName;
        document.getElementById('confirmation-date').textContent = dateText;
        document.getElementById('confirmation-time').textContent = document.getElementById('event-time').value.replace(':', '.');
        document.getElementById('confirmation-guests').textContent = document.getElementById('guest-count').value + ' gjester';
        document.getElementById('event-link').textContent = 'Les mer om ' + eventName.toLowerCase() + ' ›';
    }

    function launchConfetti() {
        const colors = ['#460B2F', '#9A031E', '#E5A264', '#CAB481', '#FFECE1'];
        const pieceCount = 170;
        for (let index = 0; index < pieceCount; index += 1) {
            const piece = document.createElement('span');
            piece.className = 'confetti-piece' + (Math.random() < 0.35 ? ' is-dot' : '');
            piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            piece.style.left = (Math.random() * 100) + '%';
            piece.style.setProperty('--drift-a', (Math.random() * 220 - 110) + 'px');
            piece.style.setProperty('--drift-b', (Math.random() * 300 - 150) + 'px');
            piece.style.setProperty('--drift-c', (Math.random() * 180 - 90) + 'px');
            piece.style.setProperty('--spin', (360 + Math.random() * 540) + 'deg');
            piece.style.animationDelay = (Math.random() * 1.1) + 's';
            piece.style.animationDuration = (2.8 + Math.random() * 2.2) + 's';
            confetti.appendChild(piece);
        }
    }

    nextButton.addEventListener('click', function () {
        const invalidField = steps[currentStep].querySelector(':invalid');
        if (invalidField) {
            invalidField.reportValidity();
            return;
        }
        if (currentStep < steps.length - 1) {
            showStep(currentStep + 1);
        } else {
            showConfirmation();
            form.hidden = true;
            bookingCard.classList.add('is-complete');
            success.hidden = false;
            launchConfetti();
        }
    });

    backButton.addEventListener('click', function () {
        if (currentStep > 0) showStep(currentStep - 1);
    });

    document.querySelectorAll('input[name="booking_type"]').forEach(function (input) {
        input.addEventListener('change', updateBookingType);
    });

    calendarDays.addEventListener('change', function (event) {
        if (event.target.matches('input[name="calendar-day"]')) selectDate(event.target.value);
    });

    calendarDays.addEventListener('keydown', function (event) {
        const focusDate = calendarFocusDate || calendarView;
        const stepByKey = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 };
        if (stepByKey[event.key] !== undefined) {
            event.preventDefault();
            moveCalendarFocus(addDays(focusDate, stepByKey[event.key]));
        } else if (event.key === 'Home') {
            event.preventDefault();
            moveCalendarFocus(startOfWeek(focusDate));
        } else if (event.key === 'End') {
            event.preventDefault();
            moveCalendarFocus(addDays(startOfWeek(focusDate), 6));
        } else if (event.key === 'PageUp') {
            event.preventDefault();
            moveCalendarFocus(addMonths(focusDate, event.shiftKey ? -12 : -1));
        } else if (event.key === 'PageDown') {
            event.preventDefault();
            moveCalendarFocus(addMonths(focusDate, event.shiftKey ? 12 : 1));
        } else if (event.key === 'Enter' && event.target.matches('input[name="calendar-day"]:not(:disabled)')) {
            event.preventDefault();
            selectDate(event.target.value);
        }
    });

    calendar.addEventListener('beforetoggle', function (event) {
        const isOpen = event.newState === 'open';
        calendarTrigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        if (isOpen) {
            calendar.style.visibility = 'hidden';
            renderCalendar();
        }
    });

    calendar.addEventListener('toggle', function (event) {
        if (event.newState !== 'open') return;
        positionCalendarPopover();
        calendar.style.visibility = 'visible';
        calendar.classList.remove('is-entering');
        void calendar.offsetWidth;
        calendar.classList.add('is-entering');
        const target = calendarDays.querySelector('[tabindex="0"]');
        if (target) target.focus();
    });

    calendarPrevious.addEventListener('click', function () {
        if (calendarPrevious.disabled) return;
        const newFocus = addMonths(calendarFocusDate || calendarView, -1);
        goToMonth(new Date(newFocus.getFullYear(), newFocus.getMonth(), 1), newFocus);
    });

    calendarNext.addEventListener('click', function () {
        const newFocus = addMonths(calendarFocusDate || calendarView, 1);
        goToMonth(new Date(newFocus.getFullYear(), newFocus.getMonth(), 1), newFocus);
    });

    form.addEventListener('input', saveFormState);
    form.addEventListener('change', saveFormState);
    restoreFormState();
    if (dateInput.value) {
        const savedDate = new Date(dateInput.value + 'T12:00:00');
        calendarView = new Date(savedDate.getFullYear(), savedDate.getMonth(), 1);
    }
    renderCalendar();
    updateCalendarTriggerLabel();
    updateBookingType();
    const savedStep = Number.parseInt(sessionStorage.getItem(stepStorageKey), 10);
    const initialStep = Number.isInteger(savedStep) && savedStep >= 0 && savedStep < steps.length ? savedStep : 0;
    showStep(initialStep);
});
