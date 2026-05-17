import { NavLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth.js";
import AuthModal from "../AuthModal/AuthModal.jsx";
import Button from "../Button/Button.jsx";
import "./styles/Header.css";  // ← проверьте что путь правильный
import { useState } from "react";

function linkClass({ isActive }) {
  return "nav-link" + (isActive ? " active" : "");
}

export default function Header() {
  const { user, isAuthenticated, login, register, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("login");

  const handleOpenModal = (mode) => {
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const handleLogin = async (email, password) => {
    return await login(email, password);
  };

  const handleRegister = async (name, email, password, confirmPassword, role) => {
    return await register(name, email, password, confirmPassword, role);
  };

  const getRoleIcon = () => {
    if (user?.role === "admin") return "👑";
    if (user?.role === "teacher") return "📚";
    return "🎓";
  };

  return (
    <>
      <header className="bb-header">
        <div className="bb-container bb-header-inner">
          <NavLink to="/" className="bb-brand-link">
            <div className="bb-brand">bada bing</div>
          </NavLink>

          <nav className="bb-nav">
            <NavLink className={linkClass} to="/">
              Преподаватели
            </NavLink>
            {isAuthenticated && user?.role !== "admin" && (
              <>
                <NavLink className={linkClass} to="/student">
                  Мои записи
                </NavLink>
                {user?.role === "teacher" && (
                  <NavLink className={linkClass} to="/teacher-cabinet">
                    Кабинет преподавателя
                  </NavLink>
                )}
              </>
            )}
            {isAuthenticated && user?.role === "admin" && (
              <NavLink className={linkClass} to="/admin">
                👑 Админ-панель
              </NavLink>
            )}
          </nav>

          <div className="bb-auth-section">
            {isAuthenticated ? (
              <div className="bb-user-info">
                <span className="bb-user-role-icon">{getRoleIcon()}</span>
                <span className="bb-user-name">{user?.name}</span>
                <span className="bb-user-role-badge">
                  {user?.role === "admin" ? "Админ" : user?.role === "teacher" ? "Преподаватель" : "Студент"}
                </span>
                <Button variant="ghost" onClick={logout} className="bb-logout-btn">
                  Выйти
                </Button>
              </div>
            ) : (
              <div className="bb-auth-buttons">
                <Button variant="ghost" onClick={() => handleOpenModal("login")}>
                  Вход
                </Button>
                <Button variant="primary" onClick={() => handleOpenModal("register")}>
                  Регистрация
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        initialMode={modalMode}
      />
    </>
  );
}