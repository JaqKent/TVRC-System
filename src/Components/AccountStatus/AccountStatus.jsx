import React, { useState, useEffect } from 'react';
import { Table, Button } from 'react-bootstrap';
import moment from 'moment';

const AccountStatus = ({ player, onUpdate }) => {
  const [history, setHistory] = useState(player.paymentHistory || []);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    setHistory(player.paymentHistory || []);
  }, [player]);

  const handleExpand = (idx) => setExpanded(expanded === idx ? null : idx);

  return (
    <div className='shadow bg-white rounded p-3 mb-3'>
      <h5>Estado de cuenta</h5>
      <div>
        <h6>Historial de pagos</h6>
        <Table size='sm' striped bordered>
          <thead>
            <tr>
              <th>Mes</th>
              <th>Estado</th>
              <th>Monto</th>
              <th>Fecha de pago</th>
              <th>Parcial</th>
              <th>Notas</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {history
              .sort(
                (a, b) =>
                  moment(b.month, 'MM/YYYY') - moment(a.month, 'MM/YYYY')
              )
              .map((h, idx) => {
                const isPartial =
                  h.partialPayments && h.partialPayments.length > 0;

                const detallePagos = isPartial
                  ? h.partialPayments
                  : h.partial
                  ? [
                      {
                        amount: h.amount || 0,
                        date: h.paymentDate,
                        notes: h.notes,
                        billId: h.billId,
                        partial: true,
                      },
                    ]
                  : [
                      {
                        amount: h.amount || player.price,
                        date: h.paymentDate,
                        notes: h.notes,
                        billId: h.billId,
                        partial: false,
                      },
                    ];

                const totalPagadoDetalle = isPartial
                  ? h.partialPayments.reduce(
                      (sum, p) => sum + Number(p.amount),
                      0
                    )
                  : h.partial
                  ? h.amount || 0
                  : h.amount || player.price;

                const estado =
                  totalPagadoDetalle >= player.price ? 'Pagado' : 'Debe';

                return (
                  <React.Fragment key={idx}>
                    <tr>
                      <td>{h.month}</td>
                      <td>{estado}</td>
                      <td>${player.price}</td>
                      <td>
                        {h.paymentDate
                          ? moment(h.paymentDate).format('DD/MM/YYYY')
                          : ''}
                      </td>
                      <td>{isPartial || h.partial ? 'Sí' : 'No'}</td>
                      <td>{h.notes || ''}</td>
                      <td>
                        <Button
                          variant='link'
                          size='sm'
                          onClick={() => handleExpand(idx)}
                        >
                          {expanded === idx ? 'Ocultar' : 'Ver'}
                        </Button>
                      </td>
                    </tr>
                    {expanded === idx && (
                      <tr>
                        <td colSpan={7}>
                          <b>Detalle del pago:</b>
                          <Table size='sm' bordered className='mt-2'>
                            <thead>
                              <tr>
                                <th>Estado</th>
                                <th>Monto</th>
                                <th>Fecha</th>
                                <th>Parcial</th>
                                <th>Nota</th>
                                <th>Boleta</th>
                              </tr>
                            </thead>
                            <tbody>
                              {detallePagos.map((p, i) => (
                                <tr key={i}>
                                  <td>
                                    {isPartial
                                      ? 'Pagado'
                                      : h.paid
                                      ? 'Pagado'
                                      : 'Debe'}
                                  </td>
                                  <td>${p.amount}</td>
                                  <td>
                                    {p.date
                                      ? moment(p.date).format('DD/MM/YYYY')
                                      : ''}
                                  </td>
                                  <td>{p.partial ? 'Parcial' : 'No'}</td>
                                  <td>{p.notes || ''}</td>
                                  <td>
                                    {p.billId && (
                                      <Button
                                        variant='outline-primary'
                                        size='sm'
                                        onClick={() =>
                                          window.open(
                                            `/playerBills/print/${p.billId}`,
                                            '_blank'
                                          )
                                        }
                                      >
                                        Ver boleta
                                      </Button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                              <tr>
                                <td>
                                  <b>Total pagado</b>
                                </td>
                                <td colSpan={5}>
                                  {totalPagadoDetalle >= player.price ? (
                                    <span
                                      style={{
                                        color: 'green',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      ${totalPagadoDetalle} / ${player.price}
                                    </span>
                                  ) : (
                                    <>
                                      ${totalPagadoDetalle} / ${player.price}
                                      <span
                                        style={{ color: 'red', marginLeft: 10 }}
                                      >
                                        Debe: $
                                        {player.price - totalPagadoDetalle}
                                      </span>
                                    </>
                                  )}
                                </td>
                              </tr>
                            </tbody>
                          </Table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default AccountStatus;
