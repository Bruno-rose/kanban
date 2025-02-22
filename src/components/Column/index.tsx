import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import TaskCard from "@/components/TaskCard";
import TaskForm from "@/components/TaskForm";
import { Task, User, TaskStatus } from "@/components/types";
import { styles } from "./styles";

interface ColumnProps {
  status: TaskStatus;
  tasks: Task[];
  users: User[];
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskAdd: (task: Partial<Task>) => void;
}

const Column: React.FC<ColumnProps> = ({
  status,
  tasks,
  onTaskEdit,
  onTaskDelete,
  onTaskAdd,
}) => {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setNodeRef } = useDroppable({ id: status });

  const handleTaskAdd = async (taskData: Partial<Task>) => {
    try {
      setIsSubmitting(true);
      await onTaskAdd({ ...taskData, status });
      setShowTaskForm(false);
    } catch (error) {
      console.error("Failed to add task:", error);
      alert("Failed to add task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowTaskForm(false);
  };

  const mapStatusToTitle: Record<TaskStatus, string> = {
    [TaskStatus.TODO]: "To Do",
    [TaskStatus.IN_PROGRESS]: "In Progress",
    [TaskStatus.DONE]: "Done",
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{mapStatusToTitle[status]}</h2>

      <div ref={setNodeRef} className={styles.content}>
        {tasks.length > 0 ? (
          tasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              onEdit={onTaskEdit}
              onDelete={onTaskDelete}
            />
          ))
        ) : (
          <div className={styles.emptyContent}>No tasks yet</div>
        )}

        {!showTaskForm && (
          <button
            onClick={() => setShowTaskForm(true)}
            className={styles.addButton}
          >
            Add Task
          </button>
        )}

        {showTaskForm && (
          <TaskForm
            onSubmit={handleTaskAdd}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};

export default Column;
