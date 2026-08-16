import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Host from "./pages/Host";
import List from "./pages/List";
import Host_dashboard from "./pages/Host_dashboard";
import Explore from "./pages/Explore";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/host" element={<Host />} />
        <Route path="/host/list" element={<List />} />
        <Route path="/host/Host_dashboard" element={<Host_dashboard />} />
        <Route path="/explore" element={<Explore />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;