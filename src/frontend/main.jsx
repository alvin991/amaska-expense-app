import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import TestingPage from './components/TestingPage.jsx';

const router = createBrowserRouter([
    { path: "/", element: <App /> },
    { path: "/testing", element: <TestingPage /> },
  ],
  { basename: import.meta.env.BASE_URL,}
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
