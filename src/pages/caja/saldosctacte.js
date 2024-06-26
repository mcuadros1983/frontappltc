import React, { useState, useEffect, useContext, useCallback } from "react";
import { Container, Table, Button, FormControl } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../context/Contexts";

const SaldosCtaCte = () => {
  const [saldos, setSaldos] = useState([]);
  const [saldosFiltrados, setSaldosFiltrados] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [saldosPorPagina] = useState(10);
  const [orden, setOrden] = useState({ columna: "", direccion: "asc" });
  const contexto = useContext(Contexts.DataContext);

  const apiUrl = process.env.REACT_APP_API_URL;

  const obtenerSaldosCtaCte = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/caja/saldosctacte`);
      const data = await response.json();
      if (data.length === 0) {
        alert("No existen cuentas corrientes activas.");
        return;
      }

      const saldosConNombreApellido = data.map((saldo) => {
        const cliente = contexto.clientesTabla.find(
          (cliente) => cliente.id === saldo.cliente_id
        );
        return {
          ...saldo,
          nombre: cliente ? cliente.nombre : "",
          apellido: cliente ? cliente.apellido : "",
        };
      });

      setSaldos(saldosConNombreApellido);
      setSaldosFiltrados(saldosConNombreApellido);

      const clientesUnicos = saldosConNombreApellido.reduce((clientes, saldo) => {
        if (!clientes.some((cliente) => cliente.id === saldo.cliente_id)) {
          clientes.push({ id: saldo.cliente_id, nombre: saldo.nombre, apellido: saldo.apellido });
        }
        return clientes;
      }, []);

      clientesUnicos.sort((a, b) => {
        const nombreCompletoA = `${a.nombre} ${a.apellido}`.toLowerCase();
        const nombreCompletoB = `${b.nombre} ${b.apellido}`.toLowerCase();
        if (nombreCompletoA < nombreCompletoB) return -1;
        if (nombreCompletoA > nombreCompletoB) return 1;
        return 0;
      });

      setClientesFiltrados(clientesUnicos);
    } catch (error) {
      console.error(error);
    }
  }, [apiUrl, contexto.clientesTabla]);

  useEffect(() => {
    obtenerSaldosCtaCte();
  }, [obtenerSaldosCtaCte]);

  const manejadorFiltroClienteSeleccionado = useCallback(() => {
    const filtrados = clienteSeleccionado ? saldos.filter(
      (saldo) => parseInt(saldo.cliente_id) === parseInt(clienteSeleccionado)
    ) : saldos;
    
    setSaldosFiltrados(filtrados);
    setPaginaActual(1);
  }, [clienteSeleccionado, saldos]);

  useEffect(() => {
    manejadorFiltroClienteSeleccionado();
  }, [clienteSeleccionado, manejadorFiltroClienteSeleccionado]);
  const cambiarPagina = (numeroPagina) => setPaginaActual(numeroPagina);

  const manejarOrden = (columna) => {
    const direccion = orden.columna === columna && orden.direccion === "asc" ? "desc" : "asc";
    setOrden({ columna, direccion });
    ordenarSaldos(columna, direccion);
  };

  const ordenarSaldos = (columna, direccion) => {
    const saldosOrdenados = [...saldosFiltrados].sort((a, b) => {
      const comparadorA = a[columna];
      const comparadorB = b[columna];
      if (comparadorA < comparadorB) return direccion === "asc" ? -1 : 1;
      if (comparadorA > comparadorB) return direccion === "asc" ? 1 : -1;
      return 0;
    });
    setSaldosFiltrados(saldosOrdenados);
  };

  const indiceUltimoSaldo = paginaActual * saldosPorPagina;
  const indicePrimerSaldo = indiceUltimoSaldo - saldosPorPagina;
  const saldosActuales = saldosFiltrados.slice(indicePrimerSaldo, indiceUltimoSaldo);

  const totalSaldoFiltrado = saldosFiltrados.reduce((acc, saldo) => acc + parseFloat(saldo.saldo), 0);

  return (
    <Container>
      <h1 className="my-list-title dark-text">Saldos de Cuenta Corriente</h1>

      <div className="d-flex justify-content-between mb-3">
        <FormControl
          as="select"
          value={clienteSeleccionado}
          onChange={(e) => setClienteSeleccionado(e.target.value)}
          className="mr-2"
          style={{ width: "25%" }}
        >
          <option value="">Seleccione un cliente</option>
          {clientesFiltrados.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nombre} {cliente.apellido}
            </option>
          ))}
        </FormControl>
        <div className="ml-auto">
          <strong>Saldo Total: </strong>{totalSaldoFiltrado.toFixed(2)}
        </div>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th onClick={() => manejarOrden("nombre")}>Cliente</th>
            <th onClick={() => manejarOrden("ventas")}>Total Ventas</th>
            <th onClick={() => manejarOrden("cobranzas")}>Total Cobranzas</th>
            <th onClick={() => manejarOrden("saldo")}>Saldo Cuenta Corriente</th>
          </tr>
        </thead>
        <tbody>
          {saldosActuales.map((saldo) => (
            <tr key={saldo.cliente_id}>
              <td>
                {saldo.nombre} {saldo.apellido}
              </td>
              <td>{saldo.ventas}</td>
              <td>{saldo.cobranzas}</td>
              <td>{saldo.saldo}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-center align-items-center">
        <Button
          onClick={() => cambiarPagina(paginaActual - 1)}
          disabled={paginaActual === 1}
        >
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {paginaActual} de {Math.ceil(saldosFiltrados.length / saldosPorPagina)}
        </span>
        <Button
          onClick={() => cambiarPagina(paginaActual + 1)}
          disabled={paginaActual === Math.ceil(saldosFiltrados.length / saldosPorPagina)}
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
};

export default SaldosCtaCte;
