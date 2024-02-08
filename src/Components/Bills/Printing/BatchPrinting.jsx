/* eslint-disable no-unused-expressions */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import jsPDF from 'jspdf';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { notify } from 'react-notify-toast';
import { img } from './img';
import { useNavigate } from 'react-router-dom';

function BatchPrinting() {
  const stateRef = useRef({
    billNumber: 0,
    currentDate: '',
    vencimiento: '',
    quantityPerBatch: 8,
  });

  const [state, setState] = useState(stateRef.current);

  const navigate = useNavigate();
  useEffect(() => {
    let isMounted = true;

    const fetchDataAndPrint = async () => {
      moment.locale('es');
      const currentDate = moment().format('DD/MM/YYYY');
      const vencimiento = moment().add(10, 'days').format('DD/MM/YYYY');

      stateRef.current = {
        ...stateRef.current,
        currentDate,
        vencimiento,
      };

      const HEADERSCONFIG = {
        headers: { 'auth-token': localStorage.getItem('token') },
      };

      try {
        const out = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/clients/get`,
          HEADERSCONFIG
        );

        if (isMounted) {
          const chunk = 10;
          let updatedState = { ...stateRef.current };

          for (let i = 0; i < out.data.length; i += chunk) {
            const temparray = out.data.slice(i, i + chunk);

            for (const client of temparray) {
              if (client.unSubscribingDate) {
                console.log(`Cliente ${client.name} dado de baja`);
                continue;
              }

              // Comienza JSPDF
              updatedState = {
                ...updatedState,
                billNumber: updatedState.billNumber + 1,
              };

              var doc = new jsPDF();
              doc.addImage(img, 'JPEG', 0.8, 0, 67, 67);

              doc.setDrawColor(200, 200, 200);

              // Horizontal (x1, y1, x2, y2, style)
              doc.line(70, 28, 240, 28);
              doc.line(70, 48, 240, 48);
              doc.line(0, 68, 240, 68);
              doc.line(0, 88, 240, 88);
              doc.line(0, 108, 240, 108);
              doc.line(0, 128, 240, 128);
              doc.line(110, 198, 240, 198);
              doc.line(0, 218, 240, 218);

              // Vertical Lines (x1, y1, x2, y2, style)
              doc.line(110, 128, 110, 218);
              doc.line(70, 0, 70, 128);

              doc.setTextColor(0, 0, 0);
              doc.setFontSize(12);
              doc.text('Numero de recibo:', 75, 20);

              doc.setTextColor(0, 0, 0);
              doc.setFontSize(10);
              doc.text(`${updatedState.billNumber}`, 119, 20);

              doc.setTextColor(0, 0, 0);
              doc.setFontSize(12);
              doc.text('Fecha de emision:', 75, 40);

              doc.setTextColor(0, 0, 0);
              doc.setFontSize(10);
              doc.text(`${stateRef.current.currentDate}`, 119, 40);

              doc.setTextColor(0, 0, 0);
              doc.setFontSize(12);
              doc.text('Fecha de vencimiento:', 75, 60);

              doc.setTextColor(0, 0, 0);
              doc.setFontSize(10);
              doc.text(`${stateRef.current.vencimiento}`, 119, 60);

              doc.setTextColor(0, 0, 0);
              doc.setFontSize(12);
              doc.text('Cliente:', 5, 80);

              doc.setTextColor(0, 0, 0);
              doc.setFontSize(10);
              doc.text(`${client.name}`, 75, 80);

              doc.setTextColor(0, 0, 0);
              doc.setFontSize(12);
              doc.text('A Pagar:', 5, 100);

              doc.setTextColor(0, 0, 0);
              doc.setFontSize(10);
              doc.text(`Pesos ${client.priceText}`, 75, 100);

              doc.setTextColor(0, 0, 0);
              doc.setFontSize(12);
              doc.text('Como:', 5, 120);

              doc.setTextColor(0, 0, 0);
              doc.setFontSize(10);
              doc.text(
                `Abono mes: ${moment().format('MMMM [del año] YYYY')}`,
                75,
                120
              );

              //

              doc.setTextColor(0, 0, 0);
              doc.setFontSize(10);
              doc.text('Total:', 115, 210);

              doc.setTextColor(0, 0, 0);
              doc.setFontSize(10);
              doc.text(`$ ${client.price}-.`, 127, 210);

              doc.setTextColor(0, 0, 0);
              doc.setFontSize(10);
              doc.text(
                'Rebanking (Transatlantica Compañía Financiera S.A.)',
                5,
                140
              );

              doc.setTextColor(0, 0, 0);
              doc.setFontSize(10);
              doc.text('Número de cuenta ($): 999-180087/2', 5, 150);

              doc.setTextColor(0, 0, 0);
              doc.setFontSize(10);
              doc.text('CBU: 4150999718001800870027', 5, 160);

              doc.setTextColor(0, 0, 0);
              doc.setFontSize(10);
              doc.text('Alias: jma.iramain.ars', 5, 170);

              doc.setTextColor(0, 0, 0);
              doc.setFontSize(10);
              doc.text(
                'Titular de la cuenta: Jose Manuel Adrian Iramain',
                5,
                180
              );

              doc.setTextColor(0, 0, 0);
              doc.setFontSize(10);
              doc.text('CUIT: 20254442780', 5, 190);

              doc.setTextColor(255, 0, 0);
              doc.setFontSize(10);
              doc.text(
                'LOS ABONOS PUEDEN SER PAGADOS EN EFECTIVO EN PAGO FACIL ',
                5,
                225
              );

              doc.setTextColor(255, 0, 0);
              doc.setFontSize(10);
              doc.text(
                'pedís ingresar dinero en REBA, luego brindás el CUIL: 20254442780, sexo: masculino, DNI 25444278,',
                5,
                230
              );
              doc.setTextColor(255, 0, 0);
              doc.setFontSize(10);
              doc.text(
                'y el monto que vas a  ingresar como pago. Una vez realizo enviar foto del comprobante.',
                5,
                235
              );

              doc.setTextColor(255, 0, 0);
              doc.setFontSize(10);
              doc.text(
                'Enviar comprobante de pago por email: info.wifi.net@gmail.com o por WhatsApp:3815285322',
                5,
                240
              );

              doc.save(`cliente-${client.name}.pdf`);
              console.log('Cliente');

              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }

          console.log('Impresión completada con estado final:', updatedState);
          notify.show('Boletas guardadas correctamente.', 'success');
          navigate('/');
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchDataAndPrint();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Container>
      <Row className='v-center vh-100-minus'>
        <Col />
        <Col className='bg-white shadow p-5 rounded text-center m-0'>
          <FontAwesomeIcon size='2x' icon={faSpinner} spin />
          <br />
          <h3 className=''>Guardando boletas...</h3>
        </Col>
        <Col />
      </Row>
    </Container>
  );
}

export default BatchPrinting;
