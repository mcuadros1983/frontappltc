import React, { useState, useContext } from "react";
import { Container, Table, Button } from "react-bootstrap";
// import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../../context/Contexts";
import "../../../components/css/styles.css";

export default function VentasTotalesPorFecha() {
  const [ventasTotales, setVentasTotales] = useState([]);
  const [activeSucursales, setActiveSucursales] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const context = useContext(Contexts.DataContext);

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleFetchVentasTotales = async () => {
    if (!startDate || !endDate) {
      alert("Por favor, seleccione un rango de fechas válido.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/ventas/filtradas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fechaDesde: startDate, fechaHasta: endDate }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("data", data)
        if (data.length === 0) {
          alert("No existen ventas para la fecha indicada.");
          return;
        }
        processVentasTotales(data);
      } else {
        throw new Error("Error al obtener las ventas totales");
      }
    } catch (error) {
      setError("No se pudieron obtener las ventas: " + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const processVentasTotales = (ventas) => {
    let fechas = new Set(ventas.map((v) => v.fecha));
    let sucursales = context.sucursalesTabla.map((s) => s.id);
    let sucursalesActivas = new Set();
    let tabla = Array.from(fechas)
      .sort()
      .map((fecha) => {
        let fila = { fecha };
        sucursales.forEach((sucursalId) => {
          const total = ventas
            .filter(
              (v) => v.fecha === fecha && parseInt(v.sucursal_id) === sucursalId
            )
            .reduce((sum, curr) => sum + parseFloat(curr.monto), 0);
          fila[sucursalId] = total || 0;
          if (total > 0) {
            sucursalesActivas.add(sucursalId);
          }
        });
        return fila;
      });
    setVentasTotales(tabla);
    setActiveSucursales(sucursalesActivas);
  };
 
  return (
    <Container>
      <h1>Comparativo de ventas</h1>
      <div className="mb-3">
        <div className="d-inline-block w-auto">
          <label className="mr-2">DESDE: </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-control rounded-0 border-transparent text-center"
          />
        </div>
        <div className="d-inline-block w-auto ml-2">
          <label className="ml-2 mr-2">HASTA:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-control rounded-0 border-transparent text-center"
          />
        </div>
      </div>

      <div className="mb-3">
        <Button
          variant="primary"
          onClick={handleFetchVentasTotales}
          disabled={loading}
        >
          {loading ? "Cargando..." : "Buscar"}
        </Button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      <div className="fixed-table-container">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th className="fixed-first-column">Fecha</th>
              {context.sucursalesTabla
                .filter((sucursal) => activeSucursales.has(sucursal.id))
                .map((sucursal) => (
                  <th key={sucursal.id}>{sucursal.nombre}</th>
                ))}
            </tr>
          </thead>
          <tbody>
            {ventasTotales.map((fila, index) => (
              <tr key={index}>
                <td className="fixed-first-column">{fila.fecha}</td>
                {context.sucursalesTabla
                  .filter((sucursal) => activeSucursales.has(sucursal.id))
                  .map((sucursal) => (
                    <td key={sucursal.id}>
                      {fila[sucursal.id].toLocaleString("es-ES", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Container>
  );
}

// import React, { useState, useContext } from "react";
// import { Container, Button } from "react-bootstrap";
// import DataTable from 'react-data-table-component';
// import Contexts from "../../../context/Contexts";
// import "../../../components/css/styles.css";

// export default function VentasTotalesPorFecha() {
//   const [ventasTotales, setVentasTotales] = useState([]);
//   const [activeSucursales, setActiveSucursales] = useState(new Set());
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const context = useContext(Contexts.DataContext);

//   const apiUrl = process.env.REACT_APP_API_URL;

//   const handleFetchVentasTotales = async () => {
//     if (!startDate || !endDate) {
//       alert("Por favor, seleccione un rango de fechas válido.");
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await fetch(`${apiUrl}/ventas/filtradas`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ fechaDesde: startDate, fechaHasta: endDate }),
//       });
//       if (response.ok) {
//         const data = await response.json();
//         console.log("data", data)
//         if (data.length === 0) {
//           alert("No existen ventas para la fecha indicada.");
//           return;
//         }
//         processVentasTotales(data);
//       } else {
//         throw new Error("Error al obtener las ventas totales");
//       }
//     } catch (error) {
//       setError("No se pudieron obtener las ventas: " + error.message);
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const processVentasTotales = (ventas) => {
//     let fechas = new Set(ventas.map((v) => v.fecha));
//     let sucursales = context.sucursalesTabla.map((s) => s.id);
//     let sucursalesActivas = new Set();
//     let tabla = Array.from(fechas)
//       .sort()
//       .map((fecha) => {
//         let fila = { fecha };
//         sucursales.forEach((sucursalId) => {
//           const total = ventas
//             .filter(
//               (v) => v.fecha === fecha && parseInt(v.sucursal_id) === sucursalId
//             )
//             .reduce((sum, curr) => sum + parseFloat(curr.monto), 0);
//           fila[sucursalId] = total || 0;
//           if (total > 0) {
//             sucursalesActivas.add(sucursalId);
//           }
//         });
//         return fila;
//       });
//     setVentasTotales(tabla);
//     setActiveSucursales(sucursalesActivas);
//   };

//   const columns = [
//     {
//       name: 'Fecha',
//       selector: row => row.fecha,
//       sortable: true,
//     },
//     ...context.sucursalesTabla
//       .filter(sucursal => activeSucursales.has(sucursal.id))
//       .map(sucursal => ({
//         name: sucursal.nombre,
//         selector: row => row[sucursal.id] ? row[sucursal.id].toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 0,
//         sortable: true,
//       }))
//   ];

//   return (
//     <Container>
//       <h1>Comparativo de ventas</h1>
//       <div className="mb-3">
//         <div className="d-inline-block w-auto">
//           <label className="mr-2">DESDE: </label>
//           <input
//             type="date"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//             className="form-control rounded-0 border-transparent text-center"
//           />
//         </div>
//         <div className="d-inline-block w-auto ml-2">
//           <label className="ml-2 mr-2">HASTA:</label>
//           <input
//             type="date"
//             value={endDate}
//             onChange={(e) => setEndDate(e.target.value)}
//             className="form-control rounded-0 border-transparent text-center"
//           />
//         </div>
//       </div>

//       <div className="mb-3">
//         <Button
//           variant="primary"
//           onClick={handleFetchVentasTotales}
//           disabled={loading}
//         >
//           {loading ? "Cargando..." : "Buscar"}
//         </Button>
//       </div>

//       {error && <div className="alert alert-danger">{error}</div>}
//       <div className="fixed-table-container">
//         <DataTable
//           title="Ventas Totales"
//           columns={columns}
//           data={ventasTotales}
//           progressPending={loading}
//           pagination
//         />
//       </div>
//     </Container>
//   );
// }

// import React, { useState, useContext } from "react";
// import { Container, Table, Button } from "react-bootstrap";
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
// import Contexts from "../../../context/Contexts";
// import "../../../components/css/styles.css";

// export default function VentasTotalesPorFecha() {
//   const [ventasTotales, setVentasTotales] = useState([]);
//   const [activeSucursales, setActiveSucursales] = useState(new Set());
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [columns, setColumns] = useState([]);
//   const context = useContext(Contexts.DataContext);

//   const apiUrl = process.env.REACT_APP_API_URL;

//   const handleFetchVentasTotales = async () => {
//     if (!startDate || !endDate) {
//       alert("Por favor, seleccione un rango de fechas válido.");
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await fetch(`${apiUrl}/ventas/filtradas`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ fechaDesde: startDate, fechaHasta: endDate }),
//       });
//       if (response.ok) {
//         const data = await response.json();
//         console.log("data", data);
//         if (data.length === 0) {
//           alert("No existen ventas para la fecha indicada.");
//           return;
//         }
//         processVentasTotales(data);
//       } else {
//         throw new Error("Error al obtener las ventas totales");
//       }
//     } catch (error) {
//       setError("No se pudieron obtener las ventas: " + error.message);
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const processVentasTotales = (ventas) => {
//     let fechas = new Set(ventas.map((v) => v.fecha));
//     let sucursales = context.sucursalesTabla.map((s) => s.id);
//     let sucursalesActivas = new Set();
//     let tabla = Array.from(fechas)
//       .sort()
//       .map((fecha) => {
//         let fila = { fecha };
//         sucursales.forEach((sucursalId) => {
//           const total = ventas
//             .filter(
//               (v) => v.fecha === fecha && parseInt(v.sucursal_id) === sucursalId
//             )
//             .reduce((sum, curr) => sum + parseFloat(curr.monto), 0);
//           fila[sucursalId] = total || 0;
//           if (total > 0) {
//             sucursalesActivas.add(sucursalId);
//           }
//         });
//         return fila;
//       });
//     setVentasTotales(tabla);

//     // Inicializar las columnas con la columna de fecha primero
//     const initialColumns = [
//       {
//         id: 'fecha',
//         name: 'Fecha',
//       },
//       ...context.sucursalesTabla
//         .filter(sucursal => sucursalesActivas.has(sucursal.id))
//         .map(sucursal => ({
//           id: sucursal.id.toString(),
//           name: sucursal.nombre,
//         }))
//     ];
//     setColumns(initialColumns);
//   };

//   const onDragEnd = (result) => {
//     if (!result.destination) return;

//     const reorderedColumns = Array.from(columns);
//     const [removed] = reorderedColumns.splice(result.source.index, 1);
//     reorderedColumns.splice(result.destination.index, 0, removed);

//     setColumns(reorderedColumns);
//   };

//   return (
//     <Container>
//       <h1>Comparativo de ventas</h1>
//       <div className="mb-3">
//         <div className="d-inline-block w-auto">
//           <label className="mr-2">DESDE: </label>
//           <input
//             type="date"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//             className="form-control rounded-0 border-transparent text-center"
//           />
//         </div>
//         <div className="d-inline-block w-auto ml-2">
//           <label className="ml-2 mr-2">HASTA:</label>
//           <input
//             type="date"
//             value={endDate}
//             onChange={(e) => setEndDate(e.target.value)}
//             className="form-control rounded-0 border-transparent text-center"
//           />
//         </div>
//       </div>

//       <div className="mb-3">
//         <Button
//           variant="primary"
//           onClick={handleFetchVentasTotales}
//           disabled={loading}
//         >
//           {loading ? "Cargando..." : "Buscar"}
//         </Button>
//       </div>

//       {error && <div className="alert alert-danger">{error}</div>}
//       <div className="fixed-table-container">
//         <DragDropContext onDragEnd={onDragEnd}>
//           <Droppable droppableId="droppable" direction="horizontal">
//             {(provided) => (
//               <table className="table" ref={provided.innerRef} {...provided.droppableProps}>
//                 <thead>
//                   <tr>
//                     {columns.map((col, index) => (
//                       <Draggable key={col.id} draggableId={col.id} index={index}>
//                         {(provided) => (
//                           <th
//                             ref={provided.innerRef}
//                             {...provided.draggableProps}
//                             {...provided.dragHandleProps}
//                             className={index === 0 ? "fixed-first-column" : ""}
//                           >
//                             {col.name}
//                           </th>
//                         )}
//                       </Draggable>
//                     ))}
//                     {provided.placeholder}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {ventasTotales.map((fila, index) => (
//                     <tr key={index}>
//                       {columns.map((col) => (
//                         <td key={col.id} className={col.id === 'fecha' ? "fixed-first-column" : ""}>
//                           {col.id === 'fecha' ? fila.fecha : fila[col.id]?.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                         </td>
//                       ))}
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </Droppable>
//         </DragDropContext>
//       </div>
//     </Container>
//   );
// }
