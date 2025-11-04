// src/components/Navbar.jsx
import React, { useContext, useMemo, useState } from "react";
import { Navbar, Nav, Container, Modal, Form } from "react-bootstrap";
import Contexts from "../context/Contexts";
import "../styles/Navigation.css";

import { BsBuildings } from "react-icons/bs";
import { FiChevronDown } from "react-icons/fi";
import { useSecurity } from "../security/SecurityContext"; // 👈 NUEVO

export default function Navigation() {
  // 🔐 usuario ahora proviene del SecurityContext
  const { user } = useSecurity();

  // resto igual
  const dataContext = useContext(Contexts.DataContext);
  const [showEmpresaModal, setShowEmpresaModal] = useState(false);

  const handleEmpresaClick = () => setShowEmpresaModal(true);

  const handleSelectEmpresa = (e) => {
    const value = e.target.value;
    if (value === "null") {
      dataContext.setEmpresaSeleccionada(null);
      console.log("🔄 Empresa deseleccionada (modo unificado)");
    } else {
      const id = parseInt(value, 10);
      const selected = dataContext.empresasTabla.find((emp) => emp.id === id);
      dataContext.setEmpresaSeleccionada(selected);
      console.log("🔄 Empresa seleccionada:", selected);
    }
    setShowEmpresaModal(false);
  };

  // Etiqueta visible del chip
  const empresaLabel = useMemo(() => {
    return dataContext.empresaSeleccionada
      ? `Empresa ${dataContext.empresaSeleccionada.descripcion}`
      : "Unificado";
  }, [dataContext.empresaSeleccionada]);

  // Iniciales para el avatar (desde user de SecurityContext)
  const initials = useMemo(() => {
    const u = user?.usuario || "";
    return u
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }, [user]);

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="app-navbar sticky-top">
        <Container fluid className="px-3">
          {/* BRAND + CHIP DE EMPRESA (abre modal) */}
          <div
            role="button"
            tabIndex={0}
            className="nb-brand"
            onClick={handleEmpresaClick}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleEmpresaClick()}
            title="Cambiar empresa"
          >
            <BsBuildings className="nb-ico" />
            <span className="nb-title">La Tradición Carnicerías</span>
            <span className="nb-chip">
              {empresaLabel}
              <FiChevronDown className="nb-caret" />
            </span>
          </div>

          {/* USUARIO (derecha) */}
          <Nav className="ms-auto align-items-center">
            {user && (
              <div className="nb-user">
                <div className="nb-avatar" aria-hidden="true">
                  {initials || "U"}
                </div>
                <div className="nb-usertext">
                  <span className="nb-welcome">Bienvenido</span>
                  <strong className="nb-username">
                    {user.usuario?.toUpperCase()}
                  </strong>
                </div>
              </div>
            )}
          </Nav>
        </Container>
      </Navbar>

      {/* Modal para seleccionar empresa */}
      <Modal
        show={showEmpresaModal}
        onHide={() => setShowEmpresaModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Seleccione una Empresa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Select
            onChange={handleSelectEmpresa}
            defaultValue=""
            className="form-control my-input"
          >
            <option value="">Seleccione...</option>
            <option value="null">Unificado (sin empresa)</option>
            {dataContext.empresasTabla?.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.descripcion}
              </option>
            ))}
          </Form.Select>
        </Modal.Body>
      </Modal>
    </>
  );
}
