import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, NavDropdown, Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import Axios from 'axios';

const NavigationBar = () => {
  const [userInfo, setUserInfo] = useState({
    name: '(No loggeado)',
    token: '',
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (localStorage.getItem('token')) {
        updateData();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const updateData = () => {
    if (localStorage.getItem('token') !== userInfo.token) {
      setUserInfo((prevUserInfo) => ({
        ...prevUserInfo,
        token: localStorage.getItem('token'),
      }));

      Axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/getUserInfo`, {
        headers: { 'auth-token': localStorage.getItem('token') },
      }).then(({ data }) =>
        setUserInfo((prevUserInfo) => ({ ...prevUserInfo, ...data }))
      );
    }
  };

  return (
    <Navbar bg='primary' variant='dark' expand='lg'>
      <Link className='text-xl' to='/clients/list'>
        <Navbar.Brand>Wi-Fi Net Client Manager</Navbar.Brand>
      </Link>
      <Navbar.Toggle aria-controls='basic-navbar-nav' />
      <Navbar.Collapse id='basic-navbar-nav'>
        <Nav className='mr-auto'>
          <Nav.Item>
            <Nav.Link href='/clients/list'>Clientes Activos</Nav.Link>
          </Nav.Item>
          <Link to='/'>
            <Navbar.Brand className='client-manager-logo'>
              Clientes Dados de Baja
            </Navbar.Brand>
          </Link>
          <Nav.Item>
            <Nav.Link href='/bills/list'>Boletas</Nav.Link>
          </Nav.Item>
        </Nav>
        <Nav className='ml-auto'>
          <NavDropdown
            title={`Usuario: ${userInfo.name}`}
            id='basic-nav-dropdown'
          >
            <NavDropdown.Item>
              <FontAwesomeIcon icon={faUsers} className='mr-2' />
              Cambiar contraseña
            </NavDropdown.Item>
            <NavDropdown.Item href='/logout'>
              <FontAwesomeIcon icon={faUserPlus} className='mr-2' />
              Cerrar sesión
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavigationBar;
