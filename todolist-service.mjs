import fs from 'fs';
import url from 'url';
export class TodoListService{
    todoFile = './todolist.json';    
    constructor(){
        this.loadTodoList();
    }
    loadTodoList(){
        try{
            const todoData = fs.readFileSync(this.todoFile, 'utf-8');
            this.todoList = JSON.parse(todoData);
        }
        catch(error){
            console.error('failed to load todolist');
            this.todoList=[];
        }
    }
    saveTodoList(){
        try{
            const todoData = JSON.stringify(this.todoList);
            fs.writeFileSync(this.todoFile, todoData, 'utf-8');
        }
        catch(error){
            console.error('Failed to save todo list:', error);
        }
    }

    findLatestId() {
        const ids = this.todoList.map(todo => todo.id);
        return Math.max(...ids);
    }
    //GET TODO LIST
    getJsonTodoList(){
        return JSON.stringify({
            code: 200,
            status: 'OK',
            data: this.todoList.map((todo) => {
                return{
                    id: todo.id,
                    todo: todo.title,
                    completed: todo.completed,
                }
            })
        })
    }
    getTodoList(request, response){
        response.write(this.getJsonTodoList());
        response.end();
    }

    //CREATE TODO
    createTodo(request, response){
        request.addListener('data', (data) => {
            const body = JSON.parse(data.toString());
            const newId = this.findLatestId() + 1;
            const newTodo={
                id: newId,
                title: body.todo,
                completed: false,
            }
            this.todoList.push(newTodo);

            this.saveTodoList();
            response.write(this.getJsonTodoList());
            response.end();
        })
    }

    //UPDATE TODO
    updateTodo(request, response){
        request.addListener('data', (data) => {
            const body = JSON.parse(data.toString());
            const index = this.todoList.findIndex(todo => todo.id === body.id);
            this.todoList[index].title = body.newTodo;

            this.saveTodoList();
            response.write(this.getJsonTodoList());
            response.end();
        })
    }

    //DELETE TODO
    deleteTodo(request, response){
        request.addListener('data', (data) => {
            const body = JSON.parse(data.toString());
            const index = this.todoList.findIndex(todo => todo.id === body.id);
            this.todoList.splice(index, 1);

            this.saveTodoList();
            response.write(this.getJsonTodoList());
            response.end();
        })
    }

    //COMPLETE TODO
    completeTodo(request, response) {
        const parsedUrl = url.parse(request.url, true);
        const todoId = parsedUrl.query.id;

        const index = this.todoList.findIndex(todo => todo.id === parseInt(todoId));

        if (index !== -1) {
            this.todoList[index].completed = !this.todoList[index].completed;
            this.saveTodoList();
            response.write(this.getJsonTodoList());
        } else {
            response.write(JSON.stringify({
                code: 404,
                status: 'error',
                message: `Todo with ID ${todoId} not found`
            }));
        }
        
        response.end();
    }
}