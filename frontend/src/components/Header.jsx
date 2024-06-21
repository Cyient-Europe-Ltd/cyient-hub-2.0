import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../resources/cyient-logo-white.png';
import '../resources/Header.css'; 

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <img src={logo} alt="cyient-logo" /> 
        </div>
        <nav>
          <ul>
          <li>
              <Link to="/timesheet">Timesheet</Link>
            </li>
            <li>
              <Link to="/user-management">User Management</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;