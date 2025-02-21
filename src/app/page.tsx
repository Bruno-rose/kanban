"use client";

import { useState, useEffect } from "react";
import KanbanBoard from "@/components/KanbanBoard";
import { Task, User, TaskStatus } from "@/components/types";
import { ErrorBoundary } from "react-error-boundary";

// Sample data
const initialTasks: Task[] = [
  {
    id: "1",
    title: "Welcome to Kanban Board!",
    description: "This is your first task. Try dragging it to another column.",
    status: TaskStatus.TODO,
    createdAt: new Date(),
    updatedAt: new Date(),
    assignedUsers: ["1"],
  },
  {
    id: "2",
    title: "Learn the Basics",
    description:
      "You can edit tasks, assign users, and move them between columns.",
    status: TaskStatus.IN_PROGRESS,
    createdAt: new Date(),
    updatedAt: new Date(),
    assignedUsers: ["2"],
  },
  {
    id: "3",
    title: "Get Started",
    description: "Create your own tasks and organize your work!",
    status: TaskStatus.DONE,
    createdAt: new Date(),
    updatedAt: new Date(),
    assignedUsers: ["1", "2"],
  },
];

const users: User[] = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Jane Smith" },
];

export default function BoardPage() {
  const [isClient, setIsClient] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const currentUser = users[0];

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleTaskMove = (taskId: string, newStatus: TaskStatus) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const handleTaskEdit = (updatedTask: Task) => {
    setTasks(
      tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">Loading your Kanban Board...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome to Your Kanban Board
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Organize your tasks and boost productivity
          </p>
        </div>
      </header>
      <ErrorBoundary
        fallbackRender={({ error }) => (
          <div className="p-4">
            <h2 className="text-red-600">Something went wrong:</h2>
            <pre className="mt-2 text-sm">{error.message}</pre>
          </div>
        )}
      >
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <KanbanBoard
            tasks={tasks}
            users={users}
            currentUser={currentUser}
            onTaskMove={handleTaskMove}
            onTaskEdit={handleTaskEdit}
            onTaskDelete={handleTaskDelete}
          />
        </div>
      </ErrorBoundary>
    </div>
  );
}
