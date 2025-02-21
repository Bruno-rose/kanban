import React, { useState } from "react";
import { styles } from "./styles";

interface NameInputModalProps {
  onSubmit: (name: string) => void;
}

const NameInputModal: React.FC<NameInputModalProps> = ({ onSubmit }) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <h2 className={styles.title}>Enter Your Name</h2>
        <form
          onSubmit={handleSubmit}
          className={styles.form}
          data-testid="name-form"
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className={styles.input}
            required
            data-testid="name-input"
            aria-label="Name"
          />
          <button type="submit" className={styles.button}>
            Start Using Kanban
          </button>
        </form>
      </div>
    </div>
  );
};

export default NameInputModal;
