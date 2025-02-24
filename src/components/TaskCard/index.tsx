import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { styles } from "./styles";
import { Task, User } from "@/components/types";
import TaskForm from "@/components/TaskForm";
import { useSocket } from "@/contexts/SocketContext";
import ConfirmationModal from "@/components/ConfirmationModal";

interface TaskCardProps {
  task: Task;
  currentUser: User;
  onEdit: (task: Task) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  currentUser,
  onEdit,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (task.currentEditor) {
      alert(
        `Cannot delete task - currently being edited by ${task.currentEditor}`
      );
      return;
    }

    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(task.id);
    } catch (error) {
      console.error("Failed to delete task:", error);
      alert("Failed to delete task. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  const showDraggerIndicator =
    task.currentDragger !== currentUser.name && task.currentDragger;

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
      data-testid={`task-${task.id}`}
      draggable="true"
      style={style}
      className={clsx(
        styles.card,
        task.currentEditor && styles.cardEditing,
        showDraggerIndicator && styles.cardDragging,
        task.currentEditor && styles.cardDisabled
      )}
    >
      <div
        {...(task.currentEditor ? {} : { ...listeners, ...attributes })}
        className={clsx(
          styles.dragArea,
          task.currentEditor ? styles.dragAreaDisabled : styles.dragAreaEnabled
        )}
      >
        <div className="flex items-center justify-between">
          <h3 className={styles.title}>{task.title}</h3>

          {(task.currentEditor || showDraggerIndicator) && (
            <span className={styles.statusBadge}>
              {task.currentEditor && (
                <span className={styles.editingBadge}>
                  Editing by {task.currentEditor}
                </span>
              )}
              {showDraggerIndicator && (
                <span className={styles.draggingBadge}>
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
            task.currentEditor && styles.buttonDisabled
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
            task.currentEditor && styles.buttonDisabled
          )}
          disabled={isDeleting || Boolean(task.currentEditor)}
        >
          {isDeleting ? "..." : "Delete"}
        </button>
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirmation(false)}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
      />
    </div>
  );
};

export default TaskCard;
