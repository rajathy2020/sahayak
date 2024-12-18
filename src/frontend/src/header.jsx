import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './page_styles/header.css';
import { useUser } from './userContext';

const Header = ({ title, links, onAboutClick, onServicesClick }) => {
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
    </header>
  );
};

export default Header;
