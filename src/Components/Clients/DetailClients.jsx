import React, { useState, useEffect } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faUserEdit,
  faFileInvoice,
} from '@fortawesome/free-solid-svg-icons';
import Axios from 'axios';
import moment from 'moment';
import LoadingScreen from '../Layout/LoadingScreen';
import ModifyClientDetails from './ModifyClientDetail';
import { notify } from 'react-notify-toast';
import AddEditForm from '../Bills/AddEditForm';
import DeleteConfirmation from './DeleteConfirmation';
import AskForPrint from '../Bills/AskForPrints';
import { useNavigate, useParams } from 'react-router-dom';
import AccountStatus from '../AccountStatus/AccountStatus';

const DetailClients = (props) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [allClients, setAllClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addClientsModalShow, setAddClientsModalShow] = useState(false);
  const [showBills, setShowBills] = useState(false);
  const [deleteConfirmationShow, setDeleteConfirmationShow] = useState(false);
  const [askToPrintModalShow, setAskToPrintModalShow] = useState(false);
  const [idToPrint, setIdToPrint] = useState('');

  useEffect(() => {
    getClientInfo();
  }, []);

  const getClientInfo = () => {
    const singleClient = Axios.get(
      `${process.env.REACT_APP_BACKEND_URL}/api/players/get/${id}`,
      {
        headers: { 'auth-token': localStorage.getItem('token') },
      }
    );

    const allClients = Axios.get(
      `${process.env.REACT_APP_BACKEND_URL}/api/players/get/`,
      {
        headers: { 'auth-token': localStorage.getItem('token') },
      }
    );

    Axios.all([singleClient, allClients])
      .then(
        Axios.spread((singleClientRes, allClientsRes) => {
          setData(singleClientRes.data.data[0]);
          setAllClients(allClientsRes.data);
          setIsLoading(false);
        })
      )
      .catch((err) => notify.show(err.message, 'error', 3000, 'red'));
  };

  const askToPrint = (id) => {
    setAskToPrintModalShow(!askToPrintModalShow);
    setIdToPrint(id || '');
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <DeleteConfirmation
        id={id}
        goHome={() => {
          navigate('/');
        }}
        show={deleteConfirmationShow}
        onHide={() => setDeleteConfirmationShow(!deleteConfirmationShow)}
      />
      <AddEditForm
        show={showBills}
        onHide={() => setShowBills(!showBills)}
        refresh={getClientInfo}
        clientList={allClients}
        selectedClient={data}
        askToPrint={askToPrint}
      />
      <AskForPrint
        {...props}
        show={askToPrintModalShow}
        onHide={() => askToPrint('')}
        id={idToPrint}
      />

      <ModifyClientDetails
        isEdit={true}
        clientToEdit={data}
        refresh={getClientInfo}
        notify={(message, type) => notify.show(message, type, 3000, 'blue')}
        onHide={() => setAddClientsModalShow(!addClientsModalShow)}
        show={addClientsModalShow}
      />
      <Row className='mt-3'>
        <Col md={4} className='shadow bg-light rounded p-3'>
          <small className='text-muted text-uppercase'>
            Nombre del cliente:
          </small>
          <h1 className='display-4 display-5'>{data.name}</h1>
          <small className='text-danger'>
            <strong>
              {data.unSubscribingDate ? 'Socio dado de baja' : ''}
            </strong>
          </small>
        </Col>
        <Col md={3} />
        <Col
          className='shadow bg-light rounded p-3 text-center d-flex justify-content-center my-auto'
          style={{ height: 70 }}
        >
          <Button
            onClick={() => setAddClientsModalShow(!addClientsModalShow)}
            size='sm'
            className='mr-2'
          >
            <FontAwesomeIcon icon={faFileInvoice} className='mr-2' />
            Editar cliente
          </Button>
          <Button
            onClick={() => setShowBills(!showBills)}
            size='sm'
            className='mr-2'
          >
            <FontAwesomeIcon icon={faUserEdit} className='mr-2' />
            Generar pago
          </Button>
          <Button
            size='sm'
            onClick={() => setDeleteConfirmationShow(!deleteConfirmationShow)}
            variant='danger'
          >
            <FontAwesomeIcon icon={faTrash} className='mr-2' />
            Eliminar cliente
          </Button>
        </Col>
      </Row>
      <Row className='mt-3'>
        <Col md={4} className='shadow bg-light rounded p-3'>
          <small className='text-muted text-uppercase text-weigth-bold'>
            Datos principales:
          </small>
          <ul className='mt-3'>
            <li>
              <span className='text-muted'>F. de Nacimiento:</span>{' '}
              {data.birthday ? moment(data.birthday).format('L') : ''}
            </li>
            <li>
              <span className='text-muted'>Dirección:</span> {data.address}
            </li>
            <li>
              <span className='text-muted'>Teléfono:</span> {data.phone} /{' '}
              {data.phoneAlt ? data.phoneAlt : ''}
            </li>
            <li>
              <span className='text-muted'>Categoria:</span> {data.category}
            </li>
            <li>
              <span className='text-muted'>DNI:</span> {data.dni}
            </li>
          </ul>
        </Col>
        <Col className='shadow bg-light rounded p-3 ml-3 '>
          <small className='text-muted text-uppercase text-weigth-bold'>
            Datos adicionales:
          </small>
          <ul className='mt-3'>
            <li>
              <span className='text-muted'>Fecha de alta:</span>{' '}
              {moment(data.inscriptionDate).format('L')}
            </li>

            <li>
              <span className='text-muted'>Precio:</span> ${data.price}
            </li>
            <li>
              <span className='text-muted'>Obra Social:</span> {data.obraSocial}
            </li>
            <li>
              <span className='text-muted'>Grupo Sanguineo:</span>{' '}
              {data.bloodType}
            </li>
            <li>
              <span className='text-muted'>Talle Camiseta:</span>
              {data.tshirtSize}
            </li>
            <li>
              <span className='text-muted'>Talle Pantalón:</span>{' '}
              {data.shortSize}
            </li>
            <li>
              <span className='text-muted'>Apodo:</span> {data.nickName}
            </li>
          </ul>

          <div className={data.unSubscribingDate ? 'd-block' : 'd-none'}>
            <small className='text-muted text-uppercase text-weigth-bold'>
              Datos de baja:
            </small>
            <ul className='mt-3'>
              <li>
                <span className='text-muted'>Fecha de baja:</span>{' '}
                {moment(data.unSubscribingDate).format('L')}
              </li>
              <li>
                <span className='text-muted'>Motivo de baja:</span>{' '}
                {data.unSubscribingReason}
              </li>
            </ul>
          </div>
        </Col>
      </Row>
      <Row className='mt-3'>
        <Col md={12} className='shadow bg-light rounded p-3'>
          <AccountStatus player={data} onUpdate={getClientInfo} />
        </Col>
      </Row>
    </>
  );
};

export default DetailClients;
