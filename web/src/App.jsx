import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Host from "./pages/Host";
import List from "./pages/List";
import Host_dashboard from "./pages/Host_dashboard";
import Explore from "./pages/Explore";

import PropertyDetail from "./pages/PropertyDetail";
import Book from "./pages/Book";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProfile from "./pages/AdminProfile";
import { AuthProvider } from "./context/AuthContext";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/stays" element={<Explore />} />
          <Route path="/property/:slug" element={<PropertyDetail />} />
          <Route path="/property" element={<PropertyDetail />} />
          <Route path="/book/:slug" element={<Book />} />
          <Route path="/book" element={<Book />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/host" element={<Host />} />
          <Route path="/host/list" element={<List />} />
          <Route path="/host/Host_dashboard" element={<Host_dashboard />} />
          <Route path="/host/dashboard" element={<Host_dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;