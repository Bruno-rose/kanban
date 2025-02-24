import React from "react";
import { styles } from "./styles";

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
        <div className={styles.buttonContainer}>
          <button
            onClick={onCancel}
            className={styles.cancelButton}
            data-testid="cancel-delete-button"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={styles.confirmButton}
            data-testid="confirm-delete-button"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
