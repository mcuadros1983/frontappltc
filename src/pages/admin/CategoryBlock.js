import React, { useEffect, useRef } from "react";
import { Card, Form, Collapse } from "react-bootstrap";
import { FiChevronDown } from "react-icons/fi";

/**
 * Categoría de permisos con:
 * - Checkbox padre (seleccionar/deseleccionar todos los permisos de la categoría)
 * - Botón/área de colapso (expande/contrae la lista de permisos)
 * - Lista de checkboxes hijos (cada permiso)
 *
 * Props:
 * - title: string
 * - perms: string[]
 * - selected: string[]               // permisos seleccionados globales
 * - expanded: boolean                // estado visual (colapsado/expandido)
 * - onToggleExpand: () => void       // alterna expandir/contraer
 * - onToggleCategory: (checked:boolean) => void
 * - onTogglePerm: (permKey:string) => void
 */
export default function CategoryBlock({
  title,
  perms,
  selected,
  expanded,
  onToggleExpand,
  onToggleCategory,
  onTogglePerm,
}) {
  const allSelected = perms.every((p) => selected.includes(p));
  const noneSelected = perms.every((p) => !selected.includes(p));
  const parentRef = useRef(null);

  // Modo "indeterminate" cuando hay selección parcial
  useEffect(() => {
    if (parentRef.current) {
      parentRef.current.indeterminate = !allSelected && !noneSelected;
    }
  }, [allSelected, noneSelected]);

  const handleParentChange = (e) => onToggleCategory(e.target.checked);

  const toLabel = (key) => key.replace(":", " · ").replace(/\./g, " ");

  return (
    <Card className="mb-3">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <Form.Check
            type="checkbox"
            id={`cat-${title}`}
            label={<strong>{title}</strong>}
            checked={allSelected}
            onChange={handleParentChange}
            ref={parentRef}
          />
        </div>

        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={`cat-body-${title}`}
          onClick={onToggleExpand}
          className="btn btn-sm btn-link d-flex align-items-center gap-1 text-decoration-none"
          style={{ paddingRight: 0 }}
          title={expanded ? "Contraer" : "Expandir"}
        >
          <FiChevronDown
            style={{
              transition: "transform .2s",
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
            size={18}
          />
        </button>
      </Card.Header>

      <Collapse in={expanded}>
        <div id={`cat-body-${title}`}>
          <Card.Body className="py-2">
            {perms.map((p) => (
              <div key={p} className="mb-1">
                <Form.Check
                  type="checkbox"
                  id={`perm-${p}`}
                  label={toLabel(p)}
                  checked={selected.includes(p)}
                  onChange={() => onTogglePerm(p)}
                />
              </div>
            ))}
          </Card.Body>
        </div>
      </Collapse>
    </Card>
  );
}
