// components/Layout.js
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Navigation from './Navbar';
import SideBar from './SideBar';

const Layout = ({ children }) => {
  return (
    <>
      <Navigation />
      <Container fluid>
        <Row>
          <Col
            xs={1}
            style={{
              backgroundColor: '#343a40',
              minHeight: '100vh',
              color: 'white',
              minWidth: '200px',
            }}
          >
            <SideBar />
          </Col>
          <Col style={{ minWidth: '200px' }}>{children}</Col>
        </Row>
      </Container>
    </>
  );
};

export default Layout;
  