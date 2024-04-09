import React, { useState, useEffect, useRef } from 'react';
import { Button, Row, Col, Container, Form } from 'react-bootstrap';
import { savePDF } from '@progress/kendo-react-pdf';
import { drawDOM, exportPDF } from '@progress/kendo-drawing';
import Axios from 'axios';
import { notify } from 'react-notify-toast';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../Layout/LoadingScreen';
import { useParams } from 'react-router-dom';
import logo from '../../assets/LOGO TVRC.png';

const UserBill = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [state, setState] = useState({
    isSendingEmail: false,
    isLoading: true,
    data: {},
    clientData: {},
  });

  const {
    isSendingEmail,
    isLoading,
    data,
    clientData,
    displayConfirmationEmail,
  } = state;

  const billRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const billResponse = await Axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/playerBills/get/${id}`
        );

        if (billResponse.data.success) {
          setState((prev) => ({ ...prev, data: billResponse.data.data[0] }));

          const clientResponse = await Axios.get(
            `${process.env.REACT_APP_BACKEND_URL}/api/players/get/${billResponse.data.data[0].playerId}`
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
              <Button variant='primary' onClick={handleSavePDF}>
                Guardar PDF
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
                <p className='lead m-0 py-2'>Cliente:</p>
              </Col>
              <Col className='border v-center'>{`${clientData.name} - ${clientData.address}`}</Col>
            </Row>
            <Row>
              <Col md='4' className='border v-center'>
                <p className='lead m-0 py-2'>A pagar:</p>
              </Col>
              <Col className='border v-center'>{`Pesos ${data.priceText}.-`}</Col>
            </Row>
            <Row>
              <Col md='4' className='border v-center'>
                <p className='lead m-0 py-2'>Como:</p>
              </Col>
              <Col className='border v-center'>{`Abono del mes: ${moment(
                data.month
              ).format('MMMM YYYY')}`}</Col>
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
                          CBU - REBA "Rebanking" (Transatlantica Compañía
                          Financiera S.A.)
                        </h2>
                      </li>

                      <ul>
                        <li className='bill-payment-item'>
                          N° de Cuenta: <strong>999-180087/2</strong>
                        </li>
                        <li className='bill-payment-item'>
                          N° de CBU: <strong>4150999718001800870027</strong>
                        </li>
                        <li className='bill-payment-item'>
                          Alias: <strong>jma.iramain.ars</strong>
                        </li>
                        <li className='bill-payment-item'>
                          Titular: <strong>Jose Manuel Adrian Iramain</strong>
                        </li>
                        <li className='bill-payment-item'>
                          CUIL / CUIT: <strong>20-25444278-0</strong>
                        </li>
                      </ul>
                    </ul>

                    <p className='text-center text-danger bill-payment-item m-0 mt-5 fs-2 text-uppercase'>
                      Puede abonar en: <strong> Pago Facil </strong> Pedis
                      ingresar dinero en REBA, luego brindás el CUIL:{' '}
                      <strong>20254442780</strong>.
                    </p>
                    <p className='text-center text-danger bill-payment-item m-0 fs-2 text-uppercase'>
                      Sexo:<strong>masculino</strong> DNI:{' '}
                      <strong>25444278</strong> Y el monto que vas a ingresar
                      como pago de tu abono.
                    </p>
                    <p className='text-center text-danger bill-payment-item m-0 fs-2 text-uppercase'>
                      Luego Envias tu comprobante de pago por WhatsApp{' '}
                      <strong>3815285322</strong> o por email a:{' '}
                      <strong>info.wifi.net@gmail.com</strong>
                    </p>
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

export default UserBill;
