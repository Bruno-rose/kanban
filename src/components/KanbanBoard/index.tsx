import React from "react";

import {
  DndContext,
  DragEndEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import Column from "@/components/Column";
import UserList from "@/components/UserList";
import { Task, User, TaskStatus } from "@/components/types";

import { styles } from "./styles";

interface KanbanBoardProps {
  tasks: Task[];
  users: User[];
  currentUser: User;
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskAdd: (task: Task) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  users,
  currentUser,
  onTaskMove,
  onTaskEdit,
  onTaskDelete,
  onTaskAdd,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const newStatus = over.id as TaskStatus;
      onTaskMove(active.id as string, newStatus);
    }
  };

  const handleAddTask = (taskData: Partial<Task>) => {
    const newTask = {
      ...taskData,
      id: Date.now().toString(),
      status: TaskStatus.TODO,
      createdAt: new Date(),
      updatedAt: new Date(),
      assignedUsers: [currentUser.id],
    } as Task;
    onTaskAdd(newTask);
  };

  return (
    <div className={styles.container} data-testid="kanban-board">
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <UserList users={users} currentUser={currentUser} />
        </div>
      </header>

      <div className={styles.content}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className={styles.columnsContainer}>
            {Object.values(TaskStatus).map((status) => (
              <Column
                key={status}
                status={status}
                tasks={tasks.filter((task) => task.status === status)}
                users={users}
                onTaskEdit={onTaskEdit}
                onTaskDelete={onTaskDelete}
                onTaskAdd={handleAddTask}
              />
            ))}
          </div>
        </DndContext>
      </div>
    </div>
  );
};

export default KanbanBoard;
