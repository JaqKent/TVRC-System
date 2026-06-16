import React, { useEffect, useState } from "react";
import { Container, Card, Button, Spinner, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faCheckCircle,
  faTimesCircle,
  faSync,
} from "@fortawesome/free-solid-svg-icons";
import { Html5QrcodeScanner } from "html5-qrcode";
import Axios from "axios";
import moment from "moment";

export default function LectorSocios() {
  const [socioInfo, setSocioInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState(null);
  const [scannerActivo, setScannerActivo] = useState(true);

  useEffect(() => {
    let scanner = null;

    if (scannerActivo) {
      scanner = new Html5QrcodeScanner("reader", {
        fps: 15,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      });

      scanner.render(
        async (decodedText) => {
          setScannerActivo(false);
          scanner
            .clear()
            .catch((err) => console.error("Error al detener cámara", err));
          await buscarSocioEnDB(decodedText);
        },
        (error) => {},
      );
    }

    return () => {
      if (scanner) {
        scanner
          .clear()
          .catch((err) => console.error("Error limpiando scanner", err));
      }
    };
  }, [scannerActivo]);

  const buscarSocioEnDB = async (idSocio) => {
    setIsLoading(true);
    setErrorBusqueda(null);
    try {
      const respuesta = await Axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/players/get/${idSocio}`,
        {
          headers: { "auth-token": localStorage.getItem("token") },
        },
      );

      if (respuesta.data && respuesta.data.data && respuesta.data.data[0]) {
        setSocioInfo(respuesta.data.data[0]);
      } else {
        setErrorBusqueda(
          "El ID escaneado no corresponde a ningún socio registrado.",
        );
      }
    } catch (err) {
      setErrorBusqueda(
        err.response?.data?.message || "Error de conexión con el servidor.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const reiniciarEscaneo = () => {
    setSocioInfo(null);
    setErrorBusqueda(null);
    setScannerActivo(true);
  };

  const obtenerDatosPago = () => {
    if (
      !socioInfo ||
      !socioInfo.paymentHistory ||
      socioInfo.paymentHistory.length === 0
    ) {
      return { esDeudor: true, ultimaFecha: "---", ultimoMes: "---" };
    }

    const historial = socioInfo.paymentHistory;
    const ultimoPago = historial[historial.length - 1];

    const fechaUltimoPago = moment(ultimoPago.month, "MM/YYYY").startOf(
      "month",
    );
    const fechaActual = moment().startOf("month");
    const mesesDeDiferencia = fechaActual.diff(fechaUltimoPago, "months");

    const fechaRaw = ultimoPago.paymentDate?.$date || ultimoPago.paymentDate;
    const ultimaFechaFormateada = fechaRaw
      ? moment(fechaRaw).format("L")
      : "---";

    return {
      esDeudor: mesesDeDiferencia >= 2,
      ultimaFecha: ultimaFechaFormateada,
      ultimoMes: ultimoPago.month || "---",
    };
  };

  const datosPago = obtenerDatosPago();

  return (
    <Container
      className="p-3 text-center style-mobile"
      style={{ maxWidth: "450px" }}
    >
      <h3 className="mb-3 font-weight-bold">Control de Acceso QR</h3>

      {scannerActivo && (
        <Card className="shadow-sm p-2 mb-3 bg-dark border-0 rounded-lg">
          <div
            id="reader"
            style={{ width: "100%", borderRadius: "8px", overflow: "hidden" }}
          ></div>
          <small className="text-white-50 mt-2 d-block">
            <FontAwesomeIcon icon={faCamera} className="mr-1" /> Apuntá al
            código QR de la credencial
          </small>
        </Card>
      )}

      {isLoading && (
        <Card className="shadow p-4 my-3 text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <h5>Buscando socio en la base de datos...</h5>
        </Card>
      )}

      {errorBusqueda && (
        <Alert variant="danger" className="shadow my-3">
          <Alert.Heading>Error de Lectura</Alert.Heading>
          <p className="mb-3">{errorBusqueda}</p>
          <Button variant="danger" block onClick={reiniciarEscaneo}>
            <FontAwesomeIcon icon={faSync} className="mr-2" /> Intentar de nuevo
          </Button>
        </Alert>
      )}

      {socioInfo && (
        <Card
          className="shadow-lg border-0 my-3 text-white text-left rounded-lg"
          style={{
            backgroundColor: socioInfo.unSubscribingDate
              ? "#6c757d"
              : datosPago.esDeudor
                ? "#dc3545"
                : "#28a745",
            transition: "all 0.3s ease",
          }}
        >
          <Card.Body className="p-4">
            <div className="d-flex align-items-center mb-3">
              <FontAwesomeIcon
                icon={
                  socioInfo.unSubscribingDate
                    ? faTimesCircle
                    : datosPago.esDeudor
                      ? faTimesCircle
                      : faCheckCircle
                }
                size="3x"
                className="mr-3"
              />
              <div>
                <h4
                  className="m-0 font-weight-bold"
                  style={{ textTransform: "uppercase" }}
                >
                  {socioInfo.name}
                </h4>
                <small className="opacity-75">
                  DNI: {socioInfo.dni || "---"}
                </small>
              </div>
            </div>

            <hr style={{ borderColor: "rgba(255,255,255,0.2)" }} />

            <div style={{ fontSize: "15px", lineHeight: "1.8" }}>
              <div>
                <strong>Categoría:</strong> {socioInfo.category || "---"}
              </div>
              <div>
                <strong>Teléfono:</strong> {socioInfo.phone || "---"}
              </div>
              <div>
                <strong>Último mes pago:</strong> {datosPago.ultimoMes}
              </div>
              <div>
                <strong>Última fecha de pago:</strong> {datosPago.ultimaFecha}
              </div>

              <div
                className="mt-2 p-2 bg-white text-dark rounded font-weight-bold text-center"
                style={{ fontSize: "16px" }}
              >
                STATUS:{" "}
                {socioInfo.unSubscribingDate ? (
                  <span className="text-muted">❌ SOCIO DADO DE BAJA</span>
                ) : !datosPago.esDeudor ? (
                  <span className="text-success">
                    ✅ ACCESO AUTORIZADO (AL DÍA)
                  </span>
                ) : (
                  <span className="text-danger">⚠️ REVISAR PAGOS / DEUDA</span>
                )}
              </div>
            </div>

            <Button
              variant="light"
              className="mt-4 font-weight-bold text-dark border-0 shadow-sm"
              block
              onClick={reiniciarEscaneo}
            >
              <FontAwesomeIcon icon={faSync} className="mr-2" /> Escanear
              Siguiente
            </Button>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}
