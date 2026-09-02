// src/components/tesoreria/ImportarGastosEstimadosUnicos.jsx

import React, {
  useContext,
  useState
} from "react";

import {
  Card,
  Container,
  Row,
  Col,
  Button,
  Form,
  Alert,
  Spinner,
  Table,
  Badge
} from "react-bootstrap";

import Contexts from "../../context/Contexts";


const apiUrl =
  process.env.REACT_APP_API_URL;


export default function ImportarGastosEstimadosUnicos() {

  const data =
    useContext(
      Contexts.DataContext
    ) || {};


  const empresaCtx =
    data?.empresaSeleccionada ||
    null;


  const empresaCtxId =
    empresaCtx?.id ||
    null;


  const hasEmpresa =
    Boolean(
      empresaCtxId
    );


  const [
    file,
    setFile
  ] = useState(null);


  const [
    subiendo,
    setSubiendo
  ] = useState(false);


  const [
    downloadingTpl,
    setDownloadingTpl
  ] = useState(false);


  const [
    resumen,
    setResumen
  ] = useState(null);


  const [
    err,
    setErr
  ] = useState(null);



  // ======================================================
  // SELECCIÓN DE ARCHIVO
  // ======================================================

  const onFile =
    (e) => {

      const selectedFile =
        e.target.files?.[0] ||
        null;


      console.log(
        "\n========================================"
      );

      console.log(
        "📎 ARCHIVO SELECCIONADO"
      );

      console.log(
        "========================================"
      );


      if (
        selectedFile
      ) {

        console.log({
          name:
            selectedFile.name,

          type:
            selectedFile.type,

          size:
            selectedFile.size,

          lastModified:
            selectedFile.lastModified,

          lastModifiedDate:
            new Date(
              selectedFile.lastModified
            ).toString()
        });

      } else {

        console.log(
          "⚠️ No se seleccionó archivo"
        );
      }


      setFile(
        selectedFile
      );

      setResumen(
        null
      );

      setErr(
        null
      );
    };



  // ======================================================
  // DESCARGAR TEMPLATE
  // ======================================================

  const descargarPlantillaXLSX =
    async () => {

      if (
        !hasEmpresa
      ) {

        console.warn(
          "⚠️ No hay empresa seleccionada"
        );

        return;
      }


      try {

        setErr(
          null
        );

        setDownloadingTpl(
          true
        );


        const url =
          `${apiUrl}/gasto-estimado/unicos/template.xlsx?empresa_id=${empresaCtxId}`;


        console.log(
          "\n========================================"
        );

        console.log(
          "📥 DESCARGANDO TEMPLATE"
        );

        console.log(
          "========================================"
        );

        console.log(
          "🏢 Empresa:",
          empresaCtxId
        );

        console.log(
          "🌐 URL:",
          url
        );


        const r =
          await fetch(
            url,
            {
              method:
                "GET",

              credentials:
                "include"
            }
          );


        console.log(
          "📡 Status template:",
          r.status
        );


        if (
          !r.ok
        ) {

          const msg =
            await r
              .text()
              .catch(
                () => ""
              );


          console.error(
            "❌ Error descargando template:",
            msg
          );


          throw new Error(
            msg ||
            "No se pudo descargar el template"
          );
        }


        const blob =
          await r.blob();


        console.log(
          "✅ Template recibido"
        );

        console.log(
          "📦 Tamaño blob:",
          blob.size
        );


        const urlBlob =
          URL.createObjectURL(
            blob
          );


        const a =
          document.createElement(
            "a"
          );


        a.href =
          urlBlob;


        a.download =
          "gastos_unicos_template.xlsx";


        a.click();


        URL.revokeObjectURL(
          urlBlob
        );


        console.log(
          "✅ Descarga iniciada"
        );


      } catch (e) {

        console.error(
          "💥 ERROR descargarPlantillaXLSX"
        );

        console.error(
          e
        );


        setErr(
          e.message ||
          "Error descargando template"
        );

      } finally {

        setDownloadingTpl(
          false
        );
      }
    };



  // ======================================================
  // IMPORTAR ARCHIVO
  // ======================================================

  const subir =
    async () => {

      console.log(
        "\n\n========================================"
      );

      console.log(
        "🚀 INICIO IMPORTACIÓN FRONTEND"
      );

      console.log(
        "========================================"
      );


      try {

        setErr(
          null
        );

        setResumen(
          null
        );


        // ==================================================
        // EMPRESA
        // ==================================================

        console.log(
          "🏢 Empresa seleccionada:",
          empresaCtx
        );


        console.log(
          "🏢 empresaCtxId:",
          empresaCtxId
        );


        console.log(
          "🏢 hasEmpresa:",
          hasEmpresa
        );


        if (
          !hasEmpresa
        ) {

          console.error(
            "❌ No hay empresa seleccionada"
          );


          setErr(
            "Debés seleccionar una empresa para importar."
          );

          return;
        }



        // ==================================================
        // ARCHIVO
        // ==================================================

        console.log(
          "📎 File actual:",
          file
        );


        if (
          !file
        ) {

          console.error(
            "❌ No hay archivo seleccionado"
          );


          setErr(
            "Seleccioná un archivo .xlsx o .csv"
          );

          return;
        }


        console.log(
          "📎 Datos del archivo:",
          {
            name:
              file.name,

            type:
              file.type,

            size:
              file.size,

            lastModified:
              file.lastModified
          }
        );



        // ==================================================
        // PREPARAR FORM DATA
        // ==================================================

        setSubiendo(
          true
        );


        const fd =
          new FormData();


        fd.append(
          "file",
          file
        );


        fd.append(
          "empresa_id",
          String(
            empresaCtxId
          )
        );


        console.log(
          "\n📦 CONTENIDO FORMDATA"
        );


        for (
          const [
            key,
            value
          ] of fd.entries()
        ) {

          if (
            value instanceof File
          ) {

            console.log(
              `📦 ${key}:`,
              {
                name:
                  value.name,

                size:
                  value.size,

                type:
                  value.type
              }
            );

          } else {

            console.log(
              `📦 ${key}:`,
              value
            );
          }
        }



        // ==================================================
        // URL
        // ==================================================

        const url =
          `${apiUrl}/gasto-estimado/importar-unicos`;


        console.log(
          "\n🌐 API URL base:",
          apiUrl
        );


        console.log(
          "🌐 Endpoint:",
          url
        );


        console.log(
          "📤 Ejecutando POST..."
        );



        // ==================================================
        // FETCH
        // ==================================================

        const r =
          await fetch(
            url,
            {
              method:
                "POST",

              body:
                fd,

              credentials:
                "include",
            }
          );


        console.log(
          "\n========================================"
        );

        console.log(
          "📥 RESPUESTA HTTP"
        );

        console.log(
          "========================================"
        );


        console.log(
          "📡 status:",
          r.status
        );


        console.log(
          "📡 statusText:",
          r.statusText
        );


        console.log(
          "📡 ok:",
          r.ok
        );


        console.log(
          "📡 Content-Type:",
          r.headers.get(
            "content-type"
          )
        );



        // ==================================================
        // LEER RESPUESTA
        // ==================================================

        const json =
          await r
            .json()
            .catch(
              (parseError) => {

                console.error(
                  "❌ No se pudo convertir la respuesta a JSON"
                );

                console.error(
                  parseError
                );

                return null;
              }
            );


        console.log(
          "\n📥 JSON RECIBIDO:"
        );


        console.log(
          json
        );



        // ==================================================
        // ERROR HTTP
        // ==================================================

        if (
          !r.ok
        ) {

          console.error(
            "❌ BACKEND DEVOLVIÓ ERROR"
          );


          console.error(
            "Status:",
            r.status
          );


          console.error(
            "Respuesta:",
            json
          );


          throw new Error(
            json?.detalle ||
            json?.error ||
            "No se pudo importar el archivo"
          );
        }



        // ==================================================
        // RESUMEN
        // ==================================================

        console.log(
          "\n========================================"
        );

        console.log(
          "📊 RESULTADO IMPORTACIÓN"
        );

        console.log(
          "========================================"
        );


        console.log(
          "Total:",
          json?.total
        );


        console.log(
          "Creados:",
          json?.created
        );


        console.log(
          "Fallidos:",
          json?.failed
        );


        if (
          Array.isArray(
            json?.results
          )
        ) {

          console.log(
            "📋 Resultados por fila:"
          );


          console.table(
            json.results
          );


          const errores =
            json.results.filter(
              (item) =>
                !item.ok
            );


          console.log(
            "❌ Cantidad de filas con error:",
            errores.length
          );


          if (
            errores.length >
            0
          ) {

            console.log(
              "❌ PRIMER ERROR:"
            );

            console.log(
              errores[0]
            );


            console.table(
              errores
            );
          }
        }


        setResumen(
          json
        );


        console.log(
          "\n✅ IMPORTACIÓN FRONTEND FINALIZADA"
        );


      } catch (e) {

        console.error(
          "\n========================================"
        );

        console.error(
          "💥 ERROR IMPORTACIÓN FRONTEND"
        );

        console.error(
          "========================================"
        );


        console.error(
          "Error completo:",
          e
        );


        console.error(
          "Mensaje:",
          e?.message
        );


        console.error(
          "Stack:",
          e?.stack
        );


        setErr(
          e.message ||
          "Error subiendo archivo"
        );


      } finally {

        setSubiendo(
          false
        );


        console.log(
          "========================================"
        );

        console.log(
          "🏁 FIN PROCESO FRONTEND"
        );

        console.log(
          "========================================\n"
        );
      }
    };



  // ======================================================
  // RENDER
  // ======================================================

  return (

    <Container
      className="mt-3"
    >

      <Row>

        <Col>

          <Card>

            <Card.Header
              className="d-flex justify-content-between align-items-center"
            >

              <strong>
                Importar Gastos Estimados (Únicos)
              </strong>


              <div
                className="d-flex gap-2"
              >

                <Button

                  variant=
                  "outline-secondary"

                  onClick={
                    descargarPlantillaXLSX
                  }

                  disabled={
                    downloadingTpl ||
                    !hasEmpresa
                  }

                >

                  {
                    downloadingTpl
                      ? (
                        <>

                          <Spinner
                            size="sm"
                            animation="border"
                            className="me-2"
                          />

                          Generando…

                        </>
                      )
                      : (
                        "Descargar template (XLSX)"
                      )
                  }

                </Button>

              </div>

            </Card.Header>


            <Card.Body>

              {
                !hasEmpresa &&
                (

                  <Alert
                    variant="warning"
                    className="py-2"
                  >

                    Debés seleccionar una empresa
                    para habilitar la descarga del
                    template y la importación.

                  </Alert>

                )
              }


              {
                hasEmpresa &&
                (

                  <div
                    className="mb-2"
                  >

                    <span
                      className="me-2 text-muted"
                    >
                      Empresa seleccionada:
                    </span>


                    <Badge
                      bg="info"
                    >

                      #{empresaCtx.id}{" "}

                      {
                        empresaCtx.nombrecorto ||
                        empresaCtx.descripcion ||
                        ""
                      }

                    </Badge>

                  </div>

                )
              }


              <p
                className="text-muted mb-2"
              >

                El template contiene sólo estas columnas:&nbsp;

                <code>
                  descripcion
                </code>,

                {" "}

                <code>
                  proveedor
                </code>,

                {" "}

                <code>
                  categoria
                </code>,

                {" "}

                <code>
                  fecha_vencimiento
                </code>

                {" "}

                (YYYY-MM-DD),

                {" "}

                <code>
                  monto
                </code>,

                {" "}

                <code>
                  forma_pago
                </code>.

                <br />

                <em>
                  Nota:
                </em>

                {" "}

                La empresa no se completa en el archivo:
                se toma de la empresa seleccionada arriba.

              </p>


              {
                err &&
                (

                  <Alert
                    variant="danger"
                  >

                    {err}

                  </Alert>

                )
              }


              <Form>

                <Row
                  className="g-3 align-items-end"
                >

                  <Col
                    md={6}
                  >

                    <Form.Label>
                      Archivo
                    </Form.Label>


                    <Form.Control

                      type="file"

                      accept=".xlsx,.xls,.csv"

                      onChange={
                        onFile
                      }

                      disabled={
                        subiendo ||
                        !hasEmpresa
                      }

                    />


                    <Form.Text
                      className="text-muted"
                    >
                      Usá el template descargado:
                      incluye listas desplegables de
                      proveedores, categorías y formas de pago.
                    </Form.Text>

                  </Col>


                  <Col
                    md="auto"
                  >

                    <Button

                      onClick={
                        subir
                      }

                      disabled={
                        subiendo ||
                        !file ||
                        !hasEmpresa
                      }

                    >

                      {
                        subiendo
                          ? (
                            <>

                              <Spinner
                                size="sm"
                                animation="border"
                                className="me-2"
                              />

                              Importando…

                            </>
                          )
                          : (
                            "Importar"
                          )
                      }

                    </Button>

                  </Col>

                </Row>

              </Form>


              {
                resumen &&
                (

                  <>

                    <hr />


                    <h6>
                      Resultado
                    </h6>


                    <div
                      className="mb-2"
                    >

                      <strong>
                        Total:
                      </strong>

                      {" "}
                      {resumen.total}

                      {" · "}

                      <strong>
                        Creados:
                      </strong>

                      {" "}
                      {resumen.created}

                      {" · "}

                      <strong>
                        Fallidos:
                      </strong>

                      {" "}
                      {resumen.failed}

                    </div>


                    {
                      resumen.hint &&
                      (

                        <div
                          className="text-muted small mb-2"
                        >

                          {resumen.hint}

                        </div>

                      )
                    }


                    <div
                      className="table-responsive"
                    >

                      <Table
                        bordered
                        size="sm"
                      >

                        <thead>

                          <tr>

                            <th>
                              Fila
                            </th>

                            <th>
                              OK
                            </th>

                            <th>
                              Plantilla ID
                            </th>

                            <th>
                              Instancia ID
                            </th>

                            <th>
                              Error
                            </th>

                          </tr>

                        </thead>


                        <tbody>

                          {
                            (
                              resumen.results ||
                              []
                            ).map(
                              (
                                r,
                                idx
                              ) => (

                                <tr
                                  key={
                                    idx
                                  }
                                >

                                  <td>
                                    {r.row}
                                  </td>

                                  <td>
                                    {
                                      r.ok
                                        ? "✔️"
                                        : "❌"
                                    }
                                  </td>

                                  <td>
                                    {
                                      r.plantilla_id ||
                                      "-"
                                    }
                                  </td>

                                  <td>
                                    {
                                      r.instancia_id ||
                                      "-"
                                    }
                                  </td>

                                  <td
                                    className="text-danger"
                                  >

                                    {
                                      r.error ||
                                      "-"
                                    }

                                  </td>

                                </tr>

                              )
                            )
                          }

                        </tbody>

                      </Table>

                    </div>

                  </>

                )
              }

            </Card.Body>

          </Card>

        </Col>

      </Row>

    </Container>

  );
}