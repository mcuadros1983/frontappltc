import React, { useState, useEffect, useContext, useCallback } from "react";
import { Container, Table, Button, FormControl } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../../context/Contexts";

export default function ListaRindesGenerales() {
    const [rindes, setRindes] = useState([]);
    const [searchMes, setSearchMes] = useState("");
    const [searchAnio, setSearchAnio] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rindesPerPage] = useState(10);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");

    const context = useContext(Contexts.DataContext);
    const apiUrl = process.env.REACT_APP_API_URL;


    // const res = await fetch(`${apiUrl}/obtenerrindefiltrado`, {
    //     method: "POST",
    //     credentials: "include",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ mes, anio }),
    // });


    const obtenerRindes = useCallback(async () => {
        try {
            const res = await fetch(`${apiUrl}/general`,{
                method: "GET",
                credentials:"include"
            });
            if (res.ok) {
                const data = await res.json();
                setRindes(data.rindes);
            } else {
                throw new Error("Error al obtener los rindes generales");
            }
        } catch (error) {
            console.error("Error al obtener los rindes generales:", error);
        }
    }, [apiUrl]);

    useEffect(() => {
        obtenerRindes();
    }, [obtenerRindes]);



    const handleEliminarRinde = async (id) => {
        if (!window.confirm("¿Seguro que querés eliminar este rinde general?")) return;

        try {
            const response = await fetch(`${apiUrl}/general/${id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (response.ok) {
                setRindes(rindes.filter((r) => r.id !== id));
            } else {
                alert("Error al eliminar el rinde");
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    };

    const handleSort = (col) => {
        setSortDirection(col === sortColumn && sortDirection === "asc" ? "desc" : "asc");
        setSortColumn(col);

        const sorted = [...rindes].sort((a, b) => {
            const valA = parseFloat(a[col]) || 0;
            const valB = parseFloat(b[col]) || 0;
            return sortDirection === "asc" ? valA - valB : valB - valA;
        });

        setRindes(sorted);
    };

    const indexOfLast = currentPage * rindesPerPage;
    const indexOfFirst = indexOfLast - rindesPerPage;
    const currentRindes = rindes.slice(indexOfFirst, indexOfLast);

    return (
  <Container className="vt-page">
    <h2 className="my-list-title dark-text vt-title text-center">Rindes Generales</h2>

    <div className="vt-tablewrap table-responsive">
      <Table striped bordered hover className="mb-2">
        <thead>
          <tr>
            <th onClick={() => handleSort("mes")} className="vt-th-sort">Mes</th>
            <th onClick={() => handleSort("anio")} className="vt-th-sort">Año</th>
            <th onClick={() => handleSort("totalKg")} className="vt-th-sort text-end">Kg Carne</th>
            <th onClick={() => handleSort("rinde")} className="vt-th-sort text-end">% Rinde</th>
            <th onClick={() => handleSort("eficiencia")} className="vt-th-sort text-end">Eficiencia</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentRindes.map((r) => (
            <tr key={r.id}>
              <td>{r.mes}</td>
              <td>{r.anio}</td>
              <td className="text-end">{r.totalKg}</td>
              <td className="text-end">{r.rinde ? `${parseFloat(r.rinde * 100).toFixed(2)}%` : "-"}</td>
              <td className="text-end">{r.eficiencia ? `$${parseFloat(r.eficiencia).toFixed(2)}` : "-"}</td>
              <td className="text-center">
                <Button variant="danger" onClick={() => handleEliminarRinde(r.id)} size="sm" className="vt-btn-danger">
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>

    <div className="d-flex justify-content-center align-items-center vt-pager">
      <Button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} variant="light">
        <BsChevronLeft />
      </Button>
      <span className="mx-3">
        Página {currentPage} de {Math.ceil(rindes.length / rindesPerPage)}
      </span>
      <Button
        onClick={() =>
          setCurrentPage(prev => Math.min(prev + 1, Math.ceil(rindes.length / rindesPerPage)))
        }
        variant="light"
      >
        <BsChevronRight />
      </Button>
    </div>
  </Container>
);

}
