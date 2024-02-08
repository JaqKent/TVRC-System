import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ListGroup, Row, Col } from 'react-bootstrap';
import Axios from 'axios';

import { notify } from 'react-notify-toast';
import LoadingScreen from '../Layout/LoadingScreen';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusSquare } from '@fortawesome/free-solid-svg-icons';

import Pagination from '../Layout/Pagination';
import SearchBox from './SearchBox';
import ModifyClientDetails from './ModifyClientDetail';

const ListClients = () => {
  const [fullClientsList, setFullClientsList] = useState([]);
  const [afterPaginationClientsList, setAfterPaginationClientsList] = useState(
    []
  );
  const [activeClients, setActiveClients] = useState(0);
  const [addClientsModalShow, setAddClientsModalShow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    Axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/clients/get`, {
      headers: { 'auth-token': localStorage.getItem('token') },
    })
      .then(({ data }) => {
        data = data.filter((element) => element.unSubscribingDate === null);
        data = data.sort((a, b) => a.name.localeCompare(b.name));
        setFullClientsList(data);
        setActiveClients(
          data.filter((i) => !Boolean(i.unSubscribingDate)).length
        );
        setIsLoading(false);
      })
      .catch((err) => {
        notify.show('Hubo un error, vuelva a ingresar.', 'error', 3000, 'red');
        localStorage.removeItem('token');
        navigate('/');
      });
  };

  const onChangePage = (afterPaginationClientsList) => {
    setAfterPaginationClientsList(afterPaginationClientsList);
  };

  const handleAddClientsModalShow = () => {
    setAddClientsModalShow(!addClientsModalShow);
  };

  if (isLoading) {
    return <LoadingScreen />;
  } else {
    return (
      <>
        {/* Modal para agregar clientes */}
        <ModifyClientDetails
          isEdit={false}
          refresh={getData}
          notify={(message, type) => notify.show(message, type, 3000, 'blue')}
          onHide={handleAddClientsModalShow}
          show={addClientsModalShow}
        />

        {/* Caja de búsqueda */}
        <h5 className='m-0 p-1 text-success'>
          <i> (Clientes activos: {activeClients})</i>
        </h5>

        <Row>
          <Col className='p-3 mt-3 bg-light rounded shadow'>
            <SearchBox
              setResults={(e) => setFullClientsList(e)}
              refresh={getData}
            />
          </Col>
        </Row>
        <p className='m-1 p-1 bg-light text-success text-center'>
          Agregar Cliente
          <FontAwesomeIcon
            className='ml-2 text-info'
            style={{ cursor: 'pointer' }}
            onClick={handleAddClientsModalShow}
            icon={faPlusSquare}
          />
        </p>

        {/* Lista de clientes */}
        <Row>
          <Col className='p-3 my-3 bg-light rounded shadow'>
            <Row className='px-3 mb-3'>
              <Col>
                <p className='m-0 p-0'>Nombre y Apellido</p>
              </Col>
              <Col>
                <p className='m-0 p-0 text-left'>Dirección</p>
              </Col>
              <Col md={2}>
                <p className='m-0 p-0 text-right'>Plan</p>
              </Col>
              <Col md={1}>
                <p className='m-0 p-0 text-right'>Precio</p>
              </Col>
            </Row>
            <ListGroup>
              {afterPaginationClientsList.map((i) => (
                <Link
                  className='text-decoration-none text-dark'
                  key={i._id}
                  to={`/clients/details/${i._id}`}
                >
                  <ListGroup.Item
                    className={i.unSubscribingDate ? 'text-danger' : null}
                  >
                    <Row>
                      <Col>
                        <p className='m-0 p-0'>{`${i.name} ${
                          i.unSubscribingDate ? ' (dado de baja)' : ''
                        }`}</p>
                      </Col>
                      <Col>
                        <p className='m-0 p-0'>{`${i.address} `}</p>
                      </Col>
                      <Col md={2}>
                        <p className='m-0 p-0 text-right'>{i.plan}</p>
                      </Col>
                      <Col md={1}>
                        <p className='m-0 p-0 text-right'>${i.price}</p>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                </Link>
              ))}
            </ListGroup>
          </Col>
        </Row>
        <Row>
          <Col className='p-3 mb-3 bg-light rounded shadow d-flex justify-content-center'>
            <Pagination
              items={fullClientsList}
              onChangePage={onChangePage}
              pageSize={5}
            />
          </Col>
        </Row>
      </>
    );
  }
};

export default ListClients;
