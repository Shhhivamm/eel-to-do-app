const todo_title_input = document.getElementById("todo-title-input");
const todo_timer_input = document.getElementById("todo-timer-input");
const todo_add_btn = document.getElementById("todo-add-btn");
const todo_table_body = document.getElementById("todo-table-body");

// Store active timers
const activeTimers = new Map();

// Function to convert hrs:min to total minutes
function convertTimeToMinutes(timeStr) {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;
    return hours * 60 + minutes;
}

// Function to format minutes as hrs:min
function formatMinutesAsTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
}

// Expose the function to be called from Python
eel.expose(displayTodo);
function displayTodo(todo) {
    let tr = document.createElement("tr");

    let td1 = document.createElement("td");
    td1.innerHTML = `<span class="task-title">${todo['title']}</span>`;

    let td2 = document.createElement("td");
    let timerDisplay = document.createElement("span");
    timerDisplay.id = `timer-${todo['id']}`;
    timerDisplay.className = 'timer-display';
    timerDisplay.innerText = todo['timer'] ? formatMinutesAsTime(todo['timer']) : 'No timer';
    td2.appendChild(timerDisplay);

    let td3 = document.createElement("td");
    let checkbox = document.createElement("input");
    checkbox.setAttribute("type", "checkbox");
    checkbox.setAttribute("data-id", todo['id']);
    checkbox.className = 'form-check-input';

    // When checkbox is clicked, delete the todo
    checkbox.addEventListener("click", (event) => {
        event.target.setAttribute("disabled", "true");
        let id = parseInt(event.target.getAttribute("data-id"));
        
        // Clear timer if exists
        if (activeTimers.has(id)) {
            clearInterval(activeTimers.get(id));
            activeTimers.delete(id);
        }

        eel.delete_todo(id);

        // Animate and remove row
        let tr = event.target.closest("tr");
        $(tr).fadeTo("slow", 0.001, function () {
            $(this).remove();
        });
    });

    td3.appendChild(checkbox);
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    todo_table_body.appendChild(tr);

    // Start timer if specified
    if (todo['timer']) {
        startTimer(todo['id'], todo['timer'], timerDisplay);
    }

    // Clear the input fields
    todo_title_input.value = "";
    todo_timer_input.value = "";
}

function startTimer(id, minutes, display) {
    let timeLeft = minutes * 60; // Convert to seconds
    
    const timer = setInterval(() => {
        timeLeft--;
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        display.innerText = `${formatMinutesAsTime(mins)}:${secs.toString().padStart(2, '0')}`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            activeTimers.delete(id);
            display.innerText = "Time's up!";
            display.style.color = '#dc3545';
            // Play notification sound
            new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3').play();
        }
    }, 1000);

    activeTimers.set(id, timer);
}

// Expose function to display all todos on load
eel.expose(displayAllTodos);
function displayAllTodos(todos) {
    for (let todo of todos["todos"]) {
        displayTodo(todo);
    }
}

// When "Add" button is clicked
todo_add_btn.addEventListener("click", () => {
    let content = todo_title_input.value.trim();
    let timer = convertTimeToMinutes(todo_timer_input.value);

    if (content.length > 0) {
        eel.create_todo(content, timer)(displayTodo);
    }
});

// Add input validation for timer
todo_timer_input.addEventListener('input', function(e) {
    const value = e.target.value;
    if (value && !value.match(/^([0-9]+):([0-5][0-9])$/)) {
        e.target.setCustomValidity('Please enter time in format hrs:min (e.g., 1:30)');
        e.target.classList.add('is-invalid');
    } else {
        e.target.setCustomValidity('');
        e.target.classList.remove('is-invalid');
    }
});

// Add focus effects
todo_title_input.addEventListener('focus', function() {
    this.parentElement.classList.add('focused');
});

todo_title_input.addEventListener('blur', function() {
    this.parentElement.classList.remove('focused');
});

todo_timer_input.addEventListener('focus', function() {
    this.parentElement.classList.add('focused');
});

todo_timer_input.addEventListener('blur', function() {
    this.parentElement.classList.remove('focused');
});

// Load todos on startup
eel.list_todo()(displayAllTodos);
