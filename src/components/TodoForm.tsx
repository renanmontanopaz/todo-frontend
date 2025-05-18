"use client"

import { useState, useEffect } from "react"

interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  createdAt?: Date | string
}

interface TodoFormProps {
  addTodo: (todo: Omit<Todo, 'id'>) => void
  editingTodo: Todo | null
  updateTodo: (id: string, updates: Partial<Todo>) => void
  cancelEditing: () => void
}

function TodoForm({ addTodo, editingTodo, updateTodo, cancelEditing }: TodoFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title)
      setDescription(editingTodo.description || "")
    } else {
      setTitle("")
      setDescription("")
    }
  }, [editingTodo])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) return

    if (editingTodo) {
      updateTodo(editingTodo.id, {
        title,
        description: description || undefined,
      })
    } else {
      addTodo({
        title,
        description: description || undefined,
        completed: false,
      })
    }

    setTitle("")
    setDescription("")
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <h2>{editingTodo ? "Editar Tarefa" : "Adicionar Tarefa"}</h2>

      <div className="form-group">
        <label htmlFor="title">Título*</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="O que precisa ser feito?"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Descrição (opcional)</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detalhes adicionais..."
          rows={3}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="submit-btn">
          {editingTodo ? "Atualizar" : "Adicionar"}
        </button>

        {editingTodo && (
          <button type="button" className="cancel-btn" onClick={cancelEditing}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

export default TodoForm