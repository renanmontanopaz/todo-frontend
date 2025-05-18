import TodoItem from "./TodoItem"

interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  createdAt?: Date | string
}

interface TodoListProps {
  todos: Todo[]
  toggleComplete: (id: string, completed: boolean) => void
  deleteTodo: (id: string) => void
  startEditing: (todo: Todo) => void
}

function TodoList({ todos, toggleComplete, deleteTodo, startEditing }: TodoListProps) {
  if (todos.length === 0) {
    return <p className="empty-list">Nenhuma tarefa encontrada.</p>
  }

  return (
    <ul className="todo-list">
      {todos.map((todo: Todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          toggleComplete={toggleComplete}
          deleteTodo={deleteTodo}
          startEditing={startEditing}
        />
      ))}
    </ul>
  )
}

export default TodoList