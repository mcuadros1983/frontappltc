import React from 'react';
import { Table, Container, Button } from "react-bootstrap";

const Pagination = ({
    filteredElements,
    currentPage,
    elementsPerPage,
    setCurrentPage
}) => {
    const indexOfLastElement = currentPage * elementsPerPage;
    const indexOfFirstElement = indexOfLastElement - elementsPerPage;
    const currentFilteredElements = filteredElements.slice(
        indexOfFirstElement,
        indexOfLastElement
    );
    const pageNumbers = [];
    for (
        let i = 1;
        i <= Math.ceil(filteredElements.length / elementsPerPage);
        i++
    ) {
        pageNumbers.push(i);
    }

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div>
            {/* Renderizar los botones de paginación */}
            {pageNumbers.map((number) => (
                <Button
                    key={number}
                    onClick={() => paginate(number)}
                    className="mx-1" // Agrega una pequeña separación horizontal entre los botones
                >
                    {number}
                </Button>
            ))}
        </div>
    );
};

export default Pagination;