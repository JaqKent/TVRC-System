import React, { useState } from 'react';
import { Modal, Button, Table, Tabs, Tab } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

const BalanceDetailsModal = ({
  show,
  onHide,
  paginatedPaid,
  paginatedUnpaid,
  totalRecaudado,
  selectedMonth,
  selectedYear,
  billsDelMes = [],
}) => {
  const [activeTab, setActiveTab] = useState('pagaron');

  const handleExport = () => {
    const pagadosData = paginatedPaid.map(({ player, pago }) => {
      const bill = getBillByPlayerAndMonth(player._id, pago.month);
      return {
        Socio: player.name || player.id,
        Mes: pago.month.includes('otros-conceptos')
          ? bill?.additionalNotes || '—'
          : selectedMonth,
        Año: selectedYear,
        Monto:
          typeof pago.amount === 'number'
            ? pago.amount
            : parseFloat(pago.amount),
      };
    });

    pagadosData.push({
      Socio: 'TOTAL',
      Mes: '',
      Año: '',
      Monto: totalRecaudado,
    });

    const deudoresData = paginatedUnpaid.map((player) => ({
      Socio: player.name || player.id,
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(pagadosData),
      'Pagaron'
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(deudoresData),
      'Deudores'
    );
    XLSX.writeFile(wb, `Balance_${selectedMonth}-${selectedYear}.xlsx`);
  };

  const getBillId = (playerId, month) => {
    const normalizado = moment(month, ['MM/YYYY', 'YYYY-MM']).format('MM/YYYY');
    const match = billsDelMes.find(
      (b) =>
        (b.playerId === playerId || b.playerId?._id === playerId) &&
        moment(b.month, ['MM/YYYY', 'YYYY-MM']).format('MM/YYYY') ===
          normalizado
    );
    return match?._id || null;
  };

  const getBillByPlayerAndMonth = (playerId, month) => {
    const normalizado = moment(month, ['MM/YYYY', 'YYYY-MM']).format('MM/YYYY');
    return billsDelMes.find(
      (b) =>
        (b.playerId === playerId || b.playerId?._id === playerId) &&
        (b.month.includes('otros-conceptos')
          ? moment(b.createdAt).format('MM/YYYY') === normalizado
          : moment(b.month, ['MM/YYYY', 'YYYY-MM']).format('MM/YYYY') ===
            normalizado)
    );
  };

  return (
    <Modal show={show} onHide={onHide} size='lg'>
      <Modal.Header closeButton>
        <Modal.Title>
          Detalles del Balance {selectedMonth}/{selectedYear}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className='mb-3'
        >
          <Tab eventKey='pagaron' title={`Pagaron (${paginatedPaid.length})`}>
            <Table striped bordered hover size='sm'>
              <thead>
                <tr>
                  <th>Socio</th>
                  <th>Boleta</th>
                  <th>Mes/Año</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPaid.map(({ player, pago }, idx) => {
                  const billId = getBillId(player._id, pago.month);
                  const bill = getBillByPlayerAndMonth(player._id, pago.month);
                  return (
                    <tr key={idx}>
                      <td>{player.name || player.id}</td>
                      <td>
                        {billId && (
                          <Button
                            variant='outline-primary'
                            size='sm'
                            onClick={() =>
                              window.open(
                                `/playerBills/print/${billId}`,
                                '_blank'
                              )
                            }
                          >
                            Ver boleta
                          </Button>
                        )}
                      </td>
                      <td>
                        {pago.month.includes('otros-conceptos')
                          ? bill?.additionalNotes || '—'
                          : pago.month}
                      </td>
                      <td>
                        $
                        {(typeof pago.amount === 'number'
                          ? pago.amount
                          : parseFloat(pago.amount)
                        ).toLocaleString('es-AR')}
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  <td colSpan={3}>
                    <strong>Total</strong>
                  </td>
                  <td>
                    <strong>${totalRecaudado.toLocaleString('es-AR')}</strong>
                  </td>
                </tr>
              </tbody>
            </Table>
          </Tab>

          <Tab
            eventKey='deudores'
            title={`Deudores (${paginatedUnpaid.length})`}
          >
            <Table striped bordered hover size='sm'>
              <thead>
                <tr>
                  <th>Socio</th>
                  <th>Boleta</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUnpaid.map((player, idx) => {
                  const mesFormateado = String(selectedMonth).padStart(2, '0');
                  const billId = getBillId(
                    player._id,
                    `${mesFormateado}/${selectedYear}`
                  );
                  return (
                    <tr key={idx}>
                      <td>{player.name || player.id}</td>
                      <td>
                        {billId && (
                          <Button
                            variant='outline-primary'
                            size='sm'
                            onClick={() =>
                              window.open(
                                `/playerBills/print/${billId}`,
                                '_blank'
                              )
                            }
                          >
                            Ver boleta
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={handleExport}>
          Imprimir balance
        </Button>
        <Button variant='outline-secondary' onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BalanceDetailsModal;
