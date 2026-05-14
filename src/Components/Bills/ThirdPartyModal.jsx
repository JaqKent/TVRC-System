import React, { useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import Axios from 'axios';
import moment from 'moment';
import { notify } from 'react-notify-toast';

const AddThirdPartyBillForm = ({ show, onHide, refresh, askToPrint }) => {
  const [name, setName] = useState('');
  const [dni, setDni] = useState('');
  const [phone, setPhone] = useState('');
  const [concept, setConcept] = useState('');
  const [price, setPrice] = useState(0);
  const [priceText, setPriceText] = useState('');
  const [dueDate, setDueDate] = useState(moment().format('YYYY-MM-DD'));

  const onSubmit = async (e) => {
    e.preventDefault();

    const customNotes = `DNI: ${dni || 'N/C'} | Tel: ${phone || 'N/C'} | Concepto: ${concept}`;
    const ID_TEST_USER = "696ad284eb70ad0054a9e2a8"; 

    try {
      const response = await Axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/playerBills/create`,
        {
          playerId: ID_TEST_USER, 
          name: name.toUpperCase(), 
          plan: 'TERCEROS / EXTERNOS', 
          price: Number(price),
          priceText: priceText,
          dueDate: new Date(dueDate),
          month: `terceros-${moment().format('YYYY-MM')}`,
          additionalNotes: customNotes,
          partial: false,
        },
        { headers: { 'auth-token': localStorage.getItem('token') } }
      );

      if (response.data && (response.data.success || response.status === 200)) {
        notify.show('Boleta de tercero registrada correctamente.', 'success');
        refresh();
        onHide();
        
        const createdId = response.data?.data?._id || response.data?.id || response.data?.data?.[0]?._id;
        if (createdId) {
          askToPrint(createdId);
        }
      } else {
        notify.show(response.data?.message || 'Error al guardar', 'error');
      }
    } catch (err) {
      console.error("Error al crear boleta de terceros:", err.response?.data || err);
      notify.show(`Error: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  const req = <small className='text-danger font-weight-bold'>*</small>;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Generar Boleta para Terceros</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Nombre Completo / Razón Social{req}</Form.Label>
            <Form.Control
              required
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Ej. Juan Pérez'
            />
          </Form.Group>

          <Form.Group className="mt-2">
            <Form.Label>DNI / CUIL / CUIT (Opcional)</Form.Label>
            <Form.Control
              type='text'
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder='Ej. 20-33444555-9'
            />
          </Form.Group>

          <Form.Group className="mt-2">
            <Form.Label>Teléfono de Contacto (Opcional)</Form.Label>
            <Form.Control
              type='text'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder='Ej. 3815555555'
            />
          </Form.Group>

          <Form.Group className="mt-2">
            <Form.Label>Concepto{req}</Form.Label>
            <Form.Control
              required
              type='text'
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder='Ej. Alquiler de cancha, Seña de salón'
            />
          </Form.Group>

          <Form.Group className="mt-2">
            <Form.Label>Monto ($){req}</Form.Label>
            <Form.Control
              required
              type='number'
              value={price || ''}
              onChange={(e) => setPrice(e.target.value)}
              placeholder='0'
            />
          </Form.Group>

          <Form.Group className="mt-2">
            <Form.Label>Monto Expresado en Letras{req}</Form.Label>
            <Form.Control
              required
              type='text'
              value={priceText}
              onChange={(e) => setPriceText(e.target.value)}
              placeholder='Ej. Diez mil'
            />
          </Form.Group>

          <Form.Group className="mt-2">
            <Form.Label>Fecha de Vencimiento{req}</Form.Label>
            <Form.Control
              required
              type='date'
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={onHide}>
            Cancelar
          </Button>
          <Button variant='primary' type='submit'>
            Generar Boleta
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddThirdPartyBillForm;
