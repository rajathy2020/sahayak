import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './page_styles/header.css';
import { useUser } from './userContext';
import { logout } from './api';

const Header = ({ title, links, onAboutClick, onServicesClick }) => {
  const location = useLocation();
  const user = useUser();
  const bookings = user?.number_of_bookings || 0;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">
          <img src="/logo.png" alt="Sahayak Logo" className="header-logo" />
          <span className="header-title">{title}</span>
        </Link>
      </div>
      <div>Bookings: {bookings}</div>
      <nav className="nav-links">
        {links.map((link, index) => {
          if (link.label === 'About') {
            return (
              <a 
                key={index}
                href="#about"
                className="nav-link"
                onClick={onAboutClick}
              >
                {link.label}
              </a>
            );
          }
          if (link.label === 'Services') {
            return (
              <a 
                key={index}
                href="#services"
                className="nav-link"
                onClick={onServicesClick}
              >
                {link.label}
              </a>
            );
          }

          if (link.label === 'Contact') {
            return (
              <a href="#contact" className="nav-link">Contact</a>
            );
          }

          if (link.label === 'Me') {
            return (
              <a href="/me" className="nav-link">Me</a>
            );
          }

          return (
            <Link
              key={index}
              to={link.path}
              className={location.pathname === link.path ? 'active' : ''}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="header-right">
        <button 
          className="logout-btn"
          onClick={handleLogout}
        >
          <i className="fas fa-sign-out-alt"></i>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
