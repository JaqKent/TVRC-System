import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import Axios from 'axios';
import { notify } from 'react-notify-toast';
import { useNavigate } from 'react-router-dom';

const DeleteConfirmation = (props) => {
  const navigate = useNavigate();

  const deleteClient = () => {
    Axios.delete(
      `${process.env.REACT_APP_BACKEND_URL}/api/players/delete/${props.id}`,
      {
        headers: { 'auth-token': localStorage.getItem('token') },
      }
    ).then((i) => {
      if (i.data.success) {
        notify.show(i.data.message, 'success', 3000, 'green');
        navigate('/');
      } else {
        notify.show(i.data.message, 'error', 3000, 'red');
        props.onHide();
      }
    });
  };

  return (
    <Modal centered show={props.show} onHide={props.onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Borrar cliente</Modal.Title>
      </Modal.Header>
      <Modal.Body>¿Seguro que querés borrar el cliente?</Modal.Body>
      <Modal.Footer>
        <Button variant='primary' onClick={props.onHide}>
          Cerrar
        </Button>
        <Button variant='danger' onClick={deleteClient}>
          Borrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmation;
