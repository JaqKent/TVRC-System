import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const AskForPrint = (props) => {
  const navigate = useNavigate();

  const print = () => {
    navigate(`/playerBills/print/${props.id}`);
    props.onHide();
  };

  return (
    <Modal show={props.show} onHide={props.onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Imprimir boleta</Modal.Title>
      </Modal.Header>
      <Modal.Body>¿Deseas imprimir / enviar por correo la boleta?</Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={props.onHide}>
          Cerrar
        </Button>
        <Button variant='primary' onClick={print}>
          Aceptar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AskForPrint;
