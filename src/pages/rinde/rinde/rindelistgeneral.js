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

    // const handleFilter = async () => {
    //     try {
    //         const response = await fetch(`${apiUrl}/general/obtenerrindesfiltrados`, {
    //             method: "POST",
    //             credentials: "include",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({
    //                 mes: searchMes,
    //                 anio: searchAnio
    //             }),
    //         });

    //         if (response.ok) {
    //             const data = await response.json();
    //             setRindes(data.rindes);
    //             setCurrentPage(1);
    //         } else {
    //             throw new Error("Error al filtrar rindes generales");
    //         }
    //     } catch (error) {
    //         console.error(error);
    //     }
    // };

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
        <Container>
            <h2 className="my-4 text-center">Rindes Generales</h2>

            {/* <div className="d-flex mb-3 gap-3">
                <FormControl
                    type="number"
                    placeholder="Mes"
                    value={searchMes}
                    onChange={(e) => setSearchMes(e.target.value)}
                    style={{ maxWidth: 150 }}
                />
                <FormControl
                    type="number"
                    placeholder="Año"
                    value={searchAnio}
                    onChange={(e) => setSearchAnio(e.target.value)}
                    style={{ maxWidth: 150 }}
                />
                <Button onClick={handleFilter}>Filtrar</Button>
            </div> */}

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th onClick={() => handleSort("mes")}>Mes</th>
                        <th onClick={() => handleSort("anio")}>Año</th>
                        <th onClick={() => handleSort("totalKg")}>Kg Carne</th>
                        <th onClick={() => handleSort("rinde")}>% Rinde</th>
                        <th onClick={() => handleSort("eficiencia")}>Eficiencia</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {currentRindes.map((r) => (
                        <tr key={r.id}>
                            <td>{r.mes}</td>
                            <td>{r.anio}</td>
                            <td>{r.totalKg}</td>
                            <td>{r.rinde ? `${parseFloat(r.rinde * 100).toFixed(2)}%` : "-"}</td>
                            <td>{r.eficiencia ? `$${parseFloat(r.eficiencia).toFixed(2)}` : "-"}</td>
                            <td>
                                <Button variant="danger" onClick={() => handleEliminarRinde(r.id)}>
                                    Eliminar
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <div className="d-flex justify-content-center align-items-center">
                <Button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
                    <BsChevronLeft />
                </Button>
                <span className="mx-3">
                    Página {currentPage} de {Math.ceil(rindes.length / rindesPerPage)}
                </span>
                <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(rindes.length / rindesPerPage)))}
                >
                    <BsChevronRight />
                </Button>
            </div>
        </Container>
    );
}
