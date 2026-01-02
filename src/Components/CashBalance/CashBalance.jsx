/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Form } from 'react-bootstrap';
import Axios from 'axios';
import LoadingScreen from '../Layout/LoadingScreen';
import ExportBalanceExcel from './ExportBalanceExcel';
import BalanceDetailsModal from './BalanceDetailsModal';
import moment from 'moment';
import 'moment/locale/es';

const CashBalance = () => {
  const [players, setPlayers] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [paginatedPaid, setPaginatedPaid] = useState([]);
  const [paginatedUnpaid, setPaginatedUnpaid] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [totalRecaudado, setTotalRecaudado] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [billsDelMes, setBillsDelMes] = useState([]);
  const [filterMode, setFilterMode] = useState('abonos');

  const getAvailableMonthsAndYears = (players) => {
    const mesesSet = new Set();
    const añosSet = new Set();

    players.forEach((player) => {
      if (!Array.isArray(player.paymentHistory)) return;

      player.paymentHistory.forEach((pago) => {
        if (!pago.paid || !pago.month) return;

        if (pago.month.includes('otros-conceptos')) {
          const fecha = moment(pago.createdAt);
          mesesSet.add(fecha.format('MM'));
          añosSet.add(fecha.format('YYYY'));
        } else {
          const [mes, año] = pago.month.split('/');
          if (mes && año) {
            mesesSet.add(mes.trim());
            añosSet.add(año.trim());
          }
        }
      });
    });

    return {
      meses: Array.from(mesesSet).sort((a, b) => parseInt(a) - parseInt(b)),
      años: Array.from(añosSet).sort((a, b) => parseInt(a) - parseInt(b)),
    };
  };

  const fetchBillsDelMes = async (mes, año) => {
    try {
      const res = await Axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/playerBills/get`,
        {
          headers: { 'auth-token': localStorage.getItem('token') },
        }
      );

      if (res.data.success) {
        const normalizado = `${String(mes).padStart(2, '0')}/${año}`;
        const filtradas = res.data.data.filter((b) => {
          if (filterMode === 'otros') {
            if (!b.month.includes('otros-conceptos')) return false;
            const fecha = moment(b.createdAt);
            return fecha.format('MM/YYYY') === normalizado;
          } else {
            const billMes = moment(b.month, ['MM/YYYY', 'YYYY-MM']).format(
              'MM/YYYY'
            );
            return billMes === normalizado;
          }
        });

        setBillsDelMes(filtradas);
      }
    } catch (err) {
      console.error('Error al cargar boletas del mes:', err);
      setBillsDelMes([]);
    }
  };

  const filterPlayers = () => {
    if (!selectedMonth || !selectedYear) {
      setPaginatedPaid([]);
      setPaginatedUnpaid([]);
      setTotalRecaudado(0);
      return;
    }

    const mesSeleccionado = parseInt(selectedMonth, 10);
    const añoSeleccionado = parseInt(selectedYear, 10);

    const activos = players.filter(
      (p) => !p.unSubscribingDate && !p.unSubscribingReason?.trim()
    );

    const pagados = [];
    const noPagados = [];
    let total = 0;

    activos.forEach((player) => {
      const pagosDelMes =
        player.paymentHistory?.filter((pago) => {
          if (!pago.paid || !pago.month) return false;

          if (filterMode === 'otros') {
            if (!pago.month.includes('otros-conceptos')) return false;
            const fecha = moment(pago.createdAt);
            const mes = parseInt(fecha.format('MM'), 10);
            const anio = parseInt(fecha.format('YYYY'), 10);
            return mes === mesSeleccionado && anio === añoSeleccionado;
          } else {
            if (pago.month.includes('otros-conceptos')) return false;
            const [mesStr, anioStr] = pago.month.trim().split('/');
            const mes = parseInt(mesStr.trim(), 10);
            const anio = parseInt(anioStr.trim(), 10);
            return mes === mesSeleccionado && anio === añoSeleccionado;
          }
        }) || [];

      if (pagosDelMes.length > 0) {
        pagosDelMes.forEach((pago) => {
          pagados.push({ player, pago });
          const monto =
            typeof pago.amount === 'number'
              ? pago.amount
              : parseFloat(pago.amount);
          total += isNaN(monto) ? 0 : monto;
        });
      } else {
        if (filterMode === 'abonos') {
          noPagados.push(player);
        }
      }
    });

    setPaginatedPaid(pagados);
    setPaginatedUnpaid(noPagados);
    setTotalRecaudado(total);
    fetchBillsDelMes(mesSeleccionado, añoSeleccionado);
  };

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const { data } = await Axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/players/get`,
          {
            headers: { 'auth-token': localStorage.getItem('token') },
          }
        );

        setPlayers(data);

        const { meses, años } = getAvailableMonthsAndYears(data);
        setAvailableMonths(meses);
        setAvailableYears(años);
        setIsLoading(false);
      } catch (err) {
        console.error('Error al cargar socios:', err);
        setIsLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <Row className='p-3 mt-3 bg-light rounded shadow align-items-center'>
        <Col md={3}>
          <Form.Group controlId='selectMonth'>
            <Form.Label>Mes</Form.Label>
            <Form.Control
              as='select'
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value=''>Seleccionar mes</option>
              {availableMonths.map((mes) => (
                <option key={mes} value={mes}>
                  {new Date(0, mes - 1).toLocaleString('es-AR', {
                    month: 'long',
                  })}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group controlId='selectYear'>
            <Form.Label>Año</Form.Label>
            <Form.Control
              as='select'
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value=''>Seleccionar año</option>
              {availableYears.map((año) => (
                <option key={año} value={año}>
                  {año}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group controlId='filterMode'>
            <Form.Label>Modo</Form.Label>
            <Form.Check
              type='switch'
              id='mode-switch'
              label={filterMode === 'abonos' ? 'Abonos' : 'Otros conceptos'}
              checked={filterMode === 'otros'}
              onChange={(e) =>
                setFilterMode(e.target.checked ? 'otros' : 'abonos')
              }
            />
          </Form.Group>
        </Col>

        <Col md={3}>
          <Button className='mt-3' variant='primary' onClick={filterPlayers}>
            Buscar
          </Button>
        </Col>
      </Row>

      <Row className='p-3 my-3 bg-light rounded shadow text-center'>
        <Col>
          <h5 className='mb-0'>Pagos válidos</h5>
          <h2 className='text-success'>{paginatedPaid.length}</h2>
        </Col>
        <Col>
          <h5 className='mb-0'>No pagaron</h5>
          <h2 className='text-danger'>{paginatedUnpaid.length}</h2>
        </Col>
      </Row>

      <Row className='p-3 mb-3 bg-white rounded shadow '>
        <Col md={12} className='d-flex justify-content-around   gap-3 mb-3'>
          <ExportBalanceExcel
            paginatedPaid={paginatedPaid}
            paginatedUnpaid={paginatedUnpaid}
            totalRecaudado={totalRecaudado}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            disabled={
              paginatedPaid.length === 0 && paginatedUnpaid.length === 0
            }
          />

          <Button
            variant='danger'
            onClick={() => (window.location.href = 'players/list-debtors')}
          >
            Ver deudores
          </Button>
        </Col>

        <Col md={12} className='text-center'>
          <h5 className='mb-1'>
            {selectedMonth && selectedYear
              ? `${new Date(
                  parseInt(selectedYear),
                  parseInt(selectedMonth) - 1
                ).toLocaleString('es-AR', {
                  month: 'long',
                  year: 'numeric',
                })}`
              : 'Mes y año no seleccionados'}
          </h5>
          <h4 className='text-primary'>
            Total recaudado: $
            {totalRecaudado.toLocaleString('es-AR', {
              minimumFractionDigits: 2,
            })}
          </h4>
        </Col>

        <Col md={12} className='text-center mt-3'>
          <Button variant='info' onClick={() => setShowDetails(true)}>
            Ver detalles
          </Button>
        </Col>
      </Row>

      <BalanceDetailsModal
        show={showDetails}
        onHide={() => setShowDetails(false)}
        paginatedPaid={paginatedPaid}
        paginatedUnpaid={paginatedUnpaid}
        totalRecaudado={totalRecaudado}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        billsDelMes={billsDelMes}
      />
    </>
  );
};

export default CashBalance;
