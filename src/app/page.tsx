"use client";

import { useState, useEffect } from "react";
import KanbanBoard from "@/components/KanbanBoard";
import { Task, User, TaskStatus } from "@/components/types";
import { ErrorBoundary } from "react-error-boundary";
import NameInputModal from "@/components/NameInputModal";
import { SocketProvider, useSocket } from "@/contexts/SocketContext";

function Board() {
  const { socket } = useSocket();
  const [isClient, setIsClient] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showNameModal, setShowNameModal] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("initialState", (tasks, users) => {
      setTasks(tasks);
      setUsers(users);
    });

    socket.on("userJoined", (user) => {
      setUsers((prev) => [...prev, user]);
    });

    socket.on("userLeft", (userId) => {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    });

    socket.on("taskUpdated", (task) => {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    });

    socket.on("taskDeleted", (taskId) => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    });

    socket.on("taskAdded", (task) => {
      setTasks((prev) => [...prev, task]);
    });

    socket.on("taskEditingStarted", (taskId, userName) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, currentEditor: userName } : task
        )
      );
    });

    socket.on("taskEditingStopped", (taskId) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, currentEditor: undefined } : task
        )
      );
    });

    socket.on("deleteTaskError", (taskId, errorMessage) => {
      alert(errorMessage);
    });

    socket.on("taskDragStarted", (taskId, userName) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, currentDragger: userName } : task
        )
      );
    });

    socket.on("taskDragEnded", (taskId) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, currentDragger: undefined } : task
        )
      );
    });

    return () => {
      socket.off("initialState");
      socket.off("userJoined");
      socket.off("userLeft");
      socket.off("taskUpdated");
      socket.off("taskDeleted");
      socket.off("taskAdded");
      socket.off("taskEditingStarted");
      socket.off("taskEditingStopped");
      socket.off("deleteTaskError");
      socket.off("taskDragStarted");
      socket.off("taskDragEnded");
    };
  }, [socket]);

  const handleNameSubmit = (name: string) => {
    if (!socket || !socket.id) return;

    const newUser: User = {
      id: socket.id,
      name: name,
    };
    setCurrentUser(newUser);
    socket.emit("joinBoard", newUser);
    setShowNameModal(false);
  };

  const handleTaskMove = (taskId: string, newStatus: TaskStatus) => {
    if (!socket || !currentUser) return;

    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      const updatedTask = { ...task, status: newStatus };
      socket.emit("updateTask", updatedTask);
    }
  };

  const handleTaskEdit = (updatedTask: Task) => {
    if (!socket) return;
    socket.emit("updateTask", updatedTask);
  };

  const handleTaskDelete = (taskId: string) => {
    if (!socket) return;
    socket.emit("deleteTask", taskId);
  };

  const handleTaskAdd = (newTask: Task) => {
    if (!socket) return;
    socket.emit("addTask", newTask);
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

export default function BoardPage() {
  return (
    <SocketProvider>
      <Board />
    </SocketProvider>
  );
}
