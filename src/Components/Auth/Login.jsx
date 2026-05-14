import React from 'react';
import { Row, Col, Card, Image } from 'react-bootstrap';
import Axios from 'axios';
import { notify } from 'react-notify-toast';
import { GoogleLogin } from '@react-oauth/google';
import logo from '../../assets/LOGO TVRC.png';

function Home() {

  const onGoogleSuccess = async (credentialResponse) => {
    try {

      const res = await Axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/google-login`,
        { token: credentialResponse.credential }
      );
      
      const { id, token, name, role } = res.data;
      
  
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ 
        username: name, 
        id, 
        role: role || 'user' 
      }));

      notify.show(`Bienvenido ${name}`, 'success', 3000);
      
   
      window.location.href = "/"; 
    } catch (err) {
      const mensaje = err.response?.data?.message || "Error al autenticar";
      notify.show(mensaje, 'error', 3000);
    }
  };

  return (
    <Row className='vh-100-minus'>
      <Col md={5} className='my-auto justify-content-center'>
        <Card className='p-5 shadow rounded text-center'>
          <h3 className='mb-4'>Panel Administrativo</h3>
          <p className='text-muted mb-4'>
            Inicie sesión con su cuenta de Google para acceder al sistema.
          </p>
          
          <div className='d-flex justify-content-center py-3'>
            <GoogleLogin
              onSuccess={onGoogleSuccess}
              onError={() => notify.show("Error en la conexión con Google", "error")}
              useOneTap
            />
          </div>
          
          <small className='text-muted mt-4'>
            Si no tiene acceso, contacte al administrador.
          </small>
        </Card>
      </Col>
      
      <Col className='my-auto text-center justify-content-center'>
        <Image 
          src={logo} 
          height={300} 
          alt="TVRC Logo"
        />
      </Col>
    </Row>
  );
}

export default Home;
