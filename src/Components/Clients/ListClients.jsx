import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ListGroup, Row, Col, Button } from 'react-bootstrap';
import Axios from 'axios';

import { notify } from 'react-notify-toast';
import LoadingScreen from '../Layout/LoadingScreen';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusSquare } from '@fortawesome/free-solid-svg-icons';

import Pagination from '../Layout/Pagination';
import SearchBox from './SearchBox';
import ModifyClientDetails from './ModifyClientDetail';
import Papa from 'papaparse';

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
    Axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/players/get`, {
      headers: { 'auth-token': localStorage.getItem('token') },
    })
      .then(({ data }) => {
        data = data.filter((element) => element.unSubscribingDate === null);
        data = data.sort((a, b) => a.name.localeCompare(b.name));
        setFullClientsList(data);
        setAfterPaginationClientsList(data);
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

  const downloadCSV = () => {
    const formattedData = fullClientsList.map(
      ({
        _id,
        createdAt,
        updatedAt,
        unSubscribingReason,
        unSubscribingDate,
        createdBy,
        priceText,
        ...rest
      }) => ({
        Nombre: rest.name,
        Categoria: rest.category,
        Direccion: rest.address,
        DNI: rest.dni,
        'Fecha de Nacimiento': rest.birthday?.$date,
        Apodo: rest.nickName,
        'Fecha de Inscripcion': rest.inscriptionDate?.$date,
        Cuota: rest.price,
        Telefono: rest.phone,
        'Telefono Alternativo': rest.phoneAlt,
        Email: rest.email,
        'Obra Social': rest.obraSocial,
        'Tipo de Sangre': rest.bloodType,
        'Talla de Camiseta': rest.tshirtSize,
        'Talla de Pantalon': rest.shortSize,
      })
    );

    const csv = Papa.unparse(formattedData, {
      header: true,
      delimiter: ';',
      quotes: true,
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'jugadores_activos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <i> (Socios activos: {activeClients})</i>
        </h5>

        <Row>
          <Col className='p-3 mt-3 bg-light rounded shadow'>
            <SearchBox
              setResults={(e) => setFullClientsList(e)}
              refresh={getData}
            />
          </Col>
        </Row>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant='primary'
            style={{ cursor: 'pointer', margin: '1rem 0 0 0' }}
            onClick={handleAddClientsModalShow}
          >
            Agregar Socio {''}
            <FontAwesomeIcon icon={faPlusSquare} />
          </Button>
          <Button
            style={{ cursor: 'pointer', margin: '1rem 0 0 0' }}
            onClick={downloadCSV}
          >
            Descargar Excel
          </Button>
        </div>

        {/* Lista de clientes */}
        <Row>
          <Col className='p-3 my-3 bg-light rounded shadow'>
            <Row className='px-3 mb-3'>
              <Col md={4}>
                <p className='m-0 p-0'>Nombre y Apellido</p>
              </Col>
              <Col md={2}>
                <p className='m-0 p-0 text-left'>DNI</p>
              </Col>
              <Col md={2}>
                <p className='m-0 p-0 text-center'>Categoria</p>
              </Col>
              <Col md={2}>
                <p className='m-0 p-0 text-right'>Cuota</p>
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
                      <Col md={4}>
                        <p className='m-0 p-0'>{`${i.name} ${
                          i.unSubscribingDate ? ' (dado de baja)' : ''
                        }`}</p>
                      </Col>
                      <Col md={2}>
                        <p className='m-0 p-0'>{i.dni}</p>
                      </Col>
                      <Col md={2}>
                        <p className='m-0 p-0 text-right'>{i.category}</p>
                      </Col>
                      <Col md={2}>
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
