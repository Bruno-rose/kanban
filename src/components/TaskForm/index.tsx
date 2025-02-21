import React, { useState } from "react";
import { styles } from "./styles";
import clsx from "clsx";
import { Task, TaskStatus } from "@/components/types";

interface TaskFormProps {
  task?: Task;
  onSubmit: (task: Partial<Task>) => void;
  onCancel: () => void;
  className?: string;
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  className,
}) => {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...task,
      title: title.trim(),
      description: description.trim(),
      status: task?.status || TaskStatus.TODO,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={clsx(styles.form, className)}
      data-testid="task-form"
    >
      <div>
        <label htmlFor="title" className={styles.label}>
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.input}
          placeholder="Enter task title"
          required
        />
      </div>
      <div className="mt-4">
        <label htmlFor="description" className={styles.label}>
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.textarea}
          placeholder="Enter task description"
        />
      </div>
      <div className={styles.buttonContainer}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.cancelButton}
        >
          Cancel
        </button>
        <button type="submit" className={styles.submitButton}>
          {task ? "Save" : "Create"} Task
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
