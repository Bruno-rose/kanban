import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { styles } from "./styles";
import { Task } from "@/components/types";

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  index,
  onEdit,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? {
        transform: CSS.Transform.toString(transform),
      }
    : undefined;

  const handleEdit = () => {
    setIsEditing(true);
    onEdit(task);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={styles.card}
    >
      <div className={styles.header}>
        <h3 className={styles.title}> {task.title} </h3>

        <div className={styles.buttonContainer}>
          <button onClick={() => handleEdit()} className={styles.editButton}>
            Edit
          </button>

          <button
            onClick={() => onDelete(task.id)}
            className={styles.deleteButton}
          >
            Delete
          </button>
        </div>
      </div>

      <p className={styles.description}> {task.description} </p>
    </div>
  );
};

export default TaskCard;
