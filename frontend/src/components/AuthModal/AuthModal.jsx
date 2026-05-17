import { useState, useEffect } from "react";
import LoginForm from "./loginForm.jsx";
import RegisterForm from "./RegisterForm.jsx";
import "./styles/AuthModal.css";

export default function AuthModal({ isOpen, onClose, onLogin, onRegister, initialMode = "login" }) {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [isLoading, setIsLoading] = useState(false);

  // Синхронизируем режим при открытии
  useEffect(() => {
    if (isOpen) {
      setIsLogin(initialMode === "login");
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleLogin = async (email, password) => {
    setIsLoading(true);
    const result = await onLogin(email, password);
    setIsLoading(false);
    if (result.success) {
      onClose();
    }
    return result;
  };

  const handleRegister = async (name, email, password, confirmPassword) => {
    setIsLoading(true);
    const result = await onRegister(name, email, password, confirmPassword);
    setIsLoading(false);
    if (result.success) {
      setIsLogin(true);
    }
    return result;
  };

  const handleSwitch = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>{isLogin ? "Вход в аккаунт" : "Регистрация"}</h2>
        </div>

        {isLogin ? (
          <LoginForm
            onLogin={handleLogin}
            onSwitch={handleSwitch}
            isLoading={isLoading}
          />
        ) : (
          <RegisterForm
            onRegister={handleRegister}
            onSwitch={handleSwitch}
            isLoading={isLoading}
          />
        )}

        <div className="modal-demo">
          <p className="small">
            <strong>🔑 Демо-доступ:</strong><br />
            Email: <strong>demo@example.com</strong><br />
            Пароль: <strong>Demo123</strong>
          </p>
        </div>
      </div>
    </div>
  );
}