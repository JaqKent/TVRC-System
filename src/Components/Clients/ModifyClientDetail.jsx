import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import moment from 'moment';
import Axios from 'axios';
import { notify } from 'react-notify-toast';

const AddClients = (props) => {
  const [clientData, setClientData] = useState({
    name: '',
    address: '',
    dni: '',
    inscriptionDate: '',
    plan: '',
    price: '',
    priceText: '',
    priceInstall: '',
    phone: '',
    phoneAlt: '',
    email: '',
    ipAddress: '',
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
        `${process.env.REACT_APP_BACKEND_URL}/api/clients/edit/${props.clientToEdit._id}`,
        clientData,
        {
          headers: { 'auth-token': localStorage.getItem('token') },
        }
      )
        .then((response) => handleResponse(response))
        .catch((error) => handleError(error));
    } else {
      Axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/clients/create`,
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
      address: '',
      dni: '',
      inscriptionDate: '',
      plan: '',
      price: '',
      priceText: '',
      priceInstall: '',
      phone: '',
      phoneAlt: '',
      email: '',
      ipAddress: '',
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
            {props.isEdit ? 'Modificar un Cliente.' : 'Agregar un Cliente'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
            <Form.Label>Domicilio {requiredStar}</Form.Label>
            <Form.Control
              value={clientData.address}
              onChange={handleChange}
              type='text'
              name='address'
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
              required
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Fecha de alta {requiredStar}</Form.Label>
            <Form.Control
              value={clientData.inscriptionDate}
              onChange={handleChange}
              type='date'
              name='inscriptionDate'
              required
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Plan {requiredStar}</Form.Label>
            <Form.Control
              value={clientData.plan}
              onChange={handleChange}
              as='select'
              name='plan'
              required
            >
              <option value=''>Seleccione una opción</option>
              <option>3MB</option>
              <option>5MB</option>
              <option>10MB</option>
              <option>15MB</option>
              <option>20MB</option>
              <option>30MB</option>
              <option>50MB</option>
              <option>80MB</option>
              <option>100MB</option>
              <option>150MB</option>
              <option>200MB</option>
              <option>250MB</option>
              <option>300MB</option>
              <option>350MB</option>
              <option>400MB</option>
            </Form.Control>
          </Form.Group>

          <Form.Group>
            <Form.Label>Precio {requiredStar}</Form.Label>
            <Form.Control
              value={clientData.price}
              onChange={handleChange}
              type='number'
              name='price'
              required
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Precio (Expresado en letras) {requiredStar}</Form.Label>
            <Form.Control
              value={clientData.priceText}
              onChange={handleChange}
              type='text'
              name='priceText'
              required
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Precio de instalación</Form.Label>
            <Form.Control
              value={clientData.priceInstall}
              onChange={handleChange}
              type='text'
              name='priceInstall'
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Teléfono {requiredStar}</Form.Label>
            <Form.Control
              value={clientData.phone}
              onChange={handleChange}
              type='text'
              name='phone'
              required
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
            <Form.Label>Dirección IP</Form.Label>
            <Form.Control
              value={clientData.ipAddress}
              onChange={handleChange}
              type='text'
              name='ipAddress'
            />
          </Form.Group>

          <Form.Group>
            <Form.Check
              checked={clientData.isDown}
              onChange={() => {
                setClientData({ ...clientData, isDown: !clientData.isDown });
              }}
              type='checkbox'
              label='¿Dado de baja?'
            />
          </Form.Group>

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
