import React, { useState } from 'react';
import { Row, Col, Button, Card, Form, Image } from 'react-bootstrap';
import Axios from 'axios';
import { notify } from 'react-notify-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await Axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/login`,
        { ...formData }
      );
      const { id, token, name } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ username: name, id }));
      notify.show(res.data.message, 'success');
      navigate('/');
    } catch (err) {
      // Handle error
    }
  };

  return (
    <Row className='vh-100-minus'>
      <Col md={5} className='my-auto justify-content-center'>
        <Card className='p-4 shadow rounded'>
          <Form onSubmit={onSubmit}>
            <Form.Group controlId='formBasicEmail'>
              <Form.Label>Dirección de correo</Form.Label>
              <Form.Control
                value={formData.email}
                name='email'
                onChange={handleChange}
                type='email'
                placeholder='Ingrese la dirección de correo'
              />
            </Form.Group>

            <Form.Group controlId='formBasicPassword'>
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                name='password'
                value={formData.password}
                onChange={handleChange}
                type='password'
                placeholder='********'
              />
            </Form.Group>

            <Button variant='primary' type='submit'>
              <FontAwesomeIcon icon={faSignInAlt} className='mr-2' />
              Ingresar
            </Button>
          </Form>
        </Card>
      </Col>
      <Col className='my-auto text-center justify-content-center'>
        <Image src={process.env.PUBLIC_URL + '/img/logo.png'} height={300} />
      </Col>
    </Row>
  );
}

export default Home;
