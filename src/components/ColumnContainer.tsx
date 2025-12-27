import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo } from "react";
import type { Column, Id, Task } from "../types";
import { Plus } from "lucide-react";
import TaskCard from "./TaskCard";

interface Props {
  column: Column;
  deleteColumn: (id: Id) => void;
  updateColumn: (id: Id, title: string) => void;
  createTask: (columnId: Id) => void;
  deleteTask: (id: Id) => void;
  moveTask: (taskId: Id, targetColumnId: Id) => void;
  updateTask: (id: Id, content: string) => void;
  tasks: Task[];
  columns: Column[];
}

export default function ColumnContainer({
  column,
  createTask,
  tasks,
  deleteTask,
  moveTask,
  updateTask,
  columns,
}: Props) {
  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: true, // Disable dragging columns for simplicity for now, can enable later
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div ref={setNodeRef} style={style} className="column dragging"></div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="column">
      <div {...attributes} {...listeners} className="column-header">
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span className="column-title-text">{column.title}</span>
          <span className="column-count">{tasks.length}</span>
        </div>
      </div>

      <div className="column-content">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              moveTask={moveTask}
              updateTask={updateTask}
              columns={columns}
            />
          ))}
        </SortableContext>
      </div>
      <button className="add-task-btn" onClick={() => createTask(column.id)}>
        <Plus size={16} /> Create Issue
      </button>
    </div>
  );
}
