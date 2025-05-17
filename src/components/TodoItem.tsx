"use client"

import { formatDistanceToNow } from "date-fns/formatDistanceToNow"
import { ptBR } from "date-fns/locale"

interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  createdAt?: Date | string
}

interface TodoItemProps {
  todo: Todo
  toggleComplete: (id: string, completed: boolean) => void
  deleteTodo: (id: string) => void
  startEditing: (todo: Todo) => void
}

function TodoItem({ todo, toggleComplete, deleteTodo, startEditing }: TodoItemProps) {
  const formattedDate = todo.createdAt
    ? formatDistanceToNow(new Date(todo.createdAt), { 
        addSuffix: true, 
        locale: ptBR 
      })
    : ""

  return (
    <li className={`todo-item ${todo.completed ? "completed" : ""}`}>
      <div className="todo-content">
        <label className="checkbox-container">
          <input 
            type="checkbox" 
            checked={todo.completed} 
            onChange={() => toggleComplete(todo.id, !todo.completed)} 
            aria-label={todo.completed ? "Marcar como pendente" : "Marcar como concluída"}
          />
          <span className="checkmark"></span>
        </label>

        <div className="todo-text">
          <h3>{todo.title}</h3>
          {todo.description && <p>{todo.description}</p>}
          {formattedDate && <small className="todo-date">{formattedDate}</small>}
        </div>
      </div>

      <div className="todo-actions">
        <button 
          className="edit-btn" 
          onClick={() => startEditing(todo)} 
          aria-label="Editar tarefa"
        >
          ✏️
        </button>
        <button 
          className="delete-btn" 
          onClick={() => deleteTodo(todo.id)} 
          aria-label="Excluir tarefa"
        >
          🗑️
        </button>
      </div>
    </li>
  )
}

export default TodoItem