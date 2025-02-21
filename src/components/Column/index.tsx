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
  const { setNodeRef } = useDroppable({ id: status });

  const handleTaskAdd = (taskData: Partial<Task>) => {
    onTaskAdd({ ...taskData, status });
    setShowTaskForm(false);
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
        {tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            index={index}
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
          <TaskForm onSubmit={handleTaskAdd} onCancel={handleCancel} />
        )}
      </div>
    </div>
  );
};

export default Column;
