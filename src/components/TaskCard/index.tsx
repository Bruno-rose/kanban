import React, { useState, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { styles } from "./styles";
import { Task, User } from "@/components/types";
import TaskForm from "@/components/TaskForm";
import { useSocket } from "@/contexts/SocketContext";
import clsx from "clsx";

interface TaskCardProps {
  task: Task;
  index: number;
  currentUser: User;
  onEdit: (task: Task) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  index,
  currentUser,
  onEdit,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { socket } = useSocket();

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      disabled: Boolean(task.currentEditor || isEditing),
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : undefined,
  };

  useEffect(() => {
    if (!socket) return;

    if (isDragging) {
      socket.emit("startDragging", task.id);
    } else {
      socket.emit("stopDragging", task.id);
    }

    return () => {
      if (isDragging) {
        socket.emit("stopDragging", task.id);
      }
    };
  }, [isDragging, socket, task.id]);

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

  // Only show dragger indicator if the current user is not the one dragging
  const showDraggerIndicator =
    task.currentDragger && task.currentDragger !== currentUser.name;

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
        showDraggerIndicator && "border-2 border-blue-400 bg-blue-50",
        task.currentEditor && "cursor-not-allowed opacity-75"
      )}
    >
      <div
        {...(task.currentEditor ? {} : { ...listeners, ...attributes })}
        className={clsx(
          "p-2",
          task.currentEditor ? "cursor-not-allowed" : "cursor-move"
        )}
      >
        <div className="flex items-center justify-between">
          <h3 className={styles.title}>{task.title}</h3>

          {(task.currentEditor || showDraggerIndicator) && (
            <span className="text-sm font-medium px-2 py-1 rounded">
              {task.currentEditor && (
                <span className="text-yellow-600 bg-yellow-100">
                  Editing by {task.currentEditor}
                </span>
              )}
              {showDraggerIndicator && (
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
          data-testid="edit-button"
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
          {isDeleting ? "..." : "Delete"}
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
