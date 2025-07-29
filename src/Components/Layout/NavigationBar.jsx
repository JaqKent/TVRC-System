import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';
import Axios from 'axios';

const NavigationBar = () => {
  const location = useLocation();
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
      {!location.pathname.startsWith('/userBill/') && (
        <>
          <Link className='text-xl' to='/clients/list'>
            <Navbar.Brand>Tafi Viejo Rugby Club</Navbar.Brand>
          </Link>
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='mr-auto'>
              <Nav.Item>
                <Nav.Link href='/'>Socios Activos</Nav.Link>
              </Nav.Item>
              <Link to='/clients/list-baja'>
                <Navbar.Brand className='client-manager-logo'>
                  Socios Dados de Baja
                </Navbar.Brand>
              </Link>
              <Nav.Item>
                <Nav.Link href='/clients/list-debtors'>
                  Lista de Deudores
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link href='/bills/list'>Boletas</Nav.Link>
              </Nav.Item>
            </Nav>
            <Nav className='ml-auto'>
              <p className='user'>{`Usuario: ${userInfo.name}`}</p>
              <Nav.Link href='/logout'> Cerrar sesión</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </>
      )}
    </Navbar>
  );
};

export default NavigationBar;
