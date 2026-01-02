import React, { useState, useEffect } from 'react';
import { Table, Button, Modal } from 'react-bootstrap';
import moment from 'moment';
import 'moment/locale/es';
import Axios from 'axios';

moment.locale('es');

const AccountStatus = ({ player, onUpdate }) => {
  const [history, setHistory] = useState(player.paymentHistory || []);
  const [expanded, setExpanded] = useState(null);
  const [bills, setBills] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentDateInput, setPaymentDateInput] = useState('');
  const [isLatePayment, setIsLatePayment] = useState(false);
  const [amountInput, setAmountInput] = useState('');

  useEffect(() => {
    setHistory(player.paymentHistory || []);

    const fetchBills = async () => {
      try {
        const res = await Axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/playerBills/search`,
          { playerId: player._id },
          { headers: { 'auth-token': localStorage.getItem('token') } }
        );

        if (res.data.success) {
          setBills(res.data.data || []);
        }
      } catch (err) {
        console.error('Error al buscar boletas:', err);
      }
    };

    fetchBills();
  }, [player]);

  const handleExpand = (idx) => setExpanded(expanded === idx ? null : idx);

  const openConfirmModal = (payment) => {
    setSelectedPayment(payment);
    setPaymentDateInput(
      payment.paymentDate
        ? moment(payment.paymentDate).format('YYYY-MM-DD')
        : ''
    );
    setIsLatePayment(false);
    setAmountInput('');
    setShowConfirmModal(true);
  };

  const confirmPayment = async () => {
    if (!selectedPayment) return;

    try {
      await Axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/players/confirm-payment`,
        {
          playerId: player._id,
          month: selectedPayment.month,
          finalDate: paymentDateInput
            ? new Date(`${paymentDateInput}T12:00:00`)
            : null,
          amount: isLatePayment ? Number(amountInput) : undefined,
        },
        { headers: { 'auth-token': localStorage.getItem('token') } }
      );

      setShowConfirmModal(false);
      setSelectedPayment(null);
      onUpdate?.();
    } catch (err) {
      console.error('Error al confirmar pago:', err);
    }
  };

  const getBillIdForMonth = (mes) => {
    const normalizado = moment(mes, ['MM/YYYY', 'YYYY-MM']).format('MM/YYYY');

    const match = bills.find(
      (b) =>
        moment(b.month, ['MM/YYYY', 'YYYY-MM']).format('MM/YYYY') ===
          normalizado && b.playerId === player._id
    );

    return match?._id || null;
  };

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
              <th>Fecha de emisión</th>
              <th>Parcial</th>
              <th>Notas</th>
              <th>Detalle</th>
              <th>Confirmar</th>
            </tr>
          </thead>
          <tbody>
            {history
              .sort((a, b) => moment(b.paymentDate).diff(moment(a.paymentDate)))
              .map((h, idx) => {
                const isPartial =
                  h.partialPayments && h.partialPayments.length > 0;
                const esOtroConcepto =
                  h.month?.startsWith('otros-conceptos') || h.month === '';

                const totalPagado = isPartial
                  ? h.partialPayments.reduce(
                      (sum, p) => sum + Number(p.amount),
                      0
                    )
                  : Number(h.amount);

                const estado = h.paid === true ? 'Pagado' : 'Debe';

                return (
                  <React.Fragment key={idx}>
                    <tr>
                      <td>
                        {esOtroConcepto
                          ? '-'
                          : moment(h.month, ['MM/YYYY', 'YYYY-MM'])
                              .format('MMMM [de] YYYY')
                              .replace(/^./, (c) => c.toUpperCase())}
                      </td>
                      <td>{estado}</td>
                      <td>${h.amount ?? '-'}</td>
                      <td>
                        {h.paymentDate
                          ? moment(h.paymentDate)
                              .format('D [de] MMMM [de] YYYY')
                              .replace(/^./, (c) => c.toUpperCase())
                          : ''}
                      </td>
                      <td>{isPartial || h.partial ? 'Sí' : 'No'}</td>
                      <td>
                        {h.notes?.length > 40 ? (
                          <details>
                            <summary>Ver nota</summary>
                            <div>{h.notes}</div>
                          </details>
                        ) : (
                          h.notes || ''
                        )}
                      </td>
                      <td>
                        <Button
                          variant='link'
                          size='sm'
                          onClick={() => handleExpand(idx)}
                        >
                          {expanded === idx ? 'Ocultar' : 'Ver'}
                        </Button>
                      </td>
                      <td>
                        <Button
                          variant={
                            h.paid ? 'outline-danger' : 'outline-success'
                          }
                          size='sm'
                          onClick={() => openConfirmModal(h)}
                        >
                          {h.paid ? 'Anular pago' : 'Confirmar pago'}
                        </Button>
                      </td>
                    </tr>
                    {expanded === idx && (
                      <tr>
                        <td colSpan={7}>
                          <Table size='sm' bordered className='mt-2'>
                            <thead>
                              <tr>
                                <th>Estado</th>
                                <th>Monto</th>
                                <th>Fecha de pago</th>
                                <th>Boleta</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>{estado}</td>
                                <td>${totalPagado}</td>
                                <td>
                                  {h.finalDate && moment(h.finalDate).isValid()
                                    ? moment(h.finalDate)
                                        .format('D [de] MMMM [de] YYYY')
                                        .replace(/^./, (c) => c.toUpperCase())
                                    : 'Pendiente'}
                                </td>
                                <td>
                                  {getBillIdForMonth(h.month) && (
                                    <Button
                                      variant='outline-primary'
                                      size='sm'
                                      onClick={() =>
                                        window.open(
                                          `/bills/print/${getBillIdForMonth(
                                            h.month
                                          )}`,
                                          '_blank'
                                        )
                                      }
                                    >
                                      Ver boleta
                                    </Button>
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

      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Está seguro que desea{' '}
            {selectedPayment?.paid ? 'anular' : 'confirmar'} el pago del mes{' '}
            <strong>
              {selectedPayment?.month?.startsWith('otros-conceptos')
                ? 'Otros conceptos'
                : moment(selectedPayment?.month, ['MM/YYYY', 'YYYY-MM'])
                    .format('MMMM [de] YYYY')
                    .replace(/^./, (c) => c.toUpperCase())}
            </strong>{' '}
            del socio <strong>{player.name}</strong>?
          </p>

          <div className='mt-3'>
            <label>Fecha de pago:</label>
            <input
              type='date'
              className='form-control'
              value={paymentDateInput}
              onChange={(e) => setPaymentDateInput(e.target.value)}
            />
          </div>

          <div className='form-check mt-3'>
            <input
              type='checkbox'
              className='form-check-input'
              id='latePaymentCheck'
              checked={isLatePayment}
              onChange={(e) => setIsLatePayment(e.target.checked)}
            />
            <label className='form-check-label' htmlFor='latePaymentCheck'>
              ¿Es un pago vencido?
            </label>
          </div>

          {isLatePayment && (
            <div className='mt-3'>
              <label>Nuevo importe con recargo:</label>
              <input
                type='number'
                className='form-control'
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
              />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant='secondary'
            onClick={() => setShowConfirmModal(false)}
          >
            Cancelar
          </Button>
          <Button variant='primary' onClick={confirmPayment}>
            {selectedPayment?.paid ? 'Anular pago' : 'Confirmar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AccountStatus;
