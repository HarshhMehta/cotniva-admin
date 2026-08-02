"use client";
import React, { useCallback, useEffect, useState } from "react";
import Wrapper from "@/layout/wrapper";
import { notifyError, notifySuccess } from "@/utils/toast";
import GalleryMediaUpload from "../components/gallery/gallery-media-upload";

const API = () => `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/size-guide`;

const emptyForm = () => ({
  title: "",
  unitLabel: "BODY MEASUREMENTS IN INCHES",
  sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  rows: [
    { label: "CHEST", values: ["", "", "", "", "", ""] },
    { label: "LENGTH", values: ["", "", "", "", "", ""] },
  ],
  tip: "TIP: If you don't find your exact size, go for the next size.",
  howToMeasure: [
    {
      label: "CHEST",
      text: "Measure from the stitches right below the armpit, from one side to the other.",
    },
    {
      label: "LENGTH",
      text: "Measure from where the shoulder seam meets the collar down to the hem.",
    },
  ],
  tagline: "SIMPLE, RIGHT? NOW YOU'RE READY TO OWN YOUR PERFECT FIT!",
  diagramImage: "",
  status: "Show",
});

export default function SizeGuidePage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [diagramSubmitted, setDiagramSubmitted] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API()}/all`);
      const data = await res.json();
      if (data.success) setList(data.data || []);
    } catch {
      notifyError("Failed to load size guides");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setEditId(null);
    setForm(emptyForm());
    setDiagramSubmitted(true);
    setTimeout(() => setDiagramSubmitted(false), 0);
  };

  const syncRowLengths = (sizes, rows) =>
    rows.map((row) => {
      const values = [...(row.values || [])];
      while (values.length < sizes.length) values.push("");
      return { ...row, values: values.slice(0, sizes.length) };
    });

  const setSizesCsv = (csv) => {
    const sizes = csv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (sizes.length === 0) return;
    setForm((f) => ({
      ...f,
      sizes,
      rows: syncRowLengths(sizes, f.rows),
    }));
  };

  const updateCell = (rowIdx, colIdx, value) => {
    setForm((f) => {
      const rows = f.rows.map((r, i) => {
        if (i !== rowIdx) return r;
        const values = [...r.values];
        values[colIdx] = value;
        return { ...r, values };
      });
      return { ...f, rows };
    });
  };

  const updateRowLabel = (rowIdx, label) => {
    setForm((f) => {
      const rows = f.rows.map((r, i) => (i === rowIdx ? { ...r, label } : r));
      return { ...f, rows };
    });
  };

  const addRow = () => {
    setForm((f) => ({
      ...f,
      rows: [
        ...f.rows,
        { label: "NEW", values: f.sizes.map(() => "") },
      ],
    }));
  };

  const removeRow = (rowIdx) => {
    setForm((f) => ({
      ...f,
      rows: f.rows.filter((_, i) => i !== rowIdx),
    }));
  };

  const updateHowTo = (idx, field, value) => {
    setForm((f) => {
      const howToMeasure = f.howToMeasure.map((h, i) =>
        i === idx ? { ...h, [field]: value } : h
      );
      return { ...f, howToMeasure };
    });
  };

  const addHowTo = () => {
    setForm((f) => ({
      ...f,
      howToMeasure: [...f.howToMeasure, { label: "", text: "" }],
    }));
  };

  const removeHowTo = (idx) => {
    setForm((f) => ({
      ...f,
      howToMeasure: f.howToMeasure.filter((_, i) => i !== idx),
    }));
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setForm({
      title: item.title || "",
      unitLabel: item.unitLabel || "BODY MEASUREMENTS IN INCHES",
      sizes: item.sizes?.length ? item.sizes : emptyForm().sizes,
      rows: item.rows?.length
        ? syncRowLengths(item.sizes || emptyForm().sizes, item.rows)
        : emptyForm().rows,
      tip: item.tip || "",
      howToMeasure: item.howToMeasure?.length
        ? item.howToMeasure
        : emptyForm().howToMeasure,
      tagline: item.tagline || "",
      diagramImage: item.diagramImage || "",
      status: item.status || "Show",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      notifyError("Title is required");
      return;
    }
    setSaving(true);
    try {
      const url = editId ? `${API()}/edit/${editId}` : `${API()}/add`;
      const method = editId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        notifyError(data.message || "Save failed");
        return;
      }
      notifySuccess(editId ? "Size guide updated" : "Size guide created");
      resetForm();
      await load();
    } catch {
      notifyError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this size guide?")) return;
    try {
      const res = await fetch(`${API()}/delete/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        notifySuccess("Deleted");
        if (editId === id) resetForm();
        await load();
      } else notifyError("Delete failed");
    } catch {
      notifyError("Delete failed");
    }
  };

  return (
    <Wrapper>
      <div className="body-content px-8 py-8 bg-slate-100">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-heading">Size Guides</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create charts once (Kurti, Co-ord, Saree…) then attach them to products.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Form */}
          <div className="col-span-12 xl:col-span-7">
            <form
              onSubmit={handleSave}
              className="bg-white rounded-md px-6 py-6 space-y-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-heading">
                  {editId ? "Edit Size Guide" : "Add Size Guide"}
                </h2>
                {editId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-sm text-theme underline"
                  >
                    Cancel edit
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="e.g. Kurti Size Chart"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Unit label</label>
                <input
                  value={form.unitLabel}
                  onChange={(e) => setForm({ ...form, unitLabel: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="BODY MEASUREMENTS IN INCHES"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Sizes (comma separated)
                </label>
                <input
                  value={form.sizes.join(", ")}
                  onChange={(e) => setSizesCsv(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="XS, S, M, L, XL, XXL"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Measurement table</label>
                  <button
                    type="button"
                    onClick={addRow}
                    className="text-xs text-theme font-medium"
                  >
                    + Add row
                  </button>
                </div>
                <div className="overflow-x-auto border border-gray-200 rounded">
                  <table className="w-full text-sm min-w-[520px]">
                    <thead>
                      <tr className="bg-gray-700 text-white">
                        <th className="px-2 py-2 text-left">SIZE</th>
                        {form.sizes.map((s) => (
                          <th key={s} className="px-2 py-2 text-center">
                            {s}
                          </th>
                        ))}
                        <th className="px-2 py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {form.rows.map((row, ri) => (
                        <tr key={ri} className="border-t border-gray-200">
                          <td className="px-2 py-1 bg-gray-100">
                            <input
                              value={row.label}
                              onChange={(e) => updateRowLabel(ri, e.target.value)}
                              className="w-24 border border-gray-300 rounded px-2 py-1 text-xs font-semibold uppercase"
                            />
                          </td>
                          {form.sizes.map((_, ci) => (
                            <td key={ci} className="px-1 py-1">
                              <input
                                value={row.values[ci] || ""}
                                onChange={(e) => updateCell(ri, ci, e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-xs text-center"
                                placeholder="—"
                              />
                            </td>
                          ))}
                          <td className="px-2 py-1">
                            <button
                              type="button"
                              onClick={() => removeRow(ri)}
                              className="text-red text-xs"
                              disabled={form.rows.length <= 1}
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tip</label>
                <input
                  value={form.tip}
                  onChange={(e) => setForm({ ...form, tip: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">How to measure</label>
                  <button type="button" onClick={addHowTo} className="text-xs text-theme font-medium">
                    + Add
                  </button>
                </div>
                <div className="space-y-3">
                  {form.howToMeasure.map((h, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <input
                        value={h.label}
                        onChange={(e) => updateHowTo(i, "label", e.target.value)}
                        className="w-28 border border-gray-300 rounded px-2 py-2 text-sm font-semibold uppercase"
                        placeholder="CHEST"
                      />
                      <input
                        value={h.text}
                        onChange={(e) => updateHowTo(i, "text", e.target.value)}
                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                        placeholder="Measurement instructions"
                      />
                      <button
                        type="button"
                        onClick={() => removeHowTo(i)}
                        className="text-red text-sm mt-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tagline</label>
                <input
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Farma / diagram image
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Upload the measurement schematic (t-shirt / kurti farma drawing). Optional.
                </p>
                <GalleryMediaUpload
                  mediaType="image"
                  mediaUrl={form.diagramImage}
                  setMediaUrl={(val) => {
                    setForm((f) => ({
                      ...f,
                      diagramImage:
                        typeof val === "function" ? val(f.diagramImage) : val,
                    }));
                  }}
                  isSubmitted={diagramSubmitted}
                  setIsSubmitted={setDiagramSubmitted}
                  inputId="size-guide-diagram"
                />
                {form.diagramImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setForm((f) => ({ ...f, diagramImage: "" }));
                      setDiagramSubmitted(true);
                      setTimeout(() => setDiagramSubmitted(false), 0);
                    }}
                    className="text-xs text-red underline mt-1"
                  >
                    Remove diagram image
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="Show">Show</option>
                  <option value="Hide">Hide</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="tp-btn px-6 py-2.5 disabled:opacity-60"
              >
                {saving ? "Saving…" : editId ? "Update Size Guide" : "Create Size Guide"}
              </button>
            </form>
          </div>

          {/* List */}
          <div className="col-span-12 xl:col-span-5">
            <div className="bg-white rounded-md px-6 py-6">
              <h2 className="text-base font-semibold text-heading mb-4">
                All Size Guides
              </h2>
              {loading && <p className="text-sm text-gray-500">Loading…</p>}
              {!loading && list.length === 0 && (
                <p className="text-sm text-gray-500">
                  No size guides yet. Create “Kurti Size Chart” etc. on the left.
                </p>
              )}
              <ul className="space-y-3">
                {list.map((item) => (
                  <li
                    key={item._id}
                    className="border border-gray-200 rounded px-4 py-3 flex items-start justify-between gap-3"
                  >
                    <div>
                      <p className="font-semibold text-sm text-heading">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {(item.sizes || []).join(" · ")} · {item.status}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        className="text-xs px-2 py-1 border border-red text-red rounded hover:bg-red hover:text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
