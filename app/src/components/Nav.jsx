import { useEffect, useState } from 'react';
import { Dropdown, DropdownToggle, DropdownItem, DropdownMenu, Nav, NavItem } from 'reactstrap';
import { NavLink as RouterNavLink, BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../contexts/Auth';

function MyNav({ toggleRegister, toggleLogin}) {
    
    const { user, logout } = useAuth();

    const [activeTab, setActiveTab] = useState(useLocation().pathname);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    let accountName = user ? user.email : 'account';

    return (
            <Nav pills justified className="nav">
                <NavItem>
                    <RouterNavLink 
                        to='.'
                        style={{ color:'rgb(150, 150, 150)'}} 
                        className={`nav-link ${activeTab === '' ? 'active' : ''}`} 
                        onClick ={() => setActiveTab('')}
                    >home</RouterNavLink>
                </NavItem>
                <NavItem>
                    <RouterNavLink 
                        to='movies'
                        style={{ color:'rgb(150, 150, 150)'}} 
                        className={`nav-link ${activeTab === '/movies' ? 'active' : ''}`} 
                        onClick ={() => setActiveTab('/movies')}
                    >movies</RouterNavLink>
                </NavItem>

                <Dropdown nav isOpen={dropdownOpen} toggle={() => setDropdownOpen(!dropdownOpen)} >
                    <DropdownToggle nav caret style={{ color:'rgb(150, 150, 150)', outline:'none', boxShadow:'none'}} >{accountName}</DropdownToggle>
                    <DropdownMenu>

                        {user ? (<DropdownItem onClick={logout}>sign out</DropdownItem>) 
                        : (<>
                        <DropdownItem onClick={toggleLogin}>sign in</DropdownItem>
                        <DropdownItem onClick={toggleRegister}>register</DropdownItem></>)}

                    </DropdownMenu>
                </Dropdown>
            </Nav>
    );
  };

export default MyNav;