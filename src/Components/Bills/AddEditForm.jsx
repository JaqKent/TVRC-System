import React, { useState, useEffect } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import Axios from 'axios';
import moment from 'moment';
import { notify } from 'react-notify-toast';

const AddEditForm = (props) => {
  const [dueDate, setDueDate] = useState(new Date());
  const [playerId, setPlayerId] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [priceText, setPriceText] = useState('');
  const [month, setMonth] = useState(moment().add(10, 'd').format('L'));
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [partial, setPartial] = useState(false);

  useEffect(() => {
    if (props.selectedClient) {
      setPlayerId(props.selectedClient._id);
      setName(props.selectedClient.name);
      setPrice(props.selectedClient.price);
      setPriceText(props.selectedClient.priceText);
      setDueDate(props.selectedClient.dueDate);
    }
  }, [props]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'playerId':
        setPlayerId(value);
        break;
      case 'partial':
        setPartial(!partial);
        break;
      case 'dueDate':
        setDueDate(value);
        break;
      case 'price':
        setPrice(value);
        break;
      case 'priceText':
        setPriceText(value);
        break;
      case 'month':
        setMonth(value);
        break;
      case 'additionalNotes':
        setAdditionalNotes(value);
        break;
      default:
        break;
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await Axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/playerBills/create`,
        {
          dueDate,
          playerId,
          name,
          price,
          priceText,
          month,
          additionalNotes,
          partial,
        },
        { headers: { 'auth-token': localStorage.getItem('token') } }
      );
      if (response.data.success) {
        notify.show(response.data.message, 'success');
        props.refresh();
        props.askToPrint(response.data.id);
        props.onHide();
      } else {
        notify.show(response.data.message, 'error');
      }
    } catch (error) {
      notify.show(error.message, 'error');
    }
  };

  return (
    <Modal show={props.show} onHide={props.onHide}>
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Registrar un pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              as='select'
              required
              value={playerId}
              onChange={handleChange}
              name='playerId'
            >
              <option value=''>Seleccione un jugador...</option>
              {props.clientList.map((player) => (
                <option key={player._id} value={player._id}>
                  {player.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group>
            <Form.Check
              type='checkbox'
              label='Es pago parcial'
              checked={partial}
              onChange={() => setPartial(!partial)}
              name='partial'
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Fecha de vencimiento</Form.Label>
            <Form.Control
              required
              type='date'
              value={dueDate}
              onChange={handleChange}
              name='dueDate'
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Precio</Form.Label>
            <Form.Control
              required
              type='number'
              value={price}
              onChange={handleChange}
              name='price'
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Precio (expresado verbalmente)</Form.Label>
            <Form.Control
              required
              type='text'
              value={priceText}
              onChange={handleChange}
              name='priceText'
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Mes a cobrar</Form.Label>
            <Form.Control
              required
              type='month'
              value={month}
              onChange={handleChange}
              name='month'
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Notas adicionales</Form.Label>
            <Form.Control
              type='text'
              value={additionalNotes}
              onChange={handleChange}
              name='additionalNotes'
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={props.onHide}>
            Cerrar
          </Button>
          <Button variant='primary' type='submit'>
            Guardar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddEditForm;
