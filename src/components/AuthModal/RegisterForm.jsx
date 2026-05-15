import { useState } from "react";
import Button from "../Button/Button.jsx";

export default function RegisterForm({ onRegister, onSwitch, isLoading }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    const result = await onRegister(name, email, password, confirmPassword);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      {error && <div className="auth-error">{error}</div>}
      
      <div className="form-group">
        <label className="label">Имя *</label>
        <input
          type="text"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Иван Иванов"
          disabled={isLoading}
        />
      </div>
      
      <div className="form-group">
        <label className="label">Email *</label>
        <input
          type="email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ivan@example.com"
          disabled={isLoading}
        />
      </div>
      
      <div className="form-group">
        <label className="label">Пароль *</label>
        <input
          type="password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Минимум 6 символов + заглавная + цифра"
          disabled={isLoading}
        />
        <div className="password-hint">
          Пароль должен содержать минимум 6 символов, заглавную букву и цифру
        </div>
      </div>
      
      <div className="form-group">
        <label className="label">Подтверждение пароля *</label>
        <input
          type="password"
          className="input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Повторите пароль"
          disabled={isLoading}
        />
      </div>
      
      <Button variant="primary" type="submit" className="modal-btn" disabled={isLoading}>
        {isLoading ? "Регистрация..." : "Зарегистрироваться"}
      </Button>
      
      <div className="modal-switch">
        <p>
          Уже есть аккаунт?{" "}
          <button type="button" onClick={onSwitch}>
            Войти
          </button>
        </p>
      </div>
    </form>
  );
}   