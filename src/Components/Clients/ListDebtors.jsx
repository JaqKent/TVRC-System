/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListGroup, Row, Col, Button } from 'react-bootstrap';
import Axios from 'axios';
import LoadingScreen from '../Layout/LoadingScreen';
import Pagination from '../Layout/Pagination';
import SearchBox from './SearchBox';
import Papa from 'papaparse';

const ListDebtorsPlayer = () => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [paginatedPlayers, setPaginatedPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getPlayers();
  }, []);

  useEffect(() => {
    setPaginatedPlayers(filteredPlayers.slice(0, 5));
  }, [filteredPlayers]);

  const parseMonthString = (monthStr) => {
    if (!monthStr) return null;
    const [month, year] = monthStr.split('/').map(Number);
    if (!month || !year) return null;
    return new Date(year, month - 1);
  };

  const getDebtStatus = (paymentHistory = []) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();
    const currentIndex = currentYear * 12 + currentMonth;

    const pagosOrdenados = paymentHistory
      .filter((p) => p.paid && p.month)
      .sort((a, b) => {
        const fechaA = parseMonthString(a.month);
        const fechaB = parseMonthString(b.month);
        return fechaB?.getTime() - fechaA?.getTime();
      });

    const ultimoPago = pagosOrdenados[0];
    if (!ultimoPago) return 'Moroso';

    const fechaPago = parseMonthString(ultimoPago.month);
    if (!fechaPago) return 'Moroso';

    const pagoIndex = fechaPago.getFullYear() * 12 + fechaPago.getMonth();
    const diferencia = currentIndex - pagoIndex;

    if (diferencia === 0) return 'Al día';
    if (diferencia === 1 && currentDay <= 10) return 'Al día';
    if (diferencia === 1 && currentDay > 10) return 'Vencido';
    if (diferencia === 2) return 'Deudor';
    return 'Moroso';
  };

  const getPlayers = async () => {
    try {
      const { data } = await Axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/players/get`,
        {
          headers: { 'auth-token': localStorage.getItem('token') },
        }
      );

      const activePlayers = data.filter((p) => p.unSubscribingDate === null);

      const withStatus = activePlayers.map((player) => {
        const estado = getDebtStatus(player.paymentHistory || []);
        return { ...player, debtStatus: estado };
      });

      const onlyDebtors = withStatus.filter((p) =>
        ['Vencido', 'Deudor', 'Moroso'].includes(p.debtStatus)
      );

      setPlayers(onlyDebtors);
      setFilteredPlayers(onlyDebtors);
      setIsLoading(false);
    } catch (err) {
      console.error('Error al obtener jugadores:', err);
      setIsLoading(false);
    }
  };

  const onChangePage = (items) => {
    setPaginatedPlayers(items);
  };

  const downloadCSV = () => {
    const formatted = filteredPlayers.map(({ paymentHistory, ...player }) => {
      const ultimoPago = paymentHistory?.length
        ? parseMonthString(paymentHistory[0].month)
        : null;

      const mesFacturado =
        ultimoPago && !isNaN(ultimoPago.getTime())
          ? `${ultimoPago.getMonth() + 1}/${ultimoPago.getFullYear()}`
          : 'Sin registro';

      return {
        Nombre: player.name,
        Dirección: player.address,
        Plan: player.plan,
        Precio: player.price,
        EstadoDeuda: player.debtStatus,
        'Último mes facturado': mesFacturado,
      };
    });

    const csv = Papa.unparse(formatted, {
      header: true,
      delimiter: ';',
      quotes: true,
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Jugadores_con_deuda.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <Row>
        <Col className='p-3 mt-3 bg-light rounded shadow'>
          <SearchBox
            setResults={(results) => {
              const withStatus = results
                .filter((p) => p.unSubscribingDate === null)
                .map((player) => {
                  const estado = getDebtStatus(player.paymentHistory || []);
                  return { ...player, debtStatus: estado };
                });

              const onlyDebtors = withStatus.filter((p) =>
                ['Vencido', 'Deudor', 'Moroso'].includes(p.debtStatus)
              );

              setFilteredPlayers(onlyDebtors);
              setPaginatedPlayers(onlyDebtors.slice(0, 5));
            }}
            refresh={getPlayers}
          />

          <Button variant='success' className='mt-3' onClick={downloadCSV}>
            Descargar Excel
          </Button>
        </Col>
      </Row>

      <Row>
        <Col className='p-3 my-3 bg-light rounded shadow'>
          <Row className='px-3 mb-3'>
            <Col>
              <p className='m-0 p-0'>Nombre</p>
            </Col>
            <Col>
              <p className='m-0 p-0'>Estado</p>
            </Col>
            <Col>
              <p className='m-0 p-0 text-right'>Plan</p>
            </Col>
            <Col md={2}>
              <p className='m-0 p-0 text-right'>Monto</p>
            </Col>
          </Row>

          <ListGroup>
            {paginatedPlayers.map((player) => (
              <Link
                key={player._id}
                className='text-decoration-none text-dark'
                to={`/clients/details/${player._id}`}
              >
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <p className='m-0 p-0'>{player.name}</p>
                    </Col>
                    <Col>
                      <p
                        className={`m-0 p-0 fw-bolder ${
                          player.debtStatus === 'Moroso'
                            ? 'text-danger'
                            : player.debtStatus === 'Vencido'
                            ? 'text-dark'
                            : ''
                        }`}
                        style={
                          player.debtStatus === 'Deudor'
                            ? { color: '#ff9113ff', fontWeight: 'bolder' }
                            : undefined
                        }
                      >
                        {player.debtStatus}
                      </p>
                    </Col>
                    <Col>
                      <p className='m-0 p-0 text-right'>{player.plan}</p>
                    </Col>
                    <Col md={2}>
                      <p className='m-0 p-0 text-right'>${player.price}</p>
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
            items={filteredPlayers}
            onChangePage={onChangePage}
            pageSize={5}
          />
        </Col>
      </Row>
    </>
  );
};

export default ListDebtorsPlayer;
