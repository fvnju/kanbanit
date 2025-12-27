import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Circle } from "lucide-react";
// Icons for task
import type { Task, Id, Column } from "../types";
import { useState } from "react";

interface Props {
  task: Task;
  deleteTask: (id: Id) => void;
  moveTask: (taskId: Id, targetColumnId: Id) => void;
  updateTask: (id: Id, content: string) => void;
  columns: Column[];
}

export default function TaskCard({
  task,
  deleteTask,
  moveTask,
  updateTask,
  columns,
}: Props) {
  const [mouseIsOver, setMouseIsOver] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
    setMouseIsOver(false);
  };

  if (isDragging) {
    return (
      <div ref={setNodeRef} style={style} className="task-card dragging" />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="task-card"
      onMouseEnter={() => setMouseIsOver(true)}
      onMouseLeave={() => setMouseIsOver(false)}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          width: "100%",
        }}
      >
        <div className="task-status-icon">
          <Circle
            size={16}
            strokeWidth={2.5}
            style={{ color: "var(--text-tertiary)" }}
          />
        </div>

        {editMode ? (
          <textarea
            className="task-edit-textarea"
            value={task.content}
            autoFocus
            placeholder="Task content"
            onBlur={toggleEditMode}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                toggleEditMode();
              }
            }}
            onChange={(e) => updateTask(task.id, e.target.value)}
          />
        ) : (
          <p className="task-content" onClick={toggleEditMode}>
            {task.content}
          </p>
        )}
      </div>

      {mouseIsOver && !editMode && (
        <div style={{ display: "flex", gap: "5px" }}>
          <div className="task-actions">
            {/* Mobile/Desktop Move Select */}
            <select
              className="move-select"
              value=""
              onChange={(e) => moveTask(task.id, e.target.value)}
              title="Move to column"
            >
              <option value="" disabled>
                ➤
              </option>
              {columns.map((col) => (
                <option
                  key={col.id}
                  value={col.id}
                  disabled={col.id === task.columnId}
                >
                  {col.title}
                </option>
              ))}
            </select>
          </div>
          <button onClick={() => deleteTask(task.id)} className="delete-btn">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
