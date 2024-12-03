import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './page_styles/header.css';
import { useUser } from './userContext'; // Adjust the import path

const Header = ({ title, links }) => {
  const location = useLocation();
  const user = useUser();
  const bookings = user?.number_of_bookings || 0;


  return (
    <header className="header">
      <div className="logo">
        <Link to="/">{title}</Link>
      </div>
      <div>Bookings: {bookings}</div>
      <nav className="nav-links">
        {links.map((link, index) => (
          <Link 
            key={index} 
            to={link.path} 
            className={location.pathname === link.path ? 'active' : ''}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
};

export default Header;
