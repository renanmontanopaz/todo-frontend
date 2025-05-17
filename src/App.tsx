"use client"

import { useState, useEffect, type FormEvent } from "react"
import { Rocket, Pencil, Trash2, Check, X } from "lucide-react"
import "./App.css"

// Definindo a interface para o modelo Todo
interface Todo {
  id: number
  title: string
  description?: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

// Interface para o formulário de edição
interface EditFormData {
  title: string
  description: string
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState<string>("")
  const [newTaskDescription, setNewTaskDescription] = useState<string>("")
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "completed">("all")
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null)
  const [editFormData, setEditFormData] = useState<EditFormData>({ title: "", description: "" })

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
          description: newTaskDescription.trim() || undefined,
          completed: false,
        }),
      })

      if (!response.ok) {
        throw new Error("Falha ao adicionar tarefa")
      }

      const newTodo: Todo = await response.json()
      setTodos([...todos, newTodo])
      setNewTaskTitle("")
      setNewTaskDescription("")
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
      description: todo.description || "",
    })
  }

  const cancelEditing = (): void => {
    setEditingTodoId(null)
    setEditFormData({ title: "", description: "" })
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
          description: editFormData.description.trim() || undefined,
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

  const handleEditFormChange = (field: keyof EditFormData, value: string): void => {
    setEditFormData({
      ...editFormData,
      [field]: value,
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
          <div className="form-fields">
            <input
              type="text"
              placeholder="Adicione uma nova tarefa"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="title-input"
            />
            <textarea
              placeholder="Descrição (opcional)"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              className="description-input"
              rows={3}
            />
          </div>
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
                        <div className="edit-fields">
                          <input
                            type="text"
                            value={editFormData.title}
                            onChange={(e) => handleEditFormChange("title", e.target.value)}
                            className="edit-title-input"
                          />
                          <textarea
                            value={editFormData.description}
                            onChange={(e) => handleEditFormChange("description", e.target.value)}
                            className="edit-description-input"
                            rows={2}
                          />
                        </div>
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
                          {todo.description && <p className="todo-description">{todo.description}</p>}
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
