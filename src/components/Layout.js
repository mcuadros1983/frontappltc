import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import Navigation from './Navbar';
import SideBar from './SideBar';
import { FaBars, FaTimes } from "react-icons/fa"; // Importar íconos
import './css/Layout.css';

const Layout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSidebarVisible, setIsSidebarVisible] = useState(!isMobile);

  // Detecta cambios en el tamaño de la pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsMobile(true);
        setIsSidebarVisible(false); // Sidebar oculto inicialmente en pantallas pequeñas
      } else {
        setIsMobile(false);
        setIsSidebarVisible(true); // Sidebar siempre visible en pantallas grandes
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
    <>
      <Navigation />

      {/* Botón hamburguesa visible solo en pantallas pequeñas */}
      {isMobile && (
        <Button
          onClick={toggleSidebar}
          style={{
            position: 'absolute', // Alinea con el flow del contenido
            top: '70px', // Debajo del navbar
            left: '10px',
            zIndex: 1000,
          }}
        >
          ☰
        </Button>
      )}

      <Container fluid>
        <Row>
          {/* Sidebar visible solo si está habilitado */}
          {isMobile ? (
            <div
              className={`sidebar-wrapper ${isSidebarVisible ? 'visible' : ''}`}
              style={{
                backgroundColor: '#343a40',
                minHeight: '100vh',
                color: 'white',
                position: 'absolute', // Alineado con el flujo debajo del navbar
                top: '70px', // Debajo del navbar
                left: isSidebarVisible ? '0' : '-250px', // Aparece o desaparece en pantallas pequeñas
                width: '250px',
                zIndex: 999, // Se asegura de que esté por encima del contenido, pero no del navbar
                transition: 'left 0.3s ease',
                overflowY: 'auto',
              }}
            >
              <SideBar toggleSidebar={toggleSidebar} isMobile={isMobile} />
            </div>
          ) : (
            <Col
              xs={12}
              lg={2} // Sidebar visible en pantallas grandes
              style={{
                backgroundColor: '#343a40',
                minHeight: '100vh',
                color: 'white',
                minWidth: '200px',
              }}
            >
              <SideBar />
            </Col>
          )}

          {/* El contenido principal que no se ve afectado por el sidebar en pantallas pequeñas */}
          <Col
            xs={12}
            lg={10}
            style={{
              paddingLeft: '0',
              paddingRight: '0',
              marginTop: '70px', // Asegura que el contenido comience debajo del navbar
              position: 'relative',
              zIndex: isMobile ? 1 : 'auto', // En pantallas pequeñas, el contenido tiene menor z-index que el sidebar
              transition: 'margin-left 0.3s ease',
            }}
          >
            {children}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Layout;
