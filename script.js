// --- DOM Elements ---
const dateDisplay = document.getElementById('date');
const moodOptions = document.getElementById('mood-options');
const noteInput = document.getElementById('note');
const saveButton = document.getElementById('save');
const clearButton = document.getElementById('clear');
const entriesDiv = document.getElementById('entries');
const weatherInfoDiv = document.getElementById('weather-info');
const calendarOverlay = document.getElementById('calendar-overlay');
const calendarEl = document.getElementById('calendar');
const closeCalendarButton = document.getElementById('close-calendar');
const viewCalendarButton = document.getElementById('view-calendar');
const currentMonthYear = document.getElementById('current-month-year');
const calendarDays = document.getElementById('calendar-days');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');

// --- Date Functions ---
function updateDateDisplay() {
    try {
        const currentDate = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        dateDisplay.textContent = currentDate.toLocaleDateString('en-US', options);
    } catch (error) {
        console.error("Error updating date:", error);
        dateDisplay.textContent = "Date unavailable";
    }
}

// --- Mood Functions ---
function handleMoodSelection(event) {
    try {
        if (event.target.tagName === 'BUTTON') {
            moodOptions.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
            event.target.classList.add('selected');
            mood = event.target.dataset.mood;
        }
    } catch (error) {
        console.error("Error handling mood selection:", error);
    }
}

// --- Entry Functions ---
function handleSaveEntry() {
    try {
        const note = noteInput.value.trim();
        if (mood) {
            saveEntry(new Date().toISOString().split('T')[0], mood, note);
            clearForm();
            updateDisplay();
            showNotification('Entry Saved!');
        } else {
            showAlert('Please select a mood.');
        }
    } catch (error) {
        console.error("Error saving entry:", error);
    }
}

function saveEntry(date, mood, note) {
    try {
        let entries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
        entries.push({
            date,
            mood,
            note
        });
        localStorage.setItem('moodEntries', JSON.stringify(entries));
    } catch (error) {
        console.error("Error saving entry to local storage:", error);
    }
}

function handleClearForm() {
    try {
        clearForm();
    } catch (error) {
        console.error("Error clearing form:", error);
    }
}

function clearForm() {
    noteInput.value = '';
    mood = '';
    moodOptions.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
}

function displayEntries() {
    try {
        entriesDiv.innerHTML = '';
        const entries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
        if (!entries || entries.length === 0) {
            entriesDiv.innerHTML = '<p>No entries yet.</p>';
            return;
        }
        const sortedEntries = entries.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
        sortedEntries.forEach(entry => {
            const entryDiv = document.createElement('div');
            entryDiv.classList.add('entry');
            entryDiv.innerHTML = `
                <p class="entry-date">${formatDate(entry.date)}</p>
                <p class="entry-mood">${entry.mood}</p>
                <p class="entry-note">${entry.note}</p>
            `;
            entriesDiv.appendChild(entryDiv);
        });
    } catch (error) {
        console.error("Error displaying entries:", error);
        entriesDiv.innerHTML = '<p>Error loading entries.</p>';
    }
}

function formatDate(dateString) {
    try {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (error) {
        console.error("Error formatting date:", error);
        return "Invalid Date";
    }
}

// --- Weather Functions ---
const geolocationOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 30000
};

function getGeolocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            handleGeolocationSuccess,
            handleGeolocationError,
            geolocationOptions
        );
    } else {
        weatherInfoDiv.textContent = "Geolocation not supported.";
    }
}

function handleGeolocationSuccess(position) {
    try {
        const {
            latitude,
            longitude
        } = position.coords;
        fetchWeather(latitude, longitude);
    } catch (error) {
        console.error("Error handling geolocation success:", error);
        weatherInfoDiv.textContent = "Error getting location.";
    }
}

function handleGeolocationError(error) {
    console.error("Geolocation error:", error);
    let errorMessage = "Could not retrieve location.";

    switch (error.code) {
        case error.PERMISSION_DENIED:
            errorMessage = "Location access denied.";
            break;
        case error.POSITION_UNAVAILABLE:
            errorMessage = "Location unavailable.";
            break;
        case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        case error.UNKNOWN_ERROR:
            errorMessage = "Unknown geolocation error.";
            break;
    }

    weatherInfoDiv.textContent = errorMessage;
}

async function fetchWeather(latitude, longitude) {
    const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY'; //  <--  REPLACE WITH YOUR KEY
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            const message = `HTTP error! Status: ${response.status}`;
            console.error('Weather API Error:', message);
            throw new Error(message);
        }

        const data = await response.json();
        console.log('Weather API Data:', data);
        displayWeather(data);

    } catch (error) {
        console.error('Fetch Weather Error:', error);
        weatherInfoDiv.textContent = "Weather unavailable.";
    }
}

