import React, { useState } from 'react';
import { ListGroup, Row, Col, Button, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPrint } from '@fortawesome/free-solid-svg-icons';
import { notify } from 'react-notify-toast';
import Axios from 'axios';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const DataList = (props) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalId, setDeleteModalId] = useState('');
  const navigate = useNavigate();

  const handleBillDelete = () => {
    const HEADERSCONFIG = {
      headers: { 'auth-token': localStorage.getItem('token') },
    };

    Axios.delete(
      `${process.env.REACT_APP_BACKEND_URL}/api/playerBills/deleteBill/${deleteModalId}`,
      HEADERSCONFIG
    )
      .then(({ data }) => {
        if (data.success) {
          setShowDeleteModal(false);
          props.refresh();
          notify.show(data.message, 'success');
        } else {
          setShowDeleteModal(false);
          props.refresh();
          notify.show(data.message, 'error');
        }
      })
      .catch((err) => {
        setShowDeleteModal(false);
        props.refresh();
        notify.show(err.message, 'error');
      });
  };

  return (
    <>
      <Modal
        centered
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(!showDeleteModal)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Borrar boleta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Estás a punto de borrar una boleta, ¿seguro que deseas continuar?{' '}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant='secondary'
            onClick={() => setShowDeleteModal(!showDeleteModal)}
          >
            Cerrar
          </Button>
          <Button variant='danger' onClick={handleBillDelete}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      <div className='mt-3 p-3 bg-light shadow rounded'>
        <ListGroup>
          <Row>
            <Col>
              <Button className='w-100' onClick={() => props.addBill()}>
                Registrar pago
              </Button>
            </Col>
            <Col>
              <Button
                className='w-100'
                onClick={() => navigate('/bills/printAll')}
              >
                Imprimir todas las boletas
              </Button>
            </Col>
          </Row>
          <ListGroup.Item className='mt-3 lead' active>
            <Row>
              <Col>Nombre</Col>
              <Col className='text-center'>Fecha</Col>

              <Col className='text-right'>Monto</Col>
              <Col md={2} className='text-right'>
                Vence
              </Col>
              <Col md={1} className='text-center' />
            </Row>
          </ListGroup.Item>
          {props.data.map((i) => {
            const player = props.clientList.filter(
              (cl) => cl._id === i.playerId
            )[0];

            return (
              <ListGroup.Item
                key={Math.random()}
                variant={i.partial ? 'info' : 'light'}
              >
                <Row>
                  <Col className='text-truncate'>{player && player.name}</Col>
                  <Col className='text-center'>
                    {moment(i.createdAt).format('L')}
                  </Col>

                  <Col className='text-right'>${i.price}</Col>
                  <Col md={2} className='text-right'>
                    {moment(i.dueDate).fromNow()}
                  </Col>
                  <Col md={1} className='text-center'>
                    <FontAwesomeIcon
                      className='text-danger'
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setDeleteModalId(i._id);
                        setShowDeleteModal(true);
                      }}
                      icon={faTrash}
                    />
                    <FontAwesomeIcon
                      className='text-info ml-2'
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/bills/print/${i._id}`)}
                      icon={faPrint}
                    />
                  </Col>
                </Row>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </div>
    </>
  );
};

export default DataList;
