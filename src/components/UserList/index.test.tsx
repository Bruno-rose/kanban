import React from "react";
import { render, screen } from "@testing-library/react";
import UserList from "./index";
import { User } from "@/components/types";

const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    avatar: "https://example.com/avatar1.jpg",
  },
  {
    id: "2",
    name: "Jane Smith",
  },
];

const mockCurrentUser = mockUsers[0];

describe("UserList", () => {
  it("renders all users", () => {
    render(<UserList users={mockUsers} currentUser={mockCurrentUser} />);

    mockUsers.forEach((user) => {
      expect(screen.getByText(user.name)).toBeVisible();
    });
  });

  it("highlights current user", () => {
    render(<UserList users={mockUsers} currentUser={mockCurrentUser} />);

    const currentUserElement = screen.getByText(
      mockCurrentUser.name
    ).parentElement;

    expect(currentUserElement).toHaveClass(
      "flex items-center gap-2 px-3 py-2 rounded-lg bg-custom-green text-custom-dark"
    );
  });

  it("renders avatar when available", () => {
    render(<UserList users={mockUsers} currentUser={mockCurrentUser} />);

    const avatar = screen.getByAltText(mockUsers[0].name);

    expect(avatar).toBeVisible();
    expect(avatar).toHaveAttribute("src", mockUsers[0].avatar);
  });

  it("renders avatar placeholder when no avatar is available", () => {
    render(<UserList users={mockUsers} currentUser={mockCurrentUser} />);

    const placeholder = screen.getByText("J");

    expect(placeholder).toBeVisible();
  });
});
