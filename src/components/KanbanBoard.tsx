import { useState, useEffect } from "react";
import { getData, setData } from "../lib/db";

import type { Column, Id, Task } from "../types";
import ColumnContainer from "./ColumnContainer";
import {
  DndContext,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>([
    { id: "todo", title: "To Do" },
    { id: "doing", title: "In Progress" },
    { id: "done", title: "Done" },
    { id: "canceled", title: "Canceled" },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", columnId: "todo", content: "Research Linear design system" },
    { id: "2", columnId: "todo", content: "Setup React project" },
    { id: "3", columnId: "doing", content: "Implement Drag and Drop" },
    { id: "4", columnId: "done", content: "Initialize Repo" },
  ]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadData() {
      const savedColumns = await getData("columns");
      const savedTasks = await getData("tasks");
      if (savedColumns) setColumns(savedColumns);
      if (savedTasks) setTasks(savedTasks);
      setIsLoaded(true);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    setData("columns", columns);
  }, [columns, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    setData("tasks", tasks);
  }, [tasks, isLoaded]);

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const [activeMobileTab, setActiveMobileTab] = useState<Id>("todo");

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  if (!isLoaded) return <div>Loading board...</div>;

  return (
    <div className="board-container">
      {/* Mobile Tabs */}
      <div className="mobile-tabs">
        {columns.map((col) => (
          <button
            key={col.id}
            onClick={() => setActiveMobileTab(col.id)}
            className={`mobile-tab-btn ${
              activeMobileTab === col.id ? "active" : ""
            }`}
          >
            {col.title}
          </button>
        ))}
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="board-content">
          <SortableContext items={columns.map((col) => col.id)}>
            {columns.map((col) => (
              <div
                key={col.id}
                className={`column-wrapper ${
                  activeMobileTab === col.id
                    ? "mobile-visible"
                    : "mobile-hidden"
                }`}
              >
                <ColumnContainer
                  column={col}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  moveTask={moveTask}
                  updateTask={updateTask}
                  columns={columns}
                  tasks={tasks.filter((task) => task.columnId === col.id)}
                />
              </div>
            ))}
          </SortableContext>
        </div>

        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                createTask={createTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
                moveTask={moveTask}
                columns={columns}
                tasks={tasks.filter(
                  (task) => task.columnId === activeColumn.id
                )}
              />
            )}
            {activeTask && (
              <TaskCard
                task={activeTask}
                deleteTask={deleteTask}
                moveTask={moveTask}
                updateTask={updateTask}
                columns={columns}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );

  function createTask(columnId: Id) {
    const newTask: Task = {
      id: generateId(),
      columnId,
      content: `New Task ${tasks.length + 1}`,
    };

    setTasks([...tasks, newTask]);
  }

  function deleteTask(id: Id) {
    const newTasks = tasks.filter((task) => task.id !== id);
    setTasks(newTasks);
  }

  function updateColumn(id: Id, title: string) {
    const newColumns = columns.map((col) => {
      if (col.id !== id) return col;
      return { ...col, title };
    });

    setColumns(newColumns);
  }

  function deleteColumn(id: Id) {
    const newColumns = columns.filter((col) => col.id !== id);
    setColumns(newColumns);
  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveColumn = active.data.current?.type === "Column";
    if (!isActiveColumn) return;

    // Moving Columns
    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex((col) => col.id === activeId);
      const overColumnIndex = columns.findIndex((col) => col.id === overId);

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";

    if (!isActiveTask) return;

    // Im dropping a Task over another Task
    if (isActiveTask && isOverTask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
          tasks[activeIndex].columnId = tasks[overIndex].columnId;
          return arrayMove(tasks, activeIndex, overIndex - 1);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverColumn = over.data.current?.type === "Column";

    // Im dropping a Task over a column
    if (isActiveTask && isOverColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);

        tasks[activeIndex].columnId = overId;
        // console.log("DROPPING TASK OVER COLUMN", { activeIndex });
        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  }

  function moveTask(taskId: Id, targetColumnId: Id) {
    setTasks((tasks) => {
      return tasks.map((t) => {
        if (t.id === taskId) {
          return { ...t, columnId: targetColumnId };
        }
        return t;
      });
    });
  }

  function updateTask(id: Id, content: string) {
    setTasks((tasks) =>
      tasks.map((task) => {
        if (task.id !== id) return task;
        return { ...task, content };
      })
    );
  }
}

function generateId() {
  return Math.floor(Math.random() * 10001);
}
