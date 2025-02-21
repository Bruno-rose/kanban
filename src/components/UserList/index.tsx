import React from "react";
import { User } from "@/components/types";
import { styles } from "./styles";
import clsx from "clsx";

interface UserListProps {
  users: User[];
  currentUser: User;
  className?: string;
}

const UserList: React.FC<UserListProps> = ({
  users,
  currentUser,
  className,
}) => {
  return (
    <div className={clsx(styles.container, className)}>
      <div className={styles.list}>
        {users.map((user) => (
          <div
            key={user.id}
            className={clsx(
              styles.userItem,
              user.id === currentUser.id && styles.currentUser
            )}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {user.name.charAt(0)}
              </div>
            )}
            <span className={styles.userName}>{user.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;
