import React, { useState, useEffect, useRef } from 'react';
import { Button, Row, Col, Container, Form } from 'react-bootstrap';
import { savePDF } from '@progress/kendo-react-pdf';
import { drawDOM, exportPDF } from '@progress/kendo-drawing';
import Axios from 'axios';
import { notify } from 'react-notify-toast';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../../Layout/LoadingScreen';
import { useParams } from 'react-router-dom';
import logo from '../../../assets/LOGO TVRC.png';

const PhysicalBill = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [state, setState] = useState({
    isSendingEmail: false,
    isLoading: true,
    data: {},
    clientData: {},
    email: '',
    displayConfirmationEmail: false,
  });

  const {
    isSendingEmail,
    isLoading,
    data,
    clientData,
    email,
    displayConfirmationEmail,
  } = state;

  const billRef = useRef(null);

  const handleDisplayConfirmationEmail = (value) => {
    setState((prev) => ({
      ...prev,
      displayConfirmationEmail: value,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const HEADERSCONFIG = {
          headers: { 'auth-token': localStorage.getItem('token') },
        };

        const billResponse = await Axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/playerBills/get/${id}`,
          HEADERSCONFIG
        );

        if (billResponse.data.success) {
          setState((prev) => ({ ...prev, data: billResponse.data.data[0] }));

          const clientResponse = await Axios.get(
            `${process.env.REACT_APP_BACKEND_URL}/api/players/get/${billResponse.data.data[0].playerId}`,
            HEADERSCONFIG
          );

          if (clientResponse.data.success) {
            setState((prev) => ({
              ...prev,
              clientData: clientResponse.data.data[0],
              isLoading: false,
            }));
          } else {
            notify.show(clientResponse.data.message, 'error');
            navigate('/');
          }
        } else {
          notify.show(billResponse.data.message, 'error');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        notify.show('Error fetching data', 'error');
        navigate('/');
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleSavePDF = () => {
    const PDFCONFIG = {
      paperSize: 'A4',
      scale: 0.75,
      fileName: `${clientData.name} - ${moment(data.createdAt).format('L')}`,
    };
    savePDF(billRef.current, PDFCONFIG);
  };

  const handleSendWhatsApp = () => {
    const userBillLink = `${process.env.REACT_APP_FRONTROUTE}/userBill/${id}`;
    const whatsappMessage = `¡Hola! Aquí puedes ver y descargar tu boleta: ${userBillLink}`;
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappLink = `https://api.whatsapp.com/send/?text=${encodedMessage}`;
    window.open(whatsappLink, '_blank');
  };

  const handleSendPDF = (e) => {
    e.preventDefault();

    setState((prev) => ({ ...prev, isSendingEmail: true }));
    const BILLELEMENT = document.getElementsByClassName('bill')[0];
    const DRAWCONFIG = {
      paperSize: 'A4',
      scale: 0.75,
      fileName: `${clientData.name} - ${moment(data.createdAt).format('L')}`,
    };
    const POSTCONFIG = {
      client: clientData.name,
      date: moment(data.createdAt).format('L'),
      email: clientData.email,
    };

    if (BILLELEMENT) {
      drawDOM(BILLELEMENT, DRAWCONFIG)
        .then((group) => exportPDF(group))
        .then((dataUri) => {
          Axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/api/playerBills/send`,
            { ...POSTCONFIG, file: dataUri },
            { headers: { 'auth-token': localStorage.getItem('token') } }
          ).then((res) => {
            setState((prev) => ({ ...prev, isSendingEmail: false }));
            if (res.data.success) {
              notify.show(res.data.message, 'success');
              navigate('/');
            } else {
              notify.show(res.data.message, 'error');
            }
          });
        });
    }
  };

  const handleChange = (e) => {
    let { value } = e.target;
    setState((prev) => ({
      ...prev,
      clientData: { ...prev.clientData, email: value },
    }));
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div>
      <Row>
        <Col />
        <Col className='bg-white mt-3 mb-5 text-center p-3 shadow rounded'>
          <Row>
            <Col>
              <Button
                className='mb-2'
                variant='primary'
                onClick={handleSavePDF}
              >
                Guardar PDF
              </Button>
              <Button
                className='ml-2 mb-2'
                variant='primary'
                onClick={() => {
                  handleDisplayConfirmationEmail(true);
                }}
                disabled={isSendingEmail}
              >
                Enviar por mail
              </Button>
              <Button variant='primary' onClick={handleSendWhatsApp}>
                Enviar por Whatsapp
              </Button>
            </Col>
          </Row>
          <Row
            className={
              displayConfirmationEmail ? 'd-block text-left mt-3' : 'd-none'
            }
          >
            <Col>
              <Form onSubmit={handleSendPDF}>
                <Form.Group>
                  <Form.Label>Confirme dirección de mail:</Form.Label>
                  <Form.Control
                    required
                    type='email'
                    value={clientData.email}
                    onChange={handleChange}
                    name='email'
                  />
                </Form.Group>
                <Button
                  disabled={isSendingEmail}
                  className='text-right'
                  type='submit'
                >
                  Enviar
                </Button>
              </Form>
            </Col>
          </Row>
        </Col>
        <Col />
      </Row>
      <Row>
        <Col>
          <Container
            className='bg-white bill'
            ref={billRef}
            style={{ fontFamily: 'DejaVu Sans' }}
          >
            <Row>
              <Col md='4' className='border v-center text-center'>
                <img src={logo} height='150' alt='tafi viejo rugby club Logo' />
              </Col>
              <Col>
                <Row className='border v-center'>
                  <Col className='v-center' md='3'>
                    <p className='lead m-0 py-2'>Recibo N°</p>
                  </Col>
                  <Col>{data.billNumber}</Col>
                </Row>
                <Row className='border v-center'>
                  <Col className='v-center' md='3'>
                    <p className='lead m-0 py-2'>Fecha de Emisión</p>
                  </Col>
                  <Col>{moment(data.createdAt).format('DD/MM/YYYY')}</Col>
                </Row>
                <Row className='border v-center'>
                  <Col className='v-center' md='3'>
                    <p className='lead m-0 py-2'>Fecha de Vencimiento</p>
                  </Col>
                  <Col>
                    {moment(data.dueDate).add(1, 'days').format('DD/MM/YYYY')}
                  </Col>
                </Row>
              </Col>
            </Row>

            <Row>
              <Col md='4' className='border v-center'>
                <p className='lead m-0 py-2'>Socio:</p>
              </Col>
              <Col className='border v-center'>{`${clientData.name} - ${clientData.address}`}</Col>
            </Row>
            <Row>
              <Col md='4' className='border v-center'>
                <p className='lead m-0 py-2'>A pagar:</p>
              </Col>
              <Col className='border v-center'>
                {`Pesos ${data.priceText}.-`}
                {data.partial ? ' Pago Parcial' : ''}
              </Col>
            </Row>
            <Row>
              <Col md='4' className='border v-center'>
                <p className='lead m-0 py-2'>Como:</p>
              </Col>
              <Col className='border v-center'>
                {data.month
                  ? `Mes: ${moment(data.month).format('MMMM YYYY')}`
                  : `Año : ${data.year}`}
              </Col>
            </Row>
            <Row className='border v-center'>
              <Col md='8'>
                <Row>
                  <Col className='border py-2'>
                    <h1 className='bill-payment-title text-info'>
                      Métodos de pago
                    </h1>

                    <ul>
                      <li>
                        <h2 className='bill-payment-subtitle mt-3 text-uppercase'>
                          Puede abonar en <strong> Efectivo </strong> por
                          tesoreria.
                        </h2>
                      </li>
                    </ul>
                    <ul>
                      <li>
                        <h2 className='bill-payment-subtitle mt-3 text-uppercase'>
                          Por Trasnferencia a Banco Nación
                        </h2>
                      </li>

                      <ul>
                        <li className='bill-payment-item'>
                          N° de CBU: <strong>0110510030051019254879</strong>
                        </li>
                        <li className='bill-payment-item'>
                          Alias: <strong>VERDEAMARELLA2024</strong>
                        </li>
                        <li className='bill-payment-item'>
                          Titular: <strong>Fabio Alejandro Sosa</strong>
                        </li>
                        <p className='text-center text-danger bill-payment-item m-0 fs-2 text-uppercase'>
                          Luego Envias tu comprobante de pago por WhatsApp{' '}
                          <strong>381 678-3493</strong>
                        </p>
                      </ul>
                    </ul>
                  </Col>
                </Row>
              </Col>
              <Col>
                <Row>
                  <Col className='border-bottom h-100'>
                    <p className='lead m-0 py-2'>Notas adicionales</p>
                    <p>{data.additionalNotes}</p>
                  </Col>
                </Row>
                <Row>
                  <Col className='h-100'>
                    <p className='lead m-0 py-2'>Total:</p>{' '}
                    <p>{`$${data.price}.-`}</p>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>
    </div>
  );
};

export default PhysicalBill;
