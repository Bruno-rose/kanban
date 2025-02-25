# Outbuild Kanban Board

A real-time collaborative Kanban board application built with Next.js and Socket.IO. Multiple users can manage tasks collaboratively in real-time, with features like task creation, editing, deletion, and drag-and-drop functionality.

## Features

- Real-time collaboration with multiple users
- Drag and drop tasks between columns (To Do, In Progress, Done)
- Create, edit, and delete tasks
- Visual feedback for user interactions
- Real-time presence indicators showing who is editing/moving tasks
- Responsive and clean UI design

## Tech Stack

- Next.js 15
- React 19
- Socket.IO for real-time communication
  > Socket.IO was chosen over raw WebSockets for its robust features including automatic reconnection, fallback support, built-in event system, and room management capabilities - making it ideal for real-time collaborative applications.
- TypeScript
- Tailwind CSS for styling
- Jest & React Testing Library for testing
- DND Kit for drag and drop functionality

## Prerequisites

- Node.js (v18 or higher recommended)
- Yarn package manager

## Installation

1. Clone the repository:

```bash
git clone git@github.com:Bruno-rose/kanban.git
cd kanban
```

2. Install dependencies:

```bash
yarn install
```

3. Start the development server:

```bash
yarn dev
```

This will start both the Next.js frontend (port 3000) and Socket.IO server (port 3001).

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                  # Next.js app directory
├── components/          # React components
├── contexts/           # React contexts
├── server/            # Socket.IO server
└── types/            # TypeScript types
```

## Testing

Run the test suite:

```bash
yarn test
```

The project includes comprehensive unit tests for components and functionality.

## Development

The application uses:

- Socket.IO for real-time communication between clients
- DND Kit for drag-and-drop functionality
- Tailwind CSS for styling
- TypeScript for type safety
- Jest and React Testing Library for testing

## Features in Detail

### Real-time Collaboration

- Users can see other connected users
- Visual indicators show who is editing or moving tasks
- Changes are synchronized across all connected clients

### Task Management

- Create new tasks with title and description
- Edit existing tasks
- Delete tasks
- Drag and drop tasks between columns
- Concurrent editing protection

### User Experience

- Clean and intuitive interface
- Visual feedback for user interactions
- Responsive design
- Error handling and user notifications
