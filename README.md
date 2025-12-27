# KanbanIt

A premium, Linear-inspired Kanban board built with React and Vite.

## Features

### 📱 fully Responsive Mobile Experience

- **Tabbed Interface**: On mobile, the board switches to a tabbed view to show one column at a time, preventing horizontal scroll fatigue.
- **Touch Optimized**:
  - **Press & Hold** to drag tasks.
  - **Move Menu**: Quickly move tasks between columns using the "Move" (➤) action menu on every card.

### ✨ Core Interactions

- **Drag and Drop**: Powered by `@dnd-kit` for smooth reordering of tasks and columns.
- **Inline Editing**: Double-click or click any task text to rename it instantly.
- **Task Management**: Create, delete, move, and edit tasks seamlessly.

## Tech Stack

- **Framework**: React + Vite
- **Language**: TypeScript
- **Styling**: CSS Modules / Vanilla CSS (with variables)
- **DnD**: `@dnd-kit/core`
- **Icons**: `lucide-react`

## Getting Started

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Run dev server**

   ```bash
   pnpm dev
   ```

3. **Build for production**
   ```bash
   pnpm build
   ```
