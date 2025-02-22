import React, { useState, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { styles } from "./styles";
import { Task } from "@/components/types";
import TaskForm from "@/components/TaskForm";
import { useSocket } from "@/contexts/SocketContext";
import clsx from "clsx";

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
  const [showDragger, setShowDragger] = useState(false);
  const { socket } = useSocket();
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      disabled: Boolean(task.currentEditor),
    });

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

  useEffect(() => {
    if (task.currentDragger) {
      setShowDragger(true);
      const timer = setTimeout(() => {
        setShowDragger(false);
      }, 1700);
      return () => clearTimeout(timer);
    }
  }, [task.currentDragger]);

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.3 : undefined,
      }
    : undefined;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (task.currentEditor) {
      alert(
        `Cannot edit task - currently being edited by ${task.currentEditor}`
      );
      return;
    }

    setIsEditing(true);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (task.currentEditor) {
      alert(
        `Cannot delete task - currently being edited by ${task.currentEditor}`
      );
      return;
    }

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
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        styles.card,
        task.currentEditor && "border-2 border-yellow-400 bg-yellow-50",
        task.currentDragger && "border-2 border-blue-400 bg-blue-50"
      )}
    >
      <div {...listeners} {...attributes} className="cursor-move p-2">
        <div className="flex items-center justify-between">
          <h3 className={styles.title}>{task.title}</h3>
          {(task.currentEditor || (task.currentDragger && showDragger)) && (
            <span className="text-sm font-medium px-2 py-1 rounded">
              {task.currentEditor && (
                <span className="text-yellow-600 bg-yellow-100">
                  Editing by {task.currentEditor}
                </span>
              )}
              {task.currentDragger && showDragger && (
                <span className="text-blue-600 bg-blue-100">
                  Moving by {task.currentDragger}
                </span>
              )}
            </span>
          )}
        </div>
        {task.description && (
          <p className={styles.description}>{task.description}</p>
        )}
      </div>

      <div className={styles.buttonContainer}>
        <button
          onClick={handleEdit}
          className={clsx(
            styles.editButton,
            task.currentEditor && "opacity-50 cursor-not-allowed"
          )}
          disabled={isDeleting || Boolean(task.currentEditor)}
        >
          Edit
        </button>

        <button
          onClick={handleDelete}
          className={clsx(
            styles.deleteButton,
            task.currentEditor && "opacity-50 cursor-not-allowed"
          )}
          disabled={isDeleting || Boolean(task.currentEditor)}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
