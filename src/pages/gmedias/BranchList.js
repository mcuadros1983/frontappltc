import { useEffect, useState, useCallback } from "react";
import { Table, Container } from "react-bootstrap";


export default function BranchList() {
  const [branches, setBranches] = useState([]);


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


  useEffect(() => {
    loadBranches();
  }, [loadBranches]);


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
