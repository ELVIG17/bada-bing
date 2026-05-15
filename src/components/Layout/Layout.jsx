import { Outlet } from "react-router-dom";
import Header from "../Header/Header.jsx";
import "./styles/Layout.css";

export default function Layout() {
  return (
    <div className="app">
      <Header />
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}