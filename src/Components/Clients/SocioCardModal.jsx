import React, { useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import { QRCodeSVG } from "qrcode.react";

export function SocioCardModal({ show, onHide, socio }) {
  const qrRef = useRef(null);

  const descargarCredencial = () => {
    const svg = qrRef.current.querySelector("svg");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 250;

      ctx.fillStyle = "#1a252f";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#3498db";
      ctx.fillRect(0, 0, canvas.width, 15);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px Arial";
      ctx.fillText(socio.name ? socio.name.toUpperCase() : "SOCIO", 25, 60);

      ctx.fillStyle = "#bdc3c7";
      ctx.font = "14px Arial";
      ctx.fillText(`DNI: ${socio.dni || "---"}`, 25, 100);
      ctx.fillText(`Cat: ${socio.category || "---"}`, 25, 130);

      ctx.fillStyle = "#7f8c8d";
      ctx.font = "italic 11px Arial";
      ctx.fillText("Credencial Digital de Acceso", 25, 220);

      ctx.drawImage(img, 240, 45, 130, 130);

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `Credencial-${socio.name || "socio"}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="sm">
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: "18px" }}>
          Credencial de Socio
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="d-flex flex-column align-items-center bg-light">
        <div
          style={{
            width: "100%",
            maxWidth: "320px",
            backgroundColor: "#1a252f",
            color: "#fff",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "6px",
              backgroundColor: "#3498db",
            }}
          />

          <div className="d-flex justify-content-between align-items-center mt-2">
            <div>
              <h5
                style={{
                  margin: 0,
                  fontWeight: "bold",
                  fontSize: "18px",
                  textTransform: "uppercase",
                }}
              >
                {socio.name}
              </h5>
              <p
                style={{
                  margin: "8px 0 0 0",
                  fontSize: "13px",
                  color: "#bdc3c7",
                }}
              >
                <strong>DNI:</strong> {socio.dni}
              </p>
              <p
                style={{
                  margin: "4px 0 0 0",
                  fontSize: "13px",
                  color: "#bdc3c7",
                }}
              >
                <strong>Cat:</strong> {socio.category}
              </p>
            </div>

            <div
              ref={qrRef}
              style={{
                backgroundColor: "#fff",
                padding: "6px",
                borderRadius: "6px",
              }}
            >
              <QRCodeSVG
                value={socio._id ? socio._id.toString() : ""}
                size={90}
                level="H"
              />
            </div>
          </div>

          <div
            className="text-right mt-3"
            style={{
              fontSize: "10px",
              color: "#7f8c8d",
              borderTop: "1px solid #2c3e50",
              paddingTop: "5px",
            }}
          >
            ID: {socio._id}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
        <Button variant="success" onClick={descargarCredencial}>
          Descargar Imagen
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
