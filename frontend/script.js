const input = document.getElementById('input-container')
const addBtn = document.getElementById('add')

function addTodo(){
    const todo = input.value
    axios.post('http://localhost:3000/addtodo',{
        

    })
}