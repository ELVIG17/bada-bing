import React from "react";
import { NavLink } from "react-router-dom";

function linkClass({ isActive }) {
  return "nav-link" + (isActive ? " active" : "");
}

export default function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <div className="brand">bada bing</div>

        <nav className="nav">
          <NavLink className={linkClass} to="/">
            Преподаватели
          </NavLink>
          <NavLink className={linkClass} to="/student">
            Мои записи
          </NavLink>
          <NavLink className={linkClass} to="/teacher-cabinet">
            Кабинет преподавателя
          </NavLink>
        </nav>
      </div>
    </header>
  );
}