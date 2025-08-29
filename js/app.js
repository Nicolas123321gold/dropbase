class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.nextId = this.todos.length > 0 ? Math.max(...this.todos.map(t => t.id)) + 1 : 1;
        
        this.initializeElements();
        this.bindEvents();
        this.render();
    }

    initializeElements() {
        this.todoForm = document.getElementById('todo-form');
        this.todoInput = document.getElementById('todo-input');
        this.todoList = document.getElementById('todo-list');
        this.emptyState = document.getElementById('empty-state');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.totalCount = document.getElementById('total-count');
        this.completedCount = document.getElementById('completed-count');
        this.activeCount = document.getElementById('active-count');
    }

    bindEvents() {
        this.todoForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e));
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        const text = this.todoInput.value.trim();
        
        if (text) {
            this.addTodo(text);
            this.todoInput.value = '';
        }
    }

    handleFilter(e) {
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.render();
    }

    addTodo(text) {
        const todo = {
            id: this.nextId++,
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.todos.unshift(todo);
        this.saveTodos();
        this.render();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.render();
    }

    editTodo(id, newText) {
        const todo = this.todos.find(t => t.id === id);
        if (todo && newText.trim()) {
            todo.text = newText.trim();
            this.saveTodos();
            this.render();
        }
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const active = total - completed;

        this.totalCount.textContent = total;
        this.completedCount.textContent = completed;
        this.activeCount.textContent = active;
    }

    createTodoElement(todo) {
        const todoEl = document.createElement('div');
        todoEl.className = `todo-item bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 animate-slide-up ${todo.completed ? 'opacity-75' : ''}`;
        todoEl.dataset.id = todo.id;

        todoEl.innerHTML = `
            <div class="flex items-center gap-4">
                <button class="toggle-btn flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                    todo.completed 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-gray-300 hover:border-indigo-400'
                }">
                    ${todo.completed ? 
                        '<svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>' 
                        : ''
                    }
                </button>
                
                <div class="flex-1 min-w-0">
                    <div class="todo-text ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'} font-medium break-words">
                        ${this.escapeHtml(todo.text)}
                    </div>
                    <input type="text" class="edit-input hidden w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-indigo-500" value="${this.escapeHtml(todo.text)}">
                </div>
                
                <div class="flex items-center gap-2">
                    <button class="edit-btn p-2 text-gray-400 hover:text-indigo-600 transition-colors duration-200 rounded-lg hover:bg-indigo-50">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button class="delete-btn p-2 text-gray-400 hover:text-red-600 transition-colors duration-200 rounded-lg hover:bg-red-50">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        this.bindTodoEvents(todoEl, todo);
        return todoEl;
    }

    bindTodoEvents(todoEl, todo) {
        const toggleBtn = todoEl.querySelector('.toggle-btn');
        const deleteBtn = todoEl.querySelector('.delete-btn');
        const editBtn = todoEl.querySelector('.edit-btn');
        const todoText = todoEl.querySelector('.todo-text');
        const editInput = todoEl.querySelector('.edit-input');

        toggleBtn.addEventListener('click', () => this.toggleTodo(todo.id));
        deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));
        
        editBtn.addEventListener('click', () => {
            todoText.classList.add('hidden');
            editInput.classList.remove('hidden');
            editInput.focus();
            editInput.select();
        });

        editInput.addEventListener('blur', () => this.finishEdit(todo.id, editInput, todoText));
        editInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.finishEdit(todo.id, editInput, todoText);
            } else if (e.key === 'Escape') {
                editInput.value = todo.text;
                this.cancelEdit(editInput, todoText);
            }
        });
    }

    finishEdit(id, editInput, todoText) {
        const newText = editInput.value.trim();
        if (newText && newText !== todoText.textContent) {
            this.editTodo(id, newText);
        } else {
            this.cancelEdit(editInput, todoText);
        }
    }

    cancelEdit(editInput, todoText) {
        editInput.classList.add('hidden');
        todoText.classList.remove('hidden');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    render() {
        const filteredTodos = this.getFilteredTodos();
        
        // Clear current todos
        this.todoList.innerHTML = '';
        
        if (filteredTodos.length === 0) {
            this.emptyState.classList.remove('hidden');
        } else {
            this.emptyState.classList.add('hidden');
            
            filteredTodos.forEach((todo, index) => {
                const todoEl = this.createTodoElement(todo);
                todoEl.style.animationDelay = `${index * 0.1}s`;
                this.todoList.appendChild(todoEl);
            });
        }

        this.updateStats();
        this.updateFilterButtons();
    }

    updateFilterButtons() {
        this.filterBtns.forEach(btn => {
            if (btn.dataset.filter === this.currentFilter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});