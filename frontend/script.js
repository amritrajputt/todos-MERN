const input = document.getElementById('input-container');
const addBtn = document.getElementById('add');
const todosList = document.getElementById('todos-list');

function addTodo() {
    const todoTitle = input.value;
    const token = localStorage.getItem('token'); 

    if (!todoTitle) {
        alert("Please enter a todo");
        return;
        
    }

    axios.post('http://localhost:3000/addtodo', {
        title: todoTitle,
        status: "pending"
    }, {
        headers: {
            token: token
        }
    })
    .then(response => {
        alert(response.data.message);
        input.value = ""; 
        
        // Create todo item div
        const div = document.createElement('div');
        div.className = "todo-item";

        // Add title
        const span = document.createElement('span');
        span.textContent = todoTitle;
        div.appendChild(span);

        // Add Delete button
        const del = document.createElement('button');
        del.textContent = "del";
        del.className = "delete-btn";
        div.appendChild(del);

        // Add Update button
        const update = document.createElement('button');
        update.textContent = "update";
        update.className = "update-btn";
        div.appendChild(update);

        // Append to the container
        todosList.appendChild(div);
    })
    .catch(error => {
        alert(error.response?.data?.message || "Error adding todo");
    });
}

addBtn.addEventListener('click', addTodo);
