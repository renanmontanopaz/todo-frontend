"use client"

type FilterType = "all" | "active" | "completed"

interface TodoFilterProps {
  filter: FilterType
  setFilter: (filter: FilterType) => void
}

function TodoFilter({ filter, setFilter }: TodoFilterProps) {
  return (
    <div className="todo-filter">
      <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
        Todas
      </button>
      <button className={filter === "active" ? "active" : ""} onClick={() => setFilter("active")}>
        Pendentes
      </button>
      <button className={filter === "completed" ? "active" : ""} onClick={() => setFilter("completed")}>
        Concluídas
      </button>
    </div>
  )
}

export default TodoFilter