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
  currentUser: User;
  onTaskEdit: (task: Task) => Promise<void>;
  onTaskDelete: (taskId: string) => Promise<void>;
  onTaskAdd: (task: Partial<Task>) => Promise<void>;
}

const Column: React.FC<ColumnProps> = ({
  status,
  tasks,
  currentUser,
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

      const taskWithStatus = { ...taskData, status };
      await onTaskAdd(taskWithStatus);

      setShowTaskForm(false);
    } catch (error) {
      console.error("Failed to add task:", error);
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

      <div
        ref={setNodeRef}
        data-testid={`column-${status}`}
        className={styles.content}
      >
        {tasks.length === 0 && !showTaskForm && (
          <div className={styles.emptyContent}>No tasks yet</div>
        )}

        {tasks.length > 0 &&
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              currentUser={currentUser}
              onEdit={onTaskEdit}
              onDelete={onTaskDelete}
            />
          ))}

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