function displayWeather(data) {
    try {
        if (data && data.main && data.weather && data.weather.length > 0 && data.name) {
            const {
                name,
                main,
                weather
            } = data;
            const temperature = Math.round(main.temp);
            const description = weather[0].description;
            const iconCode = weather[0].icon;
            const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
            weatherInfoDiv.innerHTML = `
                <p class="weather-location"><i class="fas fa-map-marker-alt"></i> ${name}</p>
                <p class="weather-temp"><i class="fas fa-thermometer-half"></i> ${temperature}°C</p>
                <p class="weather-desc"><img src="${iconUrl}" alt="${description}"> ${description}</p>
            `;
        } else {
            console.warn("Invalid weather data:", data);
            weatherInfoDiv.textContent = "Weather data not available.";
        }
    } catch (error) {
        console.error("Error displaying weather:", error);
        weatherInfoDiv.textContent = "Error displaying weather.";
    }
}

// --- Calendar Functions ---
let currentDate = new Date();
let selectedDate = null;

function showCalendar() {
    try {
        calendarOverlay.style.display = 'flex';
        updateCalendar(currentDate.getMonth(), currentDate.getFullYear());
    } catch (error) {
        console.error("Error showing calendar:", error);
    }
}

function hideCalendar() {
    try {
        calendarOverlay.style.display = 'none';
    } catch (error) {
        console.error("Error hiding calendar:", error);
    }
}

function updateCalendar(month, year) {
    try {
        currentMonthYear.textContent = `${new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
        calendarDays.innerHTML = '';

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const startingDay = firstDayOfMonth.getDay();

        let dayCounter = 1;
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 7; j++) {
                if ((i === 0 && j < startingDay) || dayCounter > daysInMonth) {
                    const dayDiv = document.createElement('div');
                    calendarDays.appendChild(dayDiv);
                } else {
                    const dayDiv = document.createElement('div');
                    dayDiv.textContent = dayCounter.toString();
                    dayDiv.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayCounter).padStart(2, '0')}`;
                    dayDiv.addEventListener('click', selectCalendarDate);

                    if (isToday(year, month, dayCounter)) {
                        dayDiv.classList.add('today');
                    }

                    if (hasMoodEntry(year, month, dayCounter)) {
                        dayDiv.classList.add('mood-entry');
                    }

                    calendarDays.appendChild(dayDiv);
                    dayCounter++;
                }
            }
            if (dayCounter > daysInMonth) break;
        }
    } catch (error) {
        console.error("Error updating calendar:", error);
        calendarDays.innerHTML = '<p>Calendar error.</p>';
    }
}

function selectCalendarDate(event) {
    try {
        selectedDate = event.target.dataset.date;
        displayEntriesForDate(selectedDate);
    } catch (error) {
        console.error("Error selecting calendar date:", error);
    }
}

function displayEntriesForDate(date) {
    try {
        entriesDiv.innerHTML = '';
        const entries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
        const filteredEntries = entries.filter(entry => entry.date === date);

        if (filteredEntries.length === 0) {
            entriesDiv.innerHTML = '<p>No entries for this date.</p>';
            return;
        }

        filteredEntries.forEach(entry => {
            const entryDiv = document.createElement('div');
            entryDiv.classList.add('entry');
            entryDiv.innerHTML = `
                <p class="entry-date">${formatDate(entry.date)}</p>
                <p class="entry-mood">${entry.mood}</p>
                <p class="entry-note">${entry.note}</p>
            `;
            entriesDiv.appendChild(entryDiv);
        });
    } catch (error) {
        console.error("Error displaying entries for date:", error);
        entriesDiv.innerHTML = '<p>Error loading entries.</p>';
    }
}

function isToday(year, month, day) {
    const today = new Date();
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
}

function hasMoodEntry(year, month, day) {
    try {
        const dateToCheck = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const entries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
        return entries.some(entry => entry.date === dateToCheck);
    } catch (error) {
        console.error("Error checking for mood entry:", error);
        return false;
    }
}

function changeMonth(delta) {
    try {
        currentDate.setMonth(currentDate.getMonth() + delta);
        updateCalendar(currentDate.getMonth(), currentDate.getFullYear());
    } catch (error) {
        console.error("Error changing month:", error);
    }
}

// --- Notification Functions ---
function showAlert(message) {
    alert(message); //  Replace with a better UI notification if desired
}

function showNotification(message) {
    //  Replace with a styled notification element if desired
    console.log(message);
}

// --- Initialization ---
function initializeApp() {
    try {
        updateDateDisplay();
        moodOptions.addEventListener('click', handleMoodSelection);
        saveButton.addEventListener('click', handleSaveEntry);
        clearButton.addEventListener('click', handleClearForm);
        displayEntries();
        getGeolocation();
        viewCalendarButton.addEventListener('click', showCalendar);
        closeCalendarButton.addEventListener('click', hideCalendar);
        prevMonthButton.addEventListener('click', () => changeMonth(-1));
        nextMonthButton.addEventListener('click', () => changeMonth(1));

    } catch (error) {
        console.error("App initialization error:", error);
    }
}

initializeApp();