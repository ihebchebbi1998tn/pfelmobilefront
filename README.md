# Client-Portal-app 🚀

The Client Portal Application is a modern platform designed to streamline communication between customers and support teams. It replaces inefficient traditional methods (emails, calls) with a real-time, structured, and digitalized system

## 🔹 Key Features:

- 🔒 User authentication
- 📝 Real-time Chat
- 📈 Real-time data
- 🛠 Service Requests
- 🛒 Order Management
- 🔔 Notifications
- 📱 Responsive design

## Tech Stack

- React 19
- Vite for build tooling
- Redux Toolkit for state management
- Material-UI + CSS for styling
- Formik + Yup for form handling
- React Router v6 for routing

## Project Structure

```
src/
├── assets/                   # Static assets
├── components/               # Shared components
|             ├── layout
|             ├── pages
|             ├── routes
|             ├── ui
├── hooks/                    # Custom hooks
├── locales/                  # Page components
├── services/                 # API services
├── styles/                   # Global styles
├── utils/                    # Global styles

```

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn or npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/L-mobile-internship/Client-Portal-app.git
   cd Client-Portal-app
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

4. Add the .env file to the project src

5. Start the development server:
   ```bash
   yarn dev
   ```

### Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint

## Development

### Code Style

- We use ESLint and Prettier for code formatting
- Use functional components with hooks
- Implement proper error handling
- Write meaningful commit messages

### Component Guidelines

- Keep components small and focused
- Implement proper error boundaries
- Follow the container/presenter pattern
- Use proper naming conventions

### State Management

- Use context for global state
- Keep context actions and reducers organized
- Implement proper error handling
- Use selectors for derived state
- Keep state normalized
