import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../../shared/lib/auth.js";

export default function AuthPage() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Если уже авторизован — на главную
    if (isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);
  
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>bada bing</h1>
          <p className="muted">Используйте кнопки входа/регистрации в шапке сайта</p>
        </div>
        <div className="auth-demo" style={{ textAlign: "center", padding: "20px" }}>
          <p className="muted">
            <strong>Демо-доступ:</strong><br />
            Email: demo@example.com<br />
            Пароль: Demo123
          </p>
        </div>
      </div>
    </div>
  );
}