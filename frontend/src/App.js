import React from "react";
import Timesheet from "./pages/Timesheet";
import Header from "../src/components/Header";
import UserManagement from "./pages/Users";
import Login from "./pages/Login";
import StickyFooter from "../src/components/Footer";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route
            path="/timesheet"
            element={
              <>
                <Header />
                <Timesheet />
                <StickyFooter />
              </>
            }
          />
          <Route
            path="/user-management"
            element={
              <>
                <Header />
                <UserManagement />
                <StickyFooter />
              </>
            }
          />
          <Route
            index
            element={
              <>
                <Login />
              </>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
