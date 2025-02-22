import React, { useState, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { styles } from "./styles";
import { Task } from "@/components/types";
import TaskForm from "@/components/TaskForm";
import { useSocket } from "@/contexts/SocketContext";

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  index,
  onEdit,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { socket } = useSocket();
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
    });

  // Add useEffect to handle editing state
  useEffect(() => {
    if (!socket) return;

    if (isEditing) {
      socket.emit("startEditing", task.id);
    } else {
      socket.emit("stopEditing", task.id);
    }

    return () => {
      if (isEditing) {
        socket.emit("stopEditing", task.id);
      }
    };
  }, [isEditing, socket, task.id]);

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.3 : undefined,
      }
    : undefined;

  // Handle button clicks
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent drag from starting
    setIsEditing(true);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      setIsDeleting(true);
      await onDelete(task.id);
    } catch (error) {
      console.error("Failed to delete task:", error);
      alert("Failed to delete task. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        <TaskForm
          task={task}
          onSubmit={async (updatedTask) => {
            try {
              await onEdit({ ...task, ...updatedTask });
              setIsEditing(false);
            } catch (error) {
              console.error("Failed to edit task:", error);
              alert("Failed to edit task. Please try again.");
            }
          }}
          onCancel={() => setIsEditing(false)}
          className="mb-3"
        />
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className={styles.card}>
      {/* Draggable handle area */}
      <div {...listeners} {...attributes} className="cursor-move p-2">
        <h3 className={styles.title}>{task.title}</h3>
        {task.description && (
          <p className={styles.description}>{task.description}</p>
        )}
      </div>

      {/* Interactive buttons area - no drag listeners */}
      <div className={styles.buttonContainer}>
        <button
          onClick={handleEdit}
          className={styles.editButton}
          disabled={isDeleting}
        >
          Edit
        </button>

        <button
          onClick={handleDelete}
          className={styles.deleteButton}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
