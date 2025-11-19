const BASE_URL = "http://localhost:3000";

// ====================== AUTH ======================

// SIGNUP
function signup() {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    axios.post(`${BASE_URL}/signup`, { name, email, password })
        .then(res => alert(res.data.message))
        .catch(err => alert("Signup failed"));
}
// SWITCH TO LOGIN PAGE
function showLogin() {
    document.getElementById("signup-div").style.display = "none";
    document.getElementById("login-div").style.display = "block";
}

// SWITCH TO SIGNUP PAGE
function showSignup() {
    document.getElementById("login-div").style.display = "none";
    document.getElementById("signup-div").style.display = "block";
}

// LOGIN
function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    axios.post(`${BASE_URL}/signin`, { email, password })
        .then(res => {
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                showTodoSection();
                fetchTodos();
            } else {
                alert("Invalid login");
            }
        })
        .catch(() => alert("Login failed"));
}

// LOGOUT
function logout() {
    localStorage.removeItem('token');
    document.getElementById("todo-section").style.display = "none";
    document.getElementById("auth-section").style.display = "block";
}



// ====================== TODO LOGIC ======================

const input = document.getElementById('input-container');
const addBtn = document.getElementById('add');
const todosList = document.getElementById('todos-list');
let currentlyEditingId = null;


// display TODO section only after login
function showTodoSection() {
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("todo-section").style.display = "block";
}

// Create todo UI element
function createTodoElement(todo) {
    const div = document.createElement('div');
    div.className = "todo-item";

    const span = document.createElement('span');
    span.textContent = todo.title;
    div.appendChild(span);

    const del = document.createElement('button');
    del.textContent = "del";
    del.onclick = () => deleteTodo(todo._id, div);
    div.appendChild(del);

    const update = document.createElement('button');
    update.textContent = "update";
    update.onclick = () => updateTodo(todo._id, span);
    div.appendChild(update);

    return div;
}

// ADD TODO
function addTodo() {
    const todoTitle = input.value.trim();
    const token = localStorage.getItem('token');

    if (!todoTitle) {
        return;
    }

    // ------------------ UPDATE MODE ------------------
    if (currentlyEditingId) {
        axios.patch(`${BASE_URL}/updatetodo/${currentlyEditingId}`, {
            title: todoTitle
        }, {
            headers: { token }
        })
            .then(() => {

                fetchTodos();        // refresh UI
                input.value = "";    // clear input
                addBtn.textContent = "Add";  // reset button text
                currentlyEditingId = null;   // exit edit mode
            })
            .catch(() => alert("Error updating todo"));
        return;
    }

    // ------------------ NORMAL ADD ------------------
    axios.post(`${BASE_URL}/addtodo`, {
        title: todoTitle,
        status: "pending"
    }, {
        headers: { token }
    })
        .then(response => {
            const todo = response.data.todo;
            todosList.appendChild(createTodoElement(todo));
            input.value = "";
        })
        .catch(() => alert("Error adding todo"));
}


// GET TODOS
function fetchTodos() {
    const token = localStorage.getItem('token');

    axios.get(`${BASE_URL}/todo`, {
        headers: { token }
    })
        .then(response => {
            todosList.innerHTML = "";
            response.data.todos.forEach(todo => {
                todosList.appendChild(createTodoElement(todo));
            });
        })
        .catch(() => alert("Error fetching todos"));
}

// DELETE TODO
function deleteTodo(id, element) {
    const token = localStorage.getItem('token');

    axios.delete(`${BASE_URL}/deletetodo/${id}`, {
        headers: { token }
    })
        .then(() => element.remove())
        .catch(() => alert("Error deleting todo"));
}

// UPDATE TODO
function updateTodo(id, span) {
    currentlyEditingId = id;   // which todo is being edited
    input.value = span.textContent; // old title → input box me dal do
    addBtn.textContent = "Update Todo"; // button ka text update
}


addBtn.addEventListener('click', addTodo);

// AUTO LOGIN IF TOKEN EXISTS
if (localStorage.getItem('token')) {
    showTodoSection();
    fetchTodos();
}
