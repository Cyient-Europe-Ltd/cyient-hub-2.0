import React from 'react';
import '../resources/Footer.css'; 

const Footer = () => {
  return (
    <footer className="footer">
      <div className="copyright">
        &copy; {new Date().getFullYear()} CYIENT Europe Ltd | All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;