import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../shared/lib/auth.js";

export default function PrivateRoute({ children }) {
  if (!isAuthenticated()) {
    // Если не авторизован — показываем сообщение и предлагаем войти
    alert("Для доступа к этому разделу необходимо войти в систему");
    return <Navigate to="/" replace />;
  }
  
  return children;
}