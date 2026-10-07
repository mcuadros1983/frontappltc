import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Modal,
  Button,
  Table,
  Spinner,
  Alert,
  Badge,
} from "react-bootstrap";

const apiUrl = process.env.REACT_APP_API_URL;


const formatearFecha = (fecha) => {

  if (!fecha) {
    return "-";
  }

  const partes =
    String(fecha)
      .substring(0, 10)
      .split("-");

  if (partes.length !== 3) {
    return fecha;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};


const formatearMonto = (monto) => {

  const numero = Number(monto);

  if (!Number.isFinite(numero)) {
    return "-";
  }

  return numero.toLocaleString(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
};


export default function AdicionalFijoHistorialModal({
  show,
  onClose,
  tipo,
  onEditar,
}) {

  const [valores, setValores] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [err, setErr] =
    useState(null);


  // =====================================================
  // CARGAR HISTORIAL
  // =====================================================

  const cargarHistorial =
    useCallback(async () => {

      if (!tipo?.id) {
        return;
      }

      setLoading(true);
      setErr(null);

      try {

        const r = await fetch(
          `${apiUrl}/adicionalfijovalor?adicionalfijotipo_id=${tipo.id}`,
          {
            credentials: "include",
          }
        );


        if (!r.ok) {

          const data =
            await r
              .json()
              .catch(() => ({}));

          throw new Error(
            data?.error ||
            "No se pudo cargar el historial."
          );
        }


        const data = await r.json();


        const lista =
          Array.isArray(data)
            ? data
            : [];


        // Orden cronológico descendente.
        lista.sort((a, b) => {

          const fechaA =
            String(
              a.vigencia_desde || ""
            );

          const fechaB =
            String(
              b.vigencia_desde || ""
            );

          if (fechaA === fechaB) {
            return Number(b.id) - Number(a.id);
          }

          return fechaB.localeCompare(
            fechaA
          );
        });


        setValores(lista);

      } catch (e) {

        console.error(e);

        setErr(
          e.message ||
          "No se pudo cargar el historial."
        );

      } finally {

        setLoading(false);
      }

    }, [tipo]);


  useEffect(() => {

    if (show) {
      cargarHistorial();
    }

  }, [
    show,
    cargarHistorial,
  ]);


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <Modal
      show={show}
      onHide={onClose}
      size="lg"
      centered
    >

      <Modal.Header closeButton>

        <Modal.Title>
          Historial: {tipo?.descripcion || ""}
        </Modal.Title>

      </Modal.Header>


      <Modal.Body>

        {err && (

          <Alert
            variant="danger"
            className="py-2"
          >
            {err}
          </Alert>

        )}


        {loading ? (

          <div className="text-center py-4">

            <Spinner
              size="sm"
              className="me-2"
            />

            Cargando historial...

          </div>

        ) : valores.length ? (

          <div className="table-responsive">

            <Table
              bordered
              hover
              striped
              size="sm"
              className="mb-0"
            >

              <thead>

                <tr>

                  <th>
                    ID
                  </th>

                  <th>
                    Vigencia desde
                  </th>

                  <th>
                    Vigencia hasta
                  </th>

                  <th className="text-end">
                    Monto
                  </th>

                  <th
                    style={{
                      width: 110,
                    }}
                  >
                    Acción
                  </th>

                </tr>

              </thead>


              <tbody>

                {valores.map(
                  (valor) => (

                    <tr key={valor.id}>

                      <td>
                        {valor.id}
                      </td>

                      <td>
                        {formatearFecha(
                          valor.vigencia_desde
                        )}
                      </td>

                      <td>

                        {valor.vigencia_hasta ? (

                          formatearFecha(
                            valor.vigencia_hasta
                          )

                        ) : (

                          <Badge bg="success">
                            Actual
                          </Badge>

                        )}

                      </td>

                      <td className="text-end">

                        {formatearMonto(
                          valor.monto
                        )}

                      </td>

                      <td>

                        <Button
                          size="sm"
                          variant="outline-warning"
                          onClick={() =>
                            onEditar(valor)
                          }
                        >
                          Editar
                        </Button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </Table>

          </div>

        ) : (

          <Alert
            variant="secondary"
            className="mb-0"
          >
            Este adicional todavía no tiene valores registrados.
          </Alert>

        )}

      </Modal.Body>


      <Modal.Footer>

        <Button
          variant="secondary"
          onClick={onClose}
        >
          Cerrar
        </Button>

      </Modal.Footer>

    </Modal>
  );
}