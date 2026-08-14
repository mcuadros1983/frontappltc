import React, { useEffect, useMemo, useState } from "react";
import { Alert } from "react-bootstrap";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

import {
  ERPPage,
  ERPCard,
  ERPToolbar,
  ERPSearch,
  ERPButton,
  ERPTable,
  ERPModal,
  ERPForm,
  ERPConfirm,
  ERPBadge,
} from "../../components/common/erp";

import { evaluacionConfiguracionApi } from "../../services/evaluacion/configuracionApi";

const initialForm = {
  codigo: "",
  descripcion: "",
  activo: true,
};

const TiposPage = () => {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await evaluacionConfiguracionApi.listarTipos();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Error al cargar tipos de evaluación");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return rows;

    return rows.filter((item) => {
      return (
        String(item.codigo || "").toLowerCase().includes(term) ||
        String(item.descripcion || "").toLowerCase().includes(term)
      );
    });
  }, [rows, search]);

  const openNew = () => {
    setSelected(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEdit = (row) => {
    setSelected(row);
    setForm({
      codigo: row.codigo || "",
      descripcion: row.descripcion || "",
      activo: row.activo !== false,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setSelected(null);
    setForm(initialForm);
    setShowModal(false);
  };

  const validate = () => {
    if (!form.codigo.trim()) {
      alert("El código es obligatorio");
      return false;
    }

    if (!form.descripcion.trim()) {
      alert("La descripción es obligatoria");
      return false;
    }

    return true;
  };

  const save = async () => {
    if (!validate()) return;

    try {
      setSaving(true);

      const payload = {
        codigo: form.codigo.trim().toUpperCase(),
        descripcion: form.descripcion.trim(),
        activo: form.activo,
      };

      if (selected?.id) {
        await evaluacionConfiguracionApi.actualizarTipo(selected.id, payload);
      } else {
        await evaluacionConfiguracionApi.crearTipo(payload);
      }

      closeModal();
      await load();
    } catch (err) {
      console.error(err);
      alert(err?.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const askDelete = (row) => {
    setDeleteTarget(row);
    setShowConfirm(true);
  };

  const closeConfirm = () => {
    setDeleteTarget(null);
    setShowConfirm(false);
  };

  const remove = async () => {
    if (!deleteTarget?.id) return;

    try {
      await evaluacionConfiguracionApi.eliminarTipo(deleteTarget.id);
      closeConfirm();
      await load();
    } catch (err) {
      console.error(err);
      alert(err?.message || "Error al eliminar");
    }
  };

  const columns = [
    {
      key: "codigo",
      title: "Código",
    },
    {
      key: "descripcion",
      title: "Descripción",
    },
    {
      key: "activo",
      title: "Estado",
      render: (row) => (
        <ERPBadge status={row.activo ? "ACTIVO" : "INACTIVO"} />
      ),
    },
  ];

  const fields = [
    {
      name: "codigo",
      label: "Código",
      type: "text",
      md: 4,
    },
    {
      name: "descripcion",
      label: "Descripción",
      type: "text",
      md: 8,
    },
    {
      name: "activo",
      label: "Activo",
      type: "checkbox",
      md: 12,
    },
  ];

  const actions = [
    {
      icon: <FiEdit2 />,
      variant: "outline-primary",
      onClick: openEdit,
    },
    {
      icon: <FiTrash2 />,
      variant: "outline-danger",
      onClick: askDelete,
    },
  ];

  return (
    <ERPPage
      title="Tipos de Evaluación"
      subtitle="Configuración del módulo de Evaluación"
    >
      {error && <Alert variant="danger">{error}</Alert>}

      <ERPCard>
        <ERPToolbar
          left={
            <ERPSearch
              value={search}
              onChange={setSearch}
              placeholder="Buscar por código o descripción..."
              width={360}
            />
          }
          right={
            <ERPButton type="new" onClick={openNew}>
              Nuevo Tipo
            </ERPButton>
          }
        />

        <ERPTable
          columns={columns}
          data={filteredRows}
          loading={loading}
          actions={actions}
        />
      </ERPCard>

      <ERPModal
        show={showModal}
        onHide={closeModal}
        title={selected ? "Editar Tipo de Evaluación" : "Nuevo Tipo de Evaluación"}
        footer={
          <>
            <ERPButton type="cancel" onClick={closeModal} disabled={saving} />
            <ERPButton type="save" onClick={save} disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </ERPButton>
          </>
        }
      >
        <ERPForm fields={fields} values={form} onChange={setForm} />
      </ERPModal>

      <ERPConfirm
        show={showConfirm}
        title="Eliminar Tipo de Evaluación"
        message={`¿Desea eliminar el tipo "${deleteTarget?.descripcion || ""}"?`}
        onCancel={closeConfirm}
        onConfirm={remove}
      />
    </ERPPage>
  );
};

export default TiposPage;