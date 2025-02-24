import React from "react";

import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
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
import { useSocket } from "@/contexts/SocketContext";

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
  const { socket } = useSocket();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string;
    const task = tasks.find((t) => t.id === taskId);

    if (task?.currentEditor) {
      alert(
        `Cannot move task - currently being edited by ${task.currentEditor}`
      );
      return;
    }

    socket?.emit("startDragging", taskId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const taskId = active.id as string;

    socket?.emit("stopDragging", taskId);

    if (over && active.id !== over.id) {
      const task = tasks.find((t) => t.id === taskId);

      if (task?.currentEditor) {
        alert(
          `Cannot move task - currently being edited by ${task.currentEditor}`
        );
        return;
      }

      const newStatus = over.id as TaskStatus;
      onTaskMove(taskId, newStatus);
    }
  };

  const handleAddTask = async (taskData: Partial<Task>) => {
    const newTask = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      assignedUsers: [currentUser.id],
    } as Task;
    await onTaskAdd(newTask);
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
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className={styles.columnsContainer}>
            {Object.values(TaskStatus).map((status) => (
              <Column
                key={status}
                status={status}
                tasks={tasks.filter((task) => task.status === status)}
                currentUser={currentUser}
                users={users}
                onTaskEdit={async (task) => onTaskEdit(task)}
                onTaskDelete={async (taskId) => onTaskDelete(taskId)}
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
