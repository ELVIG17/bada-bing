import { useEffect, useState } from "react";
import { getAllUsers, deleteUser, updateUserRole, getCurrentUser } from "../../shared/lib/auth.js";
import Button from "../../components/Button/Button.jsx";
import "./styles/AdminPage.css";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(getAllUsers());
    setLoading(false);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("Удалить пользователя? Это действие необратимо.")) {
      deleteUser(userId);
      loadUsers();
    }
  };

  const handleChangeRole = (userId, newRole) => {
    updateUserRole(userId, newRole);
    loadUsers();
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case "admin": return <span className="role-badge admin">👑 Админ</span>;
      case "teacher": return <span className="role-badge teacher">📚 Преподаватель</span>;
      default: return <span className="role-badge student">🎓 Студент</span>;
    }
  };

  if (loading) return <div className="panel">Загрузка...</div>;

  return (
    <>
      <section className="panel">
        <h1>👑 Админ-панель</h1>
        <p className="muted">Управление пользователями системы</p>
      </section>

      <section className="panel mt">
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-value">{users.length}</div>
            <div className="stat-label">Всего пользователей</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{users.filter(u => u.role === "student").length}</div>
            <div className="stat-label">Студентов</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{users.filter(u => u.role === "teacher").length}</div>
            <div className="stat-label">Преподавателей</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{users.filter(u => u.role === "admin").length}</div>
            <div className="stat-label">Администраторов</div>
          </div>
        </div>

        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Email</th>
                <th>Роль</th>
                <th>Дата регистрации</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td><strong>{user.name}</strong></td>
                  <td>{user.email}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td className="muted">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="actions">
                    {user.role !== "admin" && (
                      <>
                        <select 
                          value={user.role}
                          onChange={(e) => handleChangeRole(user.id, e.target.value)}
                          className="role-select"
                        >
                          <option value="student">Студент</option>
                          <option value="teacher">Преподаватель</option>
                        </select>
                        {user.id !== currentUser?.id && (
                          <Button 
                            variant="danger" 
                            onClick={() => handleDeleteUser(user.id)}
                            className="delete-btn"
                          >
                            🗑️
                          </Button>
                        )}
                      </>
                    )}
                    {user.role === "admin" && user.id === currentUser?.id && (
                      <span className="current-user-badge">Вы</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}