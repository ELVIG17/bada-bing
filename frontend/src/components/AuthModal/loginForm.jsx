import { useState } from "react";
import Button from "../Button/Button.jsx";

export default function LoginForm({ onLogin, onSwitch, isLoading }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    const result = await onLogin(email, password);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      {error && <div className="auth-error">{error}</div>}
      
      <div className="form-group">
        <label className="label">Email</label>
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
        <label className="label">Пароль</label>
        <input
          type="password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••"
          disabled={isLoading}
        />
      </div>
      
      <Button variant="primary" type="submit" className="modal-btn" disabled={isLoading}>
        {isLoading ? "Вход..." : "Войти"}
      </Button>
      
      <div className="modal-switch">
        <p>
          Нет аккаунта?{" "}
          <button type="button" onClick={onSwitch}>
            Зарегистрироваться
          </button>
        </p>
      </div>
    </form>
  );
}