import React from 'react';
import logo from '../resources/cyient-logo.png';
import '../resources/Header.css'; 

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <img src={logo} alt="cyient-logo" /> 
        </div>
        {/* <nav>
          <ul>
            <li>
              <a>Users</a>
            </li>
            <li>
              <a>Stats</a>
            </li>
            <li>
              <a>Profile</a>
            </li>
            <li>
              <a>Login</a>
            </li>
          </ul>
        </nav> */}
      </div>
    </header>
  );
};

export default Header;