
const BASE_URL = "http://localhost:3000"

// ------------------------auth logic------------------------


const showSignup = () => {
    document.getElementById("signup-div").style.display = "block"
    document.getElementById("login-div").style.display = "none"
}

const showLogin = () => {
    document.getElementById("signup-div").style.display = "none"
    document.getElementById("login-div").style.display = "block"
}

const signup = () => {
    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    axios.post(`${BASE_URL}/signup`, { name, email, password })
        .then(res => showLogin())
        .catch(err => alert("Signup failed"));
}

const login = () => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    axios.post(`${BASE_URL}/signin`, { email, password })
        .then(res => {
            if (res.data.token) {
                localStorage.setItem('token', res.data.token)
                showTodoSection()
                fetchTodos()
            } else {
                alert("Invalid login");
            }
        })
        .catch(err => alert("Login failed"));
}

const logout = () => {
    localStorage.removeItem('token')
    document.getElementById("todo-section").style.display = "none";
    document.getElementById("auth-section").style.display = "block";
    showLogin()
}


// ------------------------- todos logic --------------------------


const input = document.getElementById('input-container');
const addBtn = document.getElementById('add');
const todosList = document.getElementById('todos-list');
let currentlyEditingId = null;

const showTodoSection = () => {
    document.getElementById("todo-section").style.display = "block";
    document.getElementById("auth-section").style.display = "none";
}

const createTodoElement = (todo) => {
    const div = document.createElement('div')
    div.className = "todo-item";
    const span = document.createElement('span');
    span.textContent = todo.title
    div.appendChild(span)

    const del = document.createElement('button')
    del.textContent = "delete"
    del.onclick = () => deleteTodo(todo._id, div)
    div.appendChild(del);

    const update = document.createElement('button')
    update.textContent = "update";
    update.onclick = () => updateTodo(todo._id, span)
    div.appendChild(update);


    return div
}


const addTodo = () => {
    const todoTitle = input.value.trim();
    const token = localStorage.getItem('token');
    if (!todoTitle) {
        return
    }
    if (currentlyEditingId) {
        axios.patch(`${BASE_URL}/updatetodo/${currentlyEditingId}`, {
            title: todoTitle,
        }, {
            headers: { token }
        })
            .then(() => {
                fetchTodos()
                input.value = todoTitle;
                addBtn.textContent = "Add"
                currentlyEditingId = null;
            })
            .catch(() => alert("Error updating todo"))
        return;
    }
    axios.post(`${BASE_URL}/addtodo`, {
        title: todoTitle,
        status: "pending"
    }, {
        headers: { token }
    })
        .then((res) => {
            const todo = res.data.todo
            todosList.appendChild(createTodoElement(todo))
            input.value = ""
        })
        .catch(() => alert("Error adding todo"))

}

const fetchTodos = () => {
    const token = localStorage.getItem('token');

    axios.get(`${BASE_URL}/todo`, {
        headers: { token }
    })
        .then(res => {
            todosList.innerHTML = "";
            res.data.todos.map(todo => {
                todosList.appendChild(createTodoElement(todo))
            })
        })
        .catch(() => alert("Error fetching todos"));

}

const deleteTodo = (id, element) => {
    const token = localStorage.getItem('token');
    axios.delete(`${BASE_URL}/deletetodo/${id}`, {
        headers: { token }
    })
        .then(() => element.remove())
        .catch(() => alert("Error deleting todo"));
}

const updateTodo = (id, span) => {
    currentlyEditingId = id;
    input.value = span.textContent
    addBtn.textContent = "Update Todo";
}
addBtn.addEventListener('click', addTodo);
if (localStorage.getItem('token')) {
    showTodoSection();
    fetchTodos();
}
