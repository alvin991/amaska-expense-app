import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import TestingPage from './components/TestingPage.jsx';
import MyLayout from './components/MyLayout.jsx';
import RecurringPage from './components/RecurringPage.jsx';
import CardsPage from './components/CardsPage.jsx';
import UsersPage from './components/UsersPage.jsx';
import InvestmentsPage from './components/InvestmentsPage.tsx';
import SettingsPage from './components/SettingsPage.tsx';
import { AuthProvider } from './AuthContext.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import LoginPage from './components/LoginPage.jsx';
import './axiosConfig.js';

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <TestingPage /> },
      { path: 'expenses', element: <MyLayout /> },
      { path: 'recurring', element: <RecurringPage /> },
      { path: 'cards', element: <CardsPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'investments', element: <InvestmentsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  {
    path: '/testing',
    element: (
      <ProtectedRoute>
        <TestingPage />
      </ProtectedRoute>
    ),
  },
], {
  basename: import.meta.env.BASE_URL,
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
