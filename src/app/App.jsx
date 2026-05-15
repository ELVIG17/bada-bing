import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/Layout/Layout.jsx";
import PrivateRoute from "../components/PrivateRoute.jsx";
import { initDemoUser } from "../shared/lib/auth.js";

import TeachersPage from "../pages/TeachersPage/TeachersPage.jsx";
import TeacherPage from "../pages/TeacherPage/TeacherPage.jsx";
import BookingPage from "../pages/BookingPage/BookingPage.jsx";
import StudentPage from "../pages/StudentPage/StudentPage.jsx";
import TeacherCabinetPage from "../pages/TeacherCabinetPage/TeacherCabinetPage.jsx";
import AuthPage from "../pages/AuthPage/AuthPage.jsx";

export default function App() {
  // Инициализация демо-пользователя при старте
  useEffect(() => {
    initDemoUser();
  }, []);

  return (
    <Routes>
      {/* Главная страница и публичные маршруты - доступны без входа */}
      <Route path="/" element={<Layout />}>
        <Route index element={<TeachersPage />} />
        <Route path="teacher/:id" element={<TeacherPage />} />
      </Route>

      {/* Страница входа/регистрации - доступна без входа */}
      <Route path="/auth" element={<AuthPage />} />

      {/* ЗАЩИЩЕННЫЕ МАРШРУТЫ - требуют авторизации */}
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

      {/* 404 - редирект на главную */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}