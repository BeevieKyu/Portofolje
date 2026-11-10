import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:2169";
import ButtonLight from "./ButtonLight.jsx";
import { apiRequest } from "../../utils/api.js";
import { useAuth } from "../../context/auth-context.jsx";
import "../../styles/styles.css";

export default function InventoryAdmin() {
  const { authHeaders } = useAuth();
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadInventory = async () => {
      try {
        const data = await apiRequest("/api/v1/inventory");
        setRows(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadInventory();
  }, []);

  const addRow = async () => {
    try {
      const createdItem = await apiRequest("/api/v1/inventory", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          name: "New Product",
          quantity: 0,
          available: 0,
          description: "",
        }),
      });
      setRows((prev) => [...prev, createdItem]);
    } catch (err) {
      setError(err.message);
    }
  };

  const [editingCell, setEditingCell] = useState(null);

  const deleteRow = async (id) => {
    try {
      await apiRequest(`/api/v1/inventory/${id}`, { method: "DELETE", headers: authHeaders });
      setRows((prev) => prev.filter((row) => row._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const updateCell = (id, field, value) => {
    const numberFields = ["quantity", "available"];
    setRows((prev) =>
      prev.map((row) =>
        row._id === id
          ? {
              ...row,
              [field]: numberFields.includes(field)
                ? Math.max(0, parseInt(value) || 0)
                : value,
            }
          : row,
      ),
    );
  };

  const saveRowField = async (id, field, value, file = null) => {
    try {
      if (file && field === "image") {
        // Handle file upload with FormData
        const formData = new FormData();
        formData.append("image", file);
        await apiRequest(`/api/v1/inventory/${id}`, {
          method: "PATCH",
          headers: authHeaders,
          body: formData,
        });
      } else {
        // Handle regular field updates
        await apiRequest(`/api/v1/inventory/${id}`, {
          method: "PATCH",
          headers: authHeaders,
          body: JSON.stringify({ [field]: value }),
        });
      }
    } catch (err) {
      setError(err.message);
      const data = await apiRequest("/api/v1/inventory");
      setRows(data);
    }
  };

  if (isLoading) {
    return <p>Loading inventory...</p>;
  }

  return (
    <div className="inventory-container">
      <div className="inventory-wrapper">
        <div className="inventory-header">
          <h1>Inventory</h1>
          {error ? <p className="error-message">{error}</p> : null}
        </div>

        <div className="table-container">
          <div className="table-scroll">
            <table className="inventory-table">
              <thead>
                <tr className="table-header-row">
                  <th className="table-header-cell">Product Name</th>
                  <th className="table-header-cell table-header-center">
                    Quantity
                  </th>
                  <th className="table-header-cell table-header-center">
                    Available
                  </th>
                  <th className="table-header-cell table-header-center"> 
                    Description
                  </th>
                  <th className="table-header-cell table-header-center">
                    Image
                  </th>
                  <th className="table-header-cell table-header-center table-action-col">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row._id}
                    className={`table-row ${index % 2 === 0 ? "table-row-alt" : ""}`}
                  >
                    <td className="table-cell">
                      {editingCell?.id === row._id &&
                      editingCell?.field === "name" ? (
                        <input
                          autoFocus
                          type="text"
                          value={row.name}
                          onChange={(e) =>
                            updateCell(row._id, "name", e.target.value)
                          }
                          onBlur={async () => {
                            await saveRowField(row._id, "name", row.name);
                            setEditingCell(null);
                          }}
                          onKeyDown={async (e) => {
                            if (e.key === "Enter") {
                              await saveRowField(row._id, "name", row.name);
                              setEditingCell(null);
                            }
                          }}
                          className="cell-input"
                        />
                      ) : (
                        <div
                          onClick={() =>
                            setEditingCell({ id: row._id, field: "name" })
                          }
                          className="cell-content"
                        >
                          {row.name || "-"}
                        </div>
                      )}
                    </td>

                    <td className="table-cell table-cell-center">
                      {editingCell?.id === row._id &&
                      editingCell?.field === "quantity" ? (
                        <input
                          autoFocus
                          type="number"
                          min="0"
                          value={row.quantity}
                          onChange={(e) =>
                            updateCell(row._id, "quantity", e.target.value)
                          }
                          onBlur={async () => {
                            await saveRowField(
                              row._id,
                              "quantity",
                              row.quantity,
                            );
                            setEditingCell(null);
                          }}
                          onKeyDown={async (e) => {
                            if (e.key === "Enter") {
                              await saveRowField(
                                row._id,
                                "quantity",
                                row.quantity,
                              );
                              setEditingCell(null);
                            }
                          }}
                          className="cell-input cell-input-number"
                        />
                      ) : (
                        <div
                          onClick={() =>
                            setEditingCell({ id: row._id, field: "quantity" })
                          }
                          className="cell-badge"
                        >
                          {row.quantity}
                        </div>
                      )}
                    </td>

                    <td className="table-cell table-cell-center">
                      {editingCell?.id === row._id &&
                      editingCell?.field === "available" ? (
                        <input
                          autoFocus
                          type="number"
                          min="0"
                          value={row.available}
                          onChange={(e) =>
                            updateCell(row._id, "available", e.target.value)
                          }
                          onBlur={async () => {
                            await saveRowField(
                              row._id,
                              "available",
                              row.available,
                            );
                            setEditingCell(null);
                          }}
                          onKeyDown={async (e) => {
                            if (e.key === "Enter") {
                              await saveRowField(
                                row._id,
                                "available",
                                row.available,
                              );
                              setEditingCell(null);
                            }
                          }}
                          className="cell-input cell-input-number"
                        />
                      ) : (
                        <div
                          onClick={() =>
                            setEditingCell({ id: row._id, field: "available" })
                          }
                          className="cell-badge"
                        >
                          {row.available}
                        </div>
                      )}
                    </td>

                     <td className="table-cell">
                      {editingCell?.id === row._id &&
                      editingCell?.field === "description" ? (
                        <input
                          autoFocus
                          type="text"
                          value={row.description || ""}
                          onChange={(e) =>
                            updateCell(row._id, "description", e.target.value)
                          }
                          onBlur={async () => {
                            await saveRowField(row._id, "description", row.description);
                            setEditingCell(null);
                          }}
                          onKeyDown={async (e) => {
                            if (e.key === "Enter") {
                              await saveRowField(row._id, "description", row.description);
                              setEditingCell(null);
                            }
                          }}
                          className="cell-input"
                        />
                      ) : (
                        <div
                          onClick={() =>
                            setEditingCell({ id: row._id, field: "description" })
                          }
                          className="cell-content"
                        >
                          {row.description || "-"}
                        </div>
                      )}
                    </td>

                     <td className="table-cell">
                      {editingCell?.id === row._id &&
                      editingCell?.field === "image" ? (
                        <input
                          autoFocus
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              saveRowField(row._id, "image", null, file);
                              setEditingCell(null);
                            }
                          }}
                          className="cell-input"
                        />
                      ) : (
                        <div
                          onClick={() =>
                            setEditingCell({ id: row._id, field: "image" })
                          }
                          className="cell-content"
                        >
                          {row.image ? (
                            <a href={row.image.startsWith("/") ? `${API_BASE_URL}${row.image}` : row.image} target="_blank" rel="noopener noreferrer">
                              View image
                            </a>
                          ) : (
                            "-"
                          )}
                        </div>
                      )}
                    </td>

                    <td className="table-cell table-cell-center">
                      <button
                        onClick={() => deleteRow(row._id)}
                        className="delete-btn"
                        type="button"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <ButtonLight onClick={addRow} className="btn-primary" type="button">
              Add Product
            </ButtonLight>
          </div>
        </div>
      </div>
    </div>
  );
} 