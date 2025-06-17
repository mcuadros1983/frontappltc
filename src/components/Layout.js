import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Navigation from './Navbar';
import SideBar from './SideBar';
import './css/Layout.css';

const Layout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 993);
  const [isSidebarVisible, setIsSidebarVisible] = useState(!isMobile);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 993) {
        setIsMobile(true);
        setIsSidebarVisible(false);
        setIsSidebarCollapsed(false); // Asegura que no quede oculto si vuelve a móvil
      } else {
        setIsMobile(false);
        setIsSidebarVisible(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const toggleCollapseSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  return (
    <>
      <Navigation />

      {/* Botón ☰ solo en móvil */}
      {isMobile && (
        <Button
          onClick={toggleSidebar}
          style={{
            position: 'absolute',
            top: '70px',
            left: '10px',
            zIndex: 1000,
          }}
        >
          ☰
        </Button>
      )}

      {/* Botón ▶ / ◀ solo en escritorio */}
      {!isMobile && (
        <OverlayTrigger
          placement="right"
          overlay={
            <Tooltip>
              {isSidebarCollapsed ? 'Mostrar menú' : 'Ocultar menú'}
            </Tooltip>
          }
        >
          <Button
            onClick={toggleCollapseSidebar}
            style={{
              position: 'absolute',
              top: '80px',
              left: isSidebarCollapsed ? '0' : '200px',
              zIndex: 1000,
              borderRadius: '0 5px 5px 0',
              backgroundColor: '#343a40',
              color: 'white',
              border: 'none',
              width: '30px',
              height: '40px',
              padding: 0,
              fontSize: '1.2rem',
            }}
          >
            {isSidebarCollapsed ? '▶' : '◀'}
          </Button>
        </OverlayTrigger>
      )}

      <Container fluid>
        <Row>
          {/* Sidebar móvil (con transición deslizante) */}
          {isMobile ? (
            <div
              className={`sidebar-wrapper ${isSidebarVisible ? 'visible' : ''}`}
              style={{
                backgroundColor: '#343a40',
                minHeight: '100vh',
                color: 'white',
                position: 'absolute',
                top: '70px',
                left: isSidebarVisible ? '0' : '-250px',
                width: '250px',
                zIndex: 999,
                transition: 'left 0.3s ease',
                overflowY: 'auto',
              }}
            >
              <SideBar toggleSidebar={toggleSidebar} isMobile={isMobile} />
            </div>
          ) : (
            !isSidebarCollapsed && (
              <Col
                lg={2}
                style={{
                  backgroundColor: '#343a40',
                  minHeight: '100vh',
                  color: 'white',
                  minWidth: '200px',
                  transition: 'all 0.3s ease',
                }}
              >
                <SideBar isMobile={false} />
              </Col>
            )
          )}

          {/* Contenido principal */}
          <Col
            xs={12}
            lg={isSidebarCollapsed || isMobile ? 12 : 10}
            style={{
              paddingLeft: '0',
              paddingRight: '0',
              marginTop: '70px',
              position: 'relative',
              zIndex: isMobile ? 1 : 'auto',
              transition: 'all 0.3s ease',
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
