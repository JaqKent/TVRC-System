import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import moment from 'moment';
import Axios from 'axios';
import { notify } from 'react-notify-toast';

const AddClients = (props) => {
  const [clientData, setClientData] = useState({
    name: '',
    category: '',
    address: '',
    dni: '',
    birthday: '',
    nickName: '',
    inscriptionDate: '',
    price: '',
    priceText: '',
    phone: '',
    phoneAlt: '',
    email: '',
    obraSocial: '',
    bloodType: '',
    tshirtSize: '',
    shortSize: '',
    unSubscribingDate: '',
    unSubscribingReason: '',
    isDown: false,
    isSaving: false,
  });

  useEffect(() => {
    if (props.clientToEdit) {
      let { clientToEdit } = props;

      setClientData({
        ...clientToEdit,
        inscriptionDate: moment(clientToEdit.inscriptionDate).format(
          'YYYY-MM-DD'
        ),
        unSubscribingDate: clientToEdit.unSubscribingDate
          ? moment(clientToEdit.unSubscribingDate).format('YYYY-MM-DD')
          : '',
      });
    }
  }, [props.clientToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setClientData({ ...clientData, isSaving: true });

    if (props.isEdit) {
      Axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/players/edit/${props.clientToEdit._id}`,
        clientData,
        {
          headers: { 'auth-token': localStorage.getItem('token') },
        }
      )
        .then((response) => handleResponse(response))
        .catch((error) => handleError(error));
    } else {
      Axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/players/create`,
        clientData,
        {
          headers: { 'auth-token': localStorage.getItem('token') },
        }
      )
        .then((response) => handleResponse(response))
        .catch((error) => handleError(error));
    }
  };

  const handleResponse = (response) => {
    if (response.data.success) {
      notify.show(response.data.message, 'success', 3000, 'blue');
      clearInputs();
      props.refresh();
      props.onHide();
      setClientData({ ...clientData, isSaving: false });
    } else {
      notify.show(response.data.message, 'error', 3000, 'blue');
      setClientData({ ...clientData, isSaving: false });
    }
  };

  const handleError = (error) => {
    notify.show(error.message, 'error', 3000, 'red');
    setClientData({ ...clientData, isSaving: false });
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    setClientData({ ...clientData, [name]: value });
  };

  const clearInputs = () => {
    setClientData({
      name: '',
      category: '',
      address: '',
      dni: '',
      birthday: '',
      nickName: '',
      inscriptionDate: '',
      price: '',
      priceText: '',
      phone: '',
      phoneAlt: '',
      email: '',
      obraSocial: '',
      bloodType: '',
      tshirtSize: '',
      shortSize: '',
      unSubscribingDate: '',
      unSubscribingReason: '',
      isDown: false,
      isSaving: false,
    });
  };

  let requiredStar = <small className='font-weight-bold text-danger'>*</small>;

  return (
    <Modal size='lg' show={props.show} onHide={props.onHide}>
      <Form className='px-3' onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            {props.isEdit ? 'Modificar un Jugador.' : 'Agregar un Jugador'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='row'>
            <div className='col-md-6'>
              <Form.Group>
                <Form.Label>Nombre {requiredStar}</Form.Label>
                <Form.Control
                  value={clientData.name}
                  onChange={handleChange}
                  type='text'
                  name='name'
                  required
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>DNI {requiredStar}</Form.Label>
                <Form.Control
                  value={clientData.dni}
                  onChange={handleChange}
                  type='text'
                  name='dni'
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Domicilio {requiredStar}</Form.Label>
                <Form.Control
                  value={clientData.address}
                  onChange={handleChange}
                  type='text'
                  name='address'
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Categoria</Form.Label>
                <Form.Control
                  value={clientData.category}
                  onChange={handleChange}
                  type='text'
                  name='category'
                  required
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Apodo</Form.Label>
                <Form.Control
                  value={clientData.nickName}
                  onChange={handleChange}
                  type='text'
                  name='nickName'
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Fecha de Inscripcion {requiredStar}</Form.Label>
                <Form.Control
                  value={clientData.inscriptionDate}
                  onChange={handleChange}
                  type='date'
                  name='inscriptionDate'
                  required
                />
              </Form.Group>

              <Form.Group>
                <Form.Label> Precio de Cuota {requiredStar}</Form.Label>
                <Form.Control
                  value={clientData.price}
                  onChange={handleChange}
                  type='number'
                  name='price'
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Precio de Cuota(Expresado en letras)</Form.Label>
                <Form.Control
                  value={clientData.priceText}
                  onChange={handleChange}
                  type='text'
                  name='priceText'
                />
              </Form.Group>
            </div>
            <div className='col-md-6'>
              <Form.Group>
                <Form.Label>Fecha de Nacimiento {requiredStar}</Form.Label>
                <Form.Control
                  value={clientData.birthday}
                  onChange={handleChange}
                  type='date'
                  name='birthday'
                ></Form.Control>
              </Form.Group>

              <Form.Group>
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  value={clientData.phone}
                  onChange={handleChange}
                  type='text'
                  name='phone'
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Teléfono (Alternativo)</Form.Label>
                <Form.Control
                  value={clientData.phoneAlt}
                  onChange={handleChange}
                  type='text'
                  name='phoneAlt'
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  value={clientData.email}
                  onChange={handleChange}
                  type='email'
                  name='email'
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Obra Social</Form.Label>
                <Form.Control
                  value={clientData.obraSocial}
                  onChange={handleChange}
                  type='text'
                  name='obraSocial'
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Grupo Sanguineo</Form.Label>
                <Form.Control
                  value={clientData.bloodType}
                  onChange={handleChange}
                  type='text'
                  name='bloodType'
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Talle Camiseta</Form.Label>
                <Form.Control
                  value={clientData.tshirtSize}
                  onChange={handleChange}
                  type='text'
                  name='tshirtSize'
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Talle Pantalon</Form.Label>
                <Form.Control
                  value={clientData.shortSize}
                  onChange={handleChange}
                  type='text'
                  name='shortSize'
                />
              </Form.Group>

              <Form.Group>
                <Form.Check
                  checked={clientData.isDown}
                  onChange={() => {
                    setClientData({
                      ...clientData,
                      isDown: !clientData.isDown,
                    });
                  }}
                  type='checkbox'
                  label='¿Dado de baja?'
                />
              </Form.Group>
            </div>
          </div>

          <div className={clientData.isDown ? 'd-block' : 'd-none'}>
            <Form.Group>
              <Form.Label>Fecha de baja</Form.Label>
              <Form.Control
                value={clientData.unSubscribingDate}
                onChange={handleChange}
                type='date'
                name='unSubscribingDate'
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Razón de baja</Form.Label>
              <Form.Control
                value={clientData.unSubscribingReason}
                onChange={handleChange}
                type='text'
                name='unSubscribingReason'
              />
            </Form.Group>
          </div>

          <Modal.Footer>
            <Button variant='secondary' onClick={props.onHide}>
              Cerrar
            </Button>
            <Button
              disabled={clientData.isSaving}
              type='submit'
              variant='primary'
            >
              Guardar
            </Button>
          </Modal.Footer>
        </Modal.Body>
      </Form>
    </Modal>
  );
};

export default AddClients;
