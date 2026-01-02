import { useState, useEffect } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import Axios from 'axios';
import moment from 'moment';
import { notify } from 'react-notify-toast';

const AddEditForm = (props) => {
  const [dueDate, setDueDate] = useState(new Date());
  const [playerId, setPlayerId] = useState('');
  const [name, setName] = useState('');
  const [plan, setPlan] = useState('');
  const [price, setPrice] = useState(0);
  const [priceText, setPriceText] = useState('');
  const [month, setMonth] = useState(moment().add(10, 'd').format('L'));
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [partial, setPartial] = useState(false);
  const [otrosConceptos, setOtrosConceptos] = useState(false);
  const [adelantarPagos, setAdelantarPagos] = useState(false);

  useEffect(() => {
    if (props.selectedPlayer && typeof props.selectedPlayer === 'object') {
      setPlayerId(props.selectedPlayer._id || '');
      setName(props.name || '');
      setPlan(props.plan || '');
      setPrice(props.selectedPlayer.price || 0);
      setPriceText(props.selectedPlayer.priceText || '');

      const fechaValida = props.selectedPlayer.dueDate
        ? new Date(props.selectedPlayer.dueDate)
        : new Date();

      setDueDate(fechaValida);
    }
  }, [props]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    switch (name) {
      case 'playerId':
        setPlayerId(value);
        break;
      case 'partial':
        setPartial(!partial);
        break;
      case 'dueDate':
        setDueDate(new Date(value));
        break;
      case 'price':
        setPrice(value);
        break;
      case 'priceText':
        setPriceText(value);
        break;
      case 'month':
        setMonth(value);
        break;
      case 'additionalNotes':
        setAdditionalNotes(value);
        break;
      default:
        break;
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const selectedPlayerData = props.playerList.find(
        (p) => p._id === playerId
      );
      if (!selectedPlayerData) {
        notify.show('Socio no válido o no encontrado.', 'error');
        return;
      }

      const playerPrice = selectedPlayerData.price;
      const mesesPagados = Math.floor(price / playerPrice);
      const resto = price % playerPrice;

      if (
        !otrosConceptos &&
        adelantarPagos &&
        (mesesPagados > 1 || (mesesPagados === 1 && resto > 0))
      ) {
        const confirmar = window.confirm(
          `El monto cubre ${mesesPagados} mes(es) completo(s)` +
            (resto > 0 ? ` y un pago parcial de $${resto}` : '') +
            `. ¿Desea registrar los meses adelantados?`
        );
        if (!confirmar) return;
      }

      let pagos = [];
      let mesActual = moment(month, 'YYYY-MM');

      if (otrosConceptos) {
        pagos.push({
          month: `otros-conceptos-${moment().format('YYYY-MM')}-${Date.now()}`,
          amount: price,
          paid: false,
          paymentDate: dueDate,
          notes: additionalNotes + ' (Otros conceptos)',
          partial: false,
          partialPayments: [],
        });
      } else if (adelantarPagos) {
        for (let i = 0; i < mesesPagados; i++) {
          pagos.push({
            month: mesActual.format('MM/YYYY'),
            amount: playerPrice,
            paid: false,
            paymentDate: dueDate,
            notes: additionalNotes,
            partial: false,
            partialPayments: [],
          });
          mesActual = mesActual.add(1, 'month');
        }

        if (resto > 0) {
          pagos.push({
            month: mesActual.format('MM/YYYY'),
            amount: resto,
            paid: false,
            paymentDate: dueDate,
            notes: additionalNotes,
            partial: true,
            partialPayments: [
              {
                amount: resto,
                date: dueDate,
                notes: additionalNotes,
              },
            ],
          });
        }

        if (pagos.length === 0) {
          pagos.push({
            month: moment(month, 'YYYY-MM').format('MM/YYYY'),
            amount: price,
            paid: false,
            paymentDate: dueDate,
            notes: additionalNotes,
            partial: partial,
            partialPayments: partial
              ? [
                  {
                    amount: price,
                    date: dueDate,
                    notes: additionalNotes,
                  },
                ]
              : [],
          });
        }
      } else {
        pagos.push({
          month: moment(month, 'YYYY-MM').format('MM/YYYY'),
          amount: price,
          paid: false,
          paymentDate: dueDate,
          notes: additionalNotes,
          partial: partial,
          partialPayments: partial
            ? [
                {
                  amount: price,
                  date: dueDate,
                  notes: additionalNotes,
                },
              ]
            : [],
        });
      }

      for (const pago of pagos) {
        await Axios.put(
          `${process.env.REACT_APP_BACKEND_URL}/api/players/payment/${playerId}`,
          {
            month: pago.month,
            amount: pago.amount,
            paid: pago.paid,
            paymentDate: pago.paymentDate,
            notes: pago.notes,
            partial: pago.partial,
            ...(pago.partial &&
              pago.partialPayments?.length > 0 && {
                partialPayment: {
                  amount: pago.partialPayments[0]?.amount || 0,
                  date: pago.paymentDate,
                  notes: pago.notes,
                },
              }),
          },
          { headers: { 'auth-token': localStorage.getItem('token') } }
        );

        await Axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/playerBills/create`,
          {
            playerId,
            name: selectedPlayerData.name,
            plan: selectedPlayerData.plan,
            price: pago.amount,
            priceText,
            dueDate,
            month: otrosConceptos
              ? `otros-conceptos-${moment().format('YYYY-MM')}`
              : pago.month,
            additionalNotes: pago.notes,
            partial: pago.partial,
          },
          { headers: { 'auth-token': localStorage.getItem('token') } }
        );
      }

      notify.show('Pago y boleta registrados correctamente.', 'success');
      props.refresh();
      props.onHide();
    } catch (err) {
      notify.show(err.message, 'error');
    }
  };

  let req = <small className='text-danger font-weight-bold'>*</small>;

  return (
    <Modal show={props.show} onHide={props.onHide}>
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Registrar un pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Socio</Form.Label>
            <Form.Control
              as='select'
              required
              value={playerId}
              onChange={handleChange}
              name='playerId'
            >
              {console.log('playerList en AddEditForm:', props.playerList)}

              <option value=''>Seleccione un socio...</option>
              {Array.isArray(props.playerList) &&
                props.playerList.map((player) => (
                  <option key={player._id} value={player._id}>
                    {player.name}
                  </option>
                ))}
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Check
              type='checkbox'
              label='¿Adelantar pagos con este monto?'
              checked={adelantarPagos}
              onChange={() => setAdelantarPagos(!adelantarPagos)}
              name='adelantarPagos'
            />
          </Form.Group>

          <Form.Group>
            <Form.Check
              type='checkbox'
              label='Es pago parcial'
              checked={partial}
              onChange={() => setPartial(!partial)}
              name='partial'
            />
          </Form.Group>

          <Form.Group>
            <Form.Check
              type='checkbox'
              label='Otros conceptos (ej. instalación)'
              checked={otrosConceptos}
              onChange={() => setOtrosConceptos(!otrosConceptos)}
              name='otrosConceptos'
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Fecha de vencimiento{req}</Form.Label>
            <Form.Control
              required
              type='date'
              value={
                moment(dueDate).isValid()
                  ? moment(dueDate).format('YYYY-MM-DD')
                  : ''
              }
              onChange={handleChange}
              name='dueDate'
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Precio{req}</Form.Label>
            <Form.Control
              required
              type='number'
              value={price}
              onChange={handleChange}
              name='price'
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Precio (expresado verbalmente){req}</Form.Label>
            <Form.Control
              required
              type='text'
              value={priceText}
              onChange={handleChange}
              name='priceText'
            />
          </Form.Group>

          {!otrosConceptos && (
            <Form.Group>
              <Form.Label>Mes a cobrar{req}</Form.Label>
              <Form.Control
                required
                type='month'
                value={month}
                onChange={handleChange}
                name='month'
              />
            </Form.Group>
          )}

          <Form.Group>
            <Form.Label>Notas adicionales</Form.Label>
            <Form.Control
              type='text'
              value={additionalNotes}
              onChange={handleChange}
              name='additionalNotes'
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={props.onHide}>
            Cerrar
          </Button>
          <Button variant='primary' type='submit'>
            Guardar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddEditForm;
