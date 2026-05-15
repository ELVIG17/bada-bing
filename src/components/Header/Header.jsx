import { NavLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth.js";
import AuthModal from "../AuthModal/AuthModal.jsx";
import Button from "../Button/Button.jsx";
import "./styles/Header.css";
import { useState } from "react";

function linkClass({ isActive }) {
  return "nav-link" + (isActive ? " active" : "");
}

export default function Header() {
  const { user, isAuthenticated, login, register, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("login"); // "login" или "register"

  const handleOpenModal = (mode) => {
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const handleLogin = async (email, password) => {
    return await login(email, password);
  };

  const handleRegister = async (name, email, password, confirmPassword) => {
    return await register(name, email, password, confirmPassword);
  };

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <NavLink to="/" className="brand-link">
            <div className="brand">bada bing</div>
          </NavLink>

          <nav className="nav">
            <NavLink className={linkClass} to="/">
              Преподаватели
            </NavLink>
            {isAuthenticated && (
              <>
                <NavLink className={linkClass} to="/student">
                  Мои записи
                </NavLink>
                <NavLink className={linkClass} to="/teacher-cabinet">
                  Кабинет преподавателя
                </NavLink>
              </>
            )}
          </nav>

          <div className="auth-section">
            {isAuthenticated ? (
              <div className="user-info">
                <span className="user-name">👋 {user?.name}</span>
                <Button variant="ghost" onClick={logout} className="logout-btn">
                  Выйти
                </Button>
              </div>
            ) : (
              <div className="auth-buttons">
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