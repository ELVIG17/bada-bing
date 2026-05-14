import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/Layout.jsx";

import TeachersPage from "../pages/TeachersPage.jsx";
import TeacherPage from "../pages/TeacherPage.jsx";
import BookingPage from "../pages/BookingPage.jsx";
import StudentPage from "../pages/StudentPage.jsx";
import TeacherCabinetPage from "../pages/TeacherCabinetPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<TeachersPage />} />
        <Route path="teacher/:id" element={<TeacherPage />} />
        <Route path="booking" element={<BookingPage />} />
        <Route path="student" element={<StudentPage />} />
        <Route path="teacher-cabinet" element={<TeacherCabinetPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}