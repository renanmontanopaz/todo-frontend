"use client"

import { useState, useEffect, type FormEvent } from "react"
import { Rocket, Pencil, Trash2, Check, X } from "lucide-react"
import "./App.css"

interface Todo {
  id: number
  title: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

interface EditFormData {
  title: string
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState<string>("")
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "completed">("all")
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null)
  const [editFormData, setEditFormData] = useState<EditFormData>({ title: "" })

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async (): Promise<void> => {
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:8080/todos")
      if (!response.ok) {
        throw new Error("Falha ao buscar tarefas")
      }
      const data: Todo[] = await response.json()
      setTodos(data)
      setError(null)
    } catch (err) {
      setError(`Erro ao carregar tarefas: ${err instanceof Error ? err.message : "Erro desconhecido"}`)
      console.error("Erro ao buscar tarefas:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const addTodo = async (e: FormEvent): Promise<void> => {
    e.preventDefault()

    if (!newTaskTitle.trim()) return

    try {
      const response = await fetch("http://localhost:8080/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTaskTitle,
          completed: false,
        }),
      })

      if (!response.ok) {
        throw new Error("Falha ao adicionar tarefa")
      }

      const newTodo: Todo = await response.json()
      setTodos([...todos, newTodo])
      setNewTaskTitle("")
    } catch (err) {
      setError(`Erro ao adicionar tarefa: ${err instanceof Error ? err.message : "Erro desconhecido"}`)
      console.error("Erro ao adicionar tarefa:", err)
    }
  }

  const toggleTodoStatus = async (id: number, completed: boolean): Promise<void> => {
    try {
      const response = await fetch(`http://localhost:8080/todos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed }),
      })

      if (!response.ok) {
        throw new Error("Falha ao atualizar status da tarefa")
      }

      const updated: Todo = await response.json()
      setTodos(todos.map((todo) => (todo.id === id ? updated : todo)))
    } catch (err) {
      setError(`Erro ao atualizar status: ${err instanceof Error ? err.message : "Erro desconhecido"}`)
      console.error("Erro ao atualizar status:", err)
    }
  }

  const deleteTodo = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`http://localhost:8080/todos/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Falha ao excluir tarefa")
      }

      setTodos(todos.filter((todo) => todo.id !== id))
    } catch (err) {
      setError(`Erro ao excluir tarefa: ${err instanceof Error ? err.message : "Erro desconhecido"}`)
      console.error("Erro ao excluir tarefa:", err)
    }
  }

  const startEditing = (todo: Todo): void => {
    setEditingTodoId(todo.id)
    setEditFormData({
      title: todo.title,
    })
  }

  const cancelEditing = (): void => {
    setEditingTodoId(null)
    setEditFormData({ title: "" })
  }

  const updateTodo = async (id: number): Promise<void> => {
    if (!editFormData.title.trim()) return

    try {
      const response = await fetch(`http://localhost:8080/todos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editFormData.title,
        }),
      })

      if (!response.ok) {
        throw new Error("Falha ao atualizar tarefa")
      }

      const updated: Todo = await response.json()
      setTodos(todos.map((todo) => (todo.id === id ? updated : todo)))
      setEditingTodoId(null)
    } catch (err) {
      setError(`Erro ao atualizar tarefa: ${err instanceof Error ? err.message : "Erro desconhecido"}`)
      console.error("Erro ao atualizar tarefa:", err)
    }
  }

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEditFormData({
      ...editFormData,
      title: e.target.value,
    })
  }

  const filteredTodos = todos.filter((todo) => {
    if (activeFilter === "active") return !todo.completed
    if (activeFilter === "completed") return todo.completed
    return true
  })

  const completedCount = todos.filter((todo) => todo.completed).length
  const totalCount = todos.length

  return (
    <div className="app-container">
      <header>
        <div className="logo">
          <Rocket className="rocket-icon" size={24} />
          <h1>todo</h1>
        </div>
      </header>

      <main>
        <form className="new-task-form" onSubmit={addTodo}>
          <input
            type="text"
            placeholder="Adicione uma nova tarefa"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="title-input"
          />
          <button type="submit" className="create-button">
            Criar
            <span className="plus-icon">+</span>
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {isLoading ? (
          <div className="loading">Carregando tarefas...</div>
        ) : (
          <>
            <div className="task-info">
              <div className="created-tasks">
                Tarefas criadas <span className="counter">{totalCount}</span>
              </div>
              <div className="completed-tasks">
                Concluídas{" "}
                <span className="counter">
                  {completedCount} de {totalCount}
                </span>
              </div>
            </div>

            <div className="filter-tabs">
              <button className={activeFilter === "all" ? "active" : ""} onClick={() => setActiveFilter("all")}>
                Todas
              </button>
              <button className={activeFilter === "active" ? "active" : ""} onClick={() => setActiveFilter("active")}>
                Pendentes
              </button>
              <button
                className={activeFilter === "completed" ? "active" : ""}
                onClick={() => setActiveFilter("completed")}
              >
                Concluídas
              </button>
            </div>

            <ul className="todo-list">
              {filteredTodos.length === 0 ? (
                <li className="empty-list">Nenhuma tarefa encontrada.</li>
              ) : (
                filteredTodos.map((todo) => (
                  <li key={todo.id} className={`todo-item ${todo.completed ? "completed" : ""}`}>
                    {editingTodoId === todo.id ? (
                      <div className="edit-form">
                        <input
                          type="text"
                          value={editFormData.title}
                          onChange={handleEditFormChange}
                          className="edit-title-input"
                        />
                        <div className="edit-actions">
                          <button
                            className="save-btn"
                            onClick={() => updateTodo(todo.id)}
                            aria-label="Salvar alterações"
                          >
                            <Check size={18} />
                          </button>
                          <button className="cancel-btn" onClick={cancelEditing} aria-label="Cancelar edição">
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          className={`checkbox ${todo.completed ? "checked" : ""}`}
                          onClick={() => toggleTodoStatus(todo.id, !todo.completed)}
                          aria-label={todo.completed ? "Marcar como não concluída" : "Marcar como concluída"}
                        >
                          {todo.completed && <span className="check">✓</span>}
                        </button>
                        <div className="todo-content">
                          <p className="todo-title">{todo.title}</p>
                        </div>
                        <div className="todo-actions">
                          <button
                            className="edit-btn"
                            onClick={() => startEditing(todo)}
                            aria-label="Editar tarefa"
                            disabled={todo.completed}
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => deleteTodo(todo.id)}
                            aria-label="Excluir tarefa"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))
              )}
            </ul>
          </>
        )}
      </main>
    </div>
  )
}

export default App