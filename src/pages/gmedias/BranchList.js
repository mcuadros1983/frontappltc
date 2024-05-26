import { useEffect, useState, useCallback } from "react";
import { Table, Container } from "react-bootstrap";
// import { useNavigate } from "react-router-dom";
// import { createAuthenticatedRequest } from "../../utils/createAuthenticatedRequest";
// import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

export default function BranchList() {
  const [branches, setBranches] = useState([]);
  // const [currentPage, setCurrentPage] = useState(1);
  // const [branchesPerPage] = useState(10); // Puedes ajustar este número según tus necesidades

  // const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const loadBranches = useCallback(async () => {
    const res = await fetch(`${apiUrl}/sucursales/`, {
      credentials: "include",
    });
    const data = await res.json();
    const sortedBranches = data.sort((a, b) => a.id - b.id);
    setBranches(sortedBranches);

  },[apiUrl]);

  // const handleDelete = async (id) => {
  //   const confirmDelete = window.confirm(
  //     "¿Estás seguro de que deseas eliminar esta sucursal?"
  //   );
  //   if (!confirmDelete) {
  //     return;
  //   }
  //   try {
  //     const res = await fetch(`${apiUrl}/sucursales/${id}`, {
  //       credentials: "include",
  //       method: "DELETE",
  //     });

  //     setBranches(branches.filter((branch) => branch.id !== id));
    
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  // Paginación lógica
  // const indexOfLastBranch = currentPage * branchesPerPage;
  // const indexOfFirstBranch = indexOfLastBranch - branchesPerPage;
  // const currentBranches = branches.slice(indexOfFirstBranch, indexOfLastBranch);

  // const nextPage = () => {
  //   if (currentPage < Math.ceil(branches.length / branchesPerPage)) {
  //     setCurrentPage(currentPage + 1);
  //   }
  // };

  // const prevPage = () => {
  //   if (currentPage > 1) {
  //     setCurrentPage(currentPage - 1);
  //   }
  // };


  return (
    <Container>
      <h1 className="my-list-title dark-text">Lista de Sucursales</h1>
      {/* <Table striped bordered hover variant="dark"> */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre Sucursal</th>
            <th>Codigo de la Sucursal</th>
            {/* <th>Operaciones</th> */}
          </tr>
        </thead>
        <tbody>
          {branches.map((branch) => (
            <tr key={branch.id}>
              <td>{branch.id}</td>
              <td>{branch.nombre}</td>
              <td>{branch.codigo}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      
    </Container>
  );
}
