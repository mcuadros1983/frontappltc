// // components/Layout.js
// import React from 'react';
// import { Container, Row, Col } from 'react-bootstrap';
// import Navigation from './Navbar';
// import SideBar from './SideBar';

// const Layout = ({ children }) => {
//   return (
//     <>
//       <Navigation />
//       <Container fluid>
//         <Row>
//           <Col
//             xs={1}
//             style={{
//               backgroundColor: '#343a40',
//               minHeight: '100vh',
//               color: 'white',
//               minWidth: '200px',
//             }}
//           >
//             <SideBar />
//           </Col>
//           <Col style={{ minWidth: '200px' }}>{children}</Col>
//         </Row>
//       </Container>
//     </>
//   );
// };
import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Navigation from './Navbar';
import SideBar from './SideBar';
import { FaBars, FaTimes } from "react-icons/fa"; // Importar íconos
import './css/Layout.css';

const Layout = ({ children }) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
    <>
      <Navigation />
      <Container fluid>
        <Row>
          <Col
            className={`sidebar-col ${isSidebarVisible ? 'visible' : 'hidden'}`}
          >
            <SideBar isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />
          </Col>

          {/* Columna para el botón de toggle */}
          <div className={`toggle-sidebar-col ${isSidebarVisible ? 'visible' : 'hidden'}`}>
            <div className="toggle-sidebar-button" onClick={toggleSidebar}>
              {isSidebarVisible ? <FaTimes /> : <FaBars />}
            </div>
          </div>

          <Col
            xs={isSidebarVisible ? 10 : 12} // Ajusta el contenido para ocupar todo el ancho cuando el sidebar está oculto
            className="main-content-col"
          >
            {children}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Layout;
