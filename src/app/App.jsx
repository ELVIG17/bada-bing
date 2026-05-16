import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/Layout/Layout.jsx";
import PrivateRoute from "../components/PrivateRoute.jsx";
import { initDemoUser, hasRole } from "../shared/lib/auth.js";
import { initSlots } from "../shared/lib/storage.js";

import TeachersPage from "../pages/TeachersPage/TeachersPage.jsx";
import TeacherPage from "../pages/TeacherPage/TeacherPage.jsx";
import BookingPage from "../pages/BookingPage/BookingPage.jsx";
import StudentPage from "../pages/StudentPage/StudentPage.jsx";
import TeacherCabinetPage from "../pages/TeacherCabinetPage/TeacherCabinetPage.jsx";
import AdminPage from "../pages/AdminPage/AdminPage.jsx";
import AuthPage from "../pages/AuthPage/AuthPage.jsx";

const AdminRoute = ({ children }) => {
  if (!hasRole("admin")) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default function App() {
  useEffect(() => {
    initDemoUser();
    initSlots(); // Инициализация начальных слотов
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<TeachersPage />} />
        <Route path="teacher/:id" element={<TeacherPage />} />
      </Route>

      <Route path="/auth" element={<AuthPage />} />

      <Route path="/booking" element={
        <PrivateRoute>
          <BookingPage />
        </PrivateRoute>
      } />
      
      <Route path="/student" element={
        <PrivateRoute>
          <StudentPage />
        </PrivateRoute>
      } />
      
      <Route path="/teacher-cabinet" element={
        <PrivateRoute>
          <TeacherCabinetPage />
        </PrivateRoute>
      } />

      <Route path="/admin" element={
        <PrivateRoute>
          <AdminRoute>
            <Layout />
          </AdminRoute>
        </PrivateRoute>
      }>
        <Route index element={<AdminPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
} 