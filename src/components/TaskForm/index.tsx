import React, { useState } from "react";
import { styles } from "./styles";
import clsx from "clsx";
import { Task, TaskStatus } from "@/components/types";

interface TaskFormProps {
  task?: Task;
  onSubmit: (task: Partial<Task>) => void;
  onCancel: () => void;
  className?: string;
  isSubmitting?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  className,
  isSubmitting = false,
}) => {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      return;
    }

    onSubmit({
      ...task,
      title: trimmedTitle,
      description: trimmedDescription,
      status: task?.status || TaskStatus.TODO,
    });

    setHasUnsavedChanges(false);
  };

  const handleCancel = () => {
    if (
      !hasUnsavedChanges ||
      confirm("Are you sure you want to discard your changes?")
    ) {
      onCancel();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={clsx(styles.form, className)}
      data-testid="task-form"
    >
      <div>
        <label htmlFor="title" className={styles.label}>
          Title {task ? "(Editing)" : ""}
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={handleTitleChange}
          className={styles.input}
          placeholder="Enter task title"
          required
          disabled={isSubmitting}
        />
      </div>
      <div className="mt-4">
        <label htmlFor="description" className={styles.label}>
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={handleDescriptionChange}
          className={styles.textarea}
          placeholder="Enter task description"
          disabled={isSubmitting}
        />
      </div>
      <div className={styles.buttonContainer}>
        <button
          type="button"
          onClick={handleCancel}
          className={styles.cancelButton}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={clsx(
            styles.submitButton,
            isSubmitting && "opacity-50 cursor-not-allowed"
          )}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : task ? "Save Task" : "Create Task"}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
