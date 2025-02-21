"use client";

import { useState, useEffect } from "react";
import KanbanBoard from "@/components/KanbanBoard";
import { Task, User, TaskStatus } from "@/components/types";
import { ErrorBoundary } from "react-error-boundary";
import NameInputModal from "@/components/NameInputModal";

export default function BoardPage() {
  const [isClient, setIsClient] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showNameModal, setShowNameModal] = useState(true);

  useEffect(() => {
    setIsClient(true);
    // Load existing users and tasks from localStorage
    const storedUsers = localStorage.getItem("users");
    const storedTasks = localStorage.getItem("tasks");

    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }

    // Check for current user
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      setShowNameModal(false);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem("users", JSON.stringify(users));
    }
  }, [users]);

  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  const handleNameSubmit = (name: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      name: name,
    };
    setCurrentUser(newUser);
    setUsers((prevUsers) => [...prevUsers, newUser]);
    setShowNameModal(false);
    localStorage.setItem("currentUser", JSON.stringify(newUser));
  };

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

  const handleTaskAdd = (newTask: Task) => {
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  if (!isClient) {
    return null;
  }

  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      {showNameModal ? (
        <NameInputModal onSubmit={handleNameSubmit} />
      ) : (
        currentUser && (
          <KanbanBoard
            tasks={tasks}
            users={users}
            currentUser={currentUser}
            onTaskMove={handleTaskMove}
            onTaskEdit={handleTaskEdit}
            onTaskDelete={handleTaskDelete}
            onTaskAdd={handleTaskAdd}
          />
        )
      )}
    </ErrorBoundary>
  );
}
