import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { FaPlus } from "react-icons/fa";
import { FiTrash2, FiChevronDown } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-toastify";
import {
    useFloors,
    useFloorMap,
    useCreateFloor,
    useCreateFloorMap,
    useDeleteFloorMap
} from "../../hooks/queries/useFloorPlan";
import tableService from "../../services/tableService";
import { FLOOR_KEYS, POS_KEYS } from "../../utils/queryKeys";

const getStorageKey = (floorId, floorName) =>
    `triaxx_floorplan_canvas_${floorId || floorName || "default"}`;

const readSavedPositions = (floorId, floorName) => {
    try {
        const raw =
            localStorage.getItem(getStorageKey(floorId, floorName)) ||
            localStorage.getItem(getStorageKey(null, floorName));
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const writeSavedPositions = (floorId, floorName, tables) => {
    try {
        const data = JSON.stringify(tables);
        if (floorId) localStorage.setItem(getStorageKey(floorId, floorName), data);
        if (floorName) localStorage.setItem(getStorageKey(null, floorName), data);
    } catch {
        // ignore storage quota errors
    }
};

export default function CreatePlan() {
    const { t } = useTranslation("common");
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();

    const { data: floors = [] } = useFloors();
    const createFloorMutation = useCreateFloor();
    const createFloorMapMutation = useCreateFloorMap();
    const deleteFloorMapMutation = useDeleteFloorMap();

    // Resolve floor tabs matching Figma ("Floor 01", "Floor 02", "Roof Top") + any passed floor
    const floorOptions = useMemo(() => {
        const defaults = ["Floor 01", "Floor 02", "Roof Top"];
        const passedName = location.state?.floorName;
        const passedId = location.state?.floorId;

        const names = [...defaults];
        if (passedName && !names.some((n) => n.toLowerCase() === passedName.toLowerCase())) {
            names.push(passedName);
        }

        return names.map((name, idx) => {
            const matched = floors.find(
                (f) => (f.Floor_Name || "").trim().toLowerCase() === name.trim().toLowerCase()
            );
            const fallbackFloor = floors[idx];
            const resolvedId =
                (passedName && name.toLowerCase() === passedName.toLowerCase() && passedId) ||
                matched?.Floor_id ||
                matched?._id ||
                fallbackFloor?.Floor_id ||
                fallbackFloor?._id ||
                null;

            return {
                Floor_id: resolvedId,
                Floor_Name: name
            };
        });
    }, [floors, location.state?.floorName, location.state?.floorId]);

    const [activeFloorName, setActiveFloorName] = useState(
        location.state?.floorName || "Floor 01"
    );

    const activeFloor = useMemo(
        () => floorOptions.find((f) => f.Floor_Name === activeFloorName) || floorOptions[0],
        [floorOptions, activeFloorName]
    );

    const { data: floorMapData } = useFloorMap(activeFloor?.Floor_id);

    // Build initial canvas tables
    const buildGeneratedTables = () => {
        if (
            location.state?.tableList &&
            Array.isArray(location.state.tableList) &&
            location.state.tableList.length > 0
        ) {
            const list = [];
            let count = 0;
            const inRow = location.state.tablesInRow || 3;
            location.state.tableList.forEach((grp) => {
                const grpCount = Number(grp.count || 1);
                for (let i = 0; i < grpCount; i++) {
                    count++;
                    const rowIdx = Math.floor((count - 1) / inRow);
                    const colIdx = (count - 1) % inRow;
                    list.push({
                        id: `table-gen-${count}`,
                        code: `T-${count}`,
                        name: `Table ${String(count).padStart(2, "0")}`,
                        type: grp.type || "Round Table",
                        capacity: Number(grp.capacity || 4),
                        place: "Indoor",
                        x: 80 + colIdx * 140,
                        y: 70 + rowIdx * 120
                    });
                }
            });
            return list;
        }
        return null;
    };

    const [canvasTables, setCanvasTables] = useState(() => {
        const generated = buildGeneratedTables();
        if (generated) return generated;

        const saved = readSavedPositions(location.state?.floorId, location.state?.floorName || "Floor 01");
        if (Array.isArray(saved) && saved.length > 0) return saved;

        return [
            {
                id: "table-seed-1",
                code: "T-1",
                name: "Table 01",
                type: "Round Table",
                capacity: 4,
                place: "Indoor",
                x: 80,
                y: 70
            }
        ];
    });

    const [isSavingPlan, setIsSavingPlan] = useState(false);

    // Dragging state
    const [draggedTableId, setDraggedTableId] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // Add Table Modal State matching media_1792071705963_635d374f.png
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [tableName, setTableName] = useState("Table 01");
    const [tableType, setTableType] = useState("Select Table Type");
    const [tableCapacity, setTableCapacity] = useState(0);
    const [tablePlace, setTablePlace] = useState("Select Table Place");

    // Sync tables when switching floors or when floorMapData loads from API
    useEffect(() => {
        // If user just came from Generate for this floor, keep generated layout until saved
        if (
            location.state?.tableList &&
            location.state?.floorName === activeFloorName &&
            canvasTables.some((tItem) => String(tItem.id).startsWith("table-gen-"))
        ) {
            return;
        }

        const savedLocal = readSavedPositions(activeFloor?.Floor_id, activeFloorName);
        const apiTables = Array.isArray(floorMapData?.tables) ? floorMapData.tables : [];

        if (apiTables.length > 0) {
            const mapped = apiTables.map((item, idx) => {
                const tableId = item.Table_id || item.table_id;
                const localMatch = Array.isArray(savedLocal)
                    ? savedLocal.find(
                          (s) =>
                              (tableId && String(s.Table_id) === String(tableId)) ||
                              s.code === `T-${idx + 1}` ||
                              s.name === (item["Table-name"] || item.Title)
                      )
                    : null;

                const rawCode = item["Table-code"] || item.table_code || "";
                const numMatch = rawCode.match(/(\d+)$/) || (item["Table-name"] || "").match(/(\d+)/);
                const cleanCode = numMatch ? `T-${Number(numMatch[1])}` : `T-${idx + 1}`;

                return {
                    id: item._id || item.id || `mapped-${tableId || idx}`,
                    Table_id: tableId || null,
                    floor_map_Table_id: item.floor_map_Table_id || null,
                    code: localMatch?.code || cleanCode,
                    name: item["Table-name"] || item.Title || item.table_name || `Table ${String(idx + 1).padStart(2, "0")}`,
                    type: item.table_type || localMatch?.type || "Round Table",
                    capacity: Number(item.Capacity || item["Seating-Persons_Count"] || item.capacity || localMatch?.capacity || 4),
                    place: item.Details || item.place || localMatch?.place || "Indoor",
                    x: localMatch?.x ?? item.x_coordinate ?? 80 + (idx % 5) * 145,
                    y: localMatch?.y ?? item.y_coordinate ?? 70 + Math.floor(idx / 5) * 125
                };
            });
            setCanvasTables(mapped);
        } else if (Array.isArray(savedLocal) && savedLocal.length > 0) {
            setCanvasTables(savedLocal);
        } else {
            setCanvasTables([
                {
                    id: "table-seed-1",
                    code: "T-1",
                    name: "Table 01",
                    type: "Round Table",
                    capacity: 4,
                    place: "Indoor",
                    x: 80,
                    y: 70
                }
            ]);
        }
    }, [floorMapData, activeFloor?.Floor_id, activeFloorName]);

    // Ensure active floor exists in backend, or create it on the fly
    const ensureBackendFloorId = async () => {
        if (activeFloor?.Floor_id) return Number(activeFloor.Floor_id) || activeFloor.Floor_id;
        try {
            const res = await createFloorMutation.mutateAsync({
                Floor_Name: activeFloorName,
                Total_Table_Count: Math.max(1, canvasTables.length),
                "Seating-Persons_Count": Math.max(4, canvasTables.length * 4),
                Details: `${activeFloorName} dining area`,
                floor_width: String(location.state?.rawWidth ?? location.state?.floorData?.floor_width ?? 200),
                floor_height: String(location.state?.rawLength ?? location.state?.floorData?.floor_height ?? 200),
                floor_length: String(location.state?.rawLength ?? location.state?.floorData?.floor_length ?? 200),
                floor_image: "https://example.com/floor.png",
                tables: [
                    {
                        table_type: "Round Table",
                        table_count: Math.max(1, canvasTables.length),
                        table_size: "200x200"
                    }
                ],
                Status: true
            });
            return res?.data?.Floor_id || res?.Floor_id || null;
        } catch {
            return floors[0]?.Floor_id || null;
        }
    };

    // Helper to persist a single canvas table to backend (/admin/table/create + /master/floor_map_table/create)
    const persistSingleTableToBackend = async (tbl, targetFloorId, rowIndex = 1) => {
        if (!targetFloorId) return tbl;
        try {
            const createdRes = await tableService.createTable({
                Title: tbl.name,
                "Table-name": tbl.name,
                "Table-code": tbl.code,
                Floor_id: Number(targetFloorId),
                Capacity: Number(tbl.capacity) || 4,
                "Seating-Persons_Count": Number(tbl.capacity) || 4,
                table_type: tbl.type || "Round Table",
                Details: tbl.place || "Indoor"
            });
            const createdTable = createdRes?.data || createdRes;
            const newTableId = createdTable?.Table_id;

            let floorMapId = null;
            if (newTableId) {
                try {
                    const mapRes = await createFloorMapMutation.mutateAsync({
                        floor_id: Number(targetFloorId),
                        table_id: Number(newTableId),
                        Row_No: rowIndex,
                        Status: true
                    });
                    floorMapId = mapRes?.data?.floor_map_Table_id || null;
                } catch {
                    // Table was created on Floor_id even if floor_map_table already exists
                }
            }

            return {
                ...tbl,
                id: createdTable?._id || tbl.id,
                Table_id: newTableId || tbl.Table_id || null,
                floor_map_Table_id: floorMapId || tbl.floor_map_Table_id || null
            };
        } catch {
            return tbl;
        }
    };

    const handleOpenAddModal = () => {
        const nextNum = canvasTables.length + 1;
        setTableName(`Table ${String(nextNum).padStart(2, "0")}`);
        setTableType("Select Table Type");
        setTableCapacity(0);
        setTablePlace("Select Table Place");
        setIsAddModalOpen(true);
    };

    const handleSaveTable = async (e) => {
        e.preventDefault();
        const nextNum = canvasTables.length + 1;
        const newCode = `T-${nextNum}`;

        // Compute non-overlapping position on canvas
        const newX = 80 + ((nextNum - 1) % 5) * 145;
        const newY = 70 + Math.floor((nextNum - 1) / 5) * 125;

        const newTable = {
            id: `table-local-${Date.now()}`,
            code: newCode,
            name: tableName.trim() || `Table ${String(nextNum).padStart(2, "0")}`,
            type: tableType === "Select Table Type" ? "Round Table" : tableType,
            capacity: Number(tableCapacity) > 0 ? Number(tableCapacity) : 4,
            place: tablePlace === "Select Table Place" ? "Indoor" : tablePlace,
            x: newX,
            y: newY
        };

        const updatedList = [...canvasTables, newTable];
        setCanvasTables(updatedList);
        writeSavedPositions(activeFloor?.Floor_id, activeFloorName, updatedList);
        setIsAddModalOpen(false);

        const targetFloorId = await ensureBackendFloorId();
        if (targetFloorId) {
            const persisted = await persistSingleTableToBackend(
                newTable,
                targetFloorId,
                Math.max(1, Math.ceil(nextNum / 4))
            );
            setCanvasTables((prev) => {
                const next = prev.map((item) => (item.id === newTable.id ? persisted : item));
                writeSavedPositions(targetFloorId, activeFloorName, next);
                return next;
            });
            queryClient.invalidateQueries({ queryKey: ["TABLES"] });
            queryClient.invalidateQueries({ queryKey: [FLOOR_KEYS.FLOOR_MAP] });
            queryClient.invalidateQueries({ queryKey: [FLOOR_KEYS.FLOOR_WITH_TABLES] });
        }

        toast.success(t("floorPlan.tableAdded", "Table added to floor plan!"));
    };

    const handleDeleteTable = async (tbl) => {
        setCanvasTables((prev) => {
            const next = prev.filter((item) => item.id !== tbl.id);
            writeSavedPositions(activeFloor?.Floor_id, activeFloorName, next);
            return next;
        });

        try {
            if (tbl.floor_map_Table_id) {
                await deleteFloorMapMutation.mutateAsync(tbl.floor_map_Table_id);
            }
        } catch {
            // ignore if not mapped in floor_map_table
        }

        try {
            if (tbl.Table_id) {
                await tableService.deleteTable(tbl.Table_id);
                queryClient.invalidateQueries({ queryKey: ["TABLES"] });
                queryClient.invalidateQueries({ queryKey: [FLOOR_KEYS.FLOOR_MAP] });
                queryClient.invalidateQueries({ queryKey: [FLOOR_KEYS.FLOOR_WITH_TABLES] });
            }
        } catch {
            // locally removed
        }

        toast.info(t("floorPlan.tableRemoved", "Table removed from floor plan"));
    };

    const handleSavePlan = async () => {
        setIsSavingPlan(true);
        try {
            const targetFloorId = await ensureBackendFloorId();
            const finalTables = [];

            for (let i = 0; i < canvasTables.length; i++) {
                const tbl = canvasTables[i];
                if (!tbl.Table_id && targetFloorId) {
                    const savedTbl = await persistSingleTableToBackend(
                        tbl,
                        targetFloorId,
                        Math.max(1, Math.ceil((i + 1) / 4))
                    );
                    finalTables.push(savedTbl);
                } else {
                    finalTables.push(tbl);
                }
            }

            setCanvasTables(finalTables);
            writeSavedPositions(targetFloorId, activeFloorName, finalTables);

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: [FLOOR_KEYS.FLOORS] }),
                queryClient.invalidateQueries({ queryKey: [FLOOR_KEYS.FLOOR_MAP] }),
                queryClient.invalidateQueries({ queryKey: [FLOOR_KEYS.FLOOR_WITH_TABLES] }),
                queryClient.invalidateQueries({ queryKey: [FLOOR_KEYS.ALL_FLOOR_MAPS] }),
                queryClient.invalidateQueries({ queryKey: [POS_KEYS.MAPPED_TABLES] }),
                queryClient.invalidateQueries({ queryKey: ["TABLES"] })
            ]);

            toast.success(t("floorPlan.planSaved", "Floor plan saved successfully!"));
            navigate("/dashboard/floorplan", {
                state: {
                    floorId: targetFloorId,
                    floorName: activeFloorName
                }
            });
        } catch (err) {
            toast.error(err?.message || "Failed to save floor plan");
        } finally {
            setIsSavingPlan(false);
        }
    };

    // Drag-and-drop handlers for placing tables on canvas
    const handleMouseDown = (e, table) => {
        setDraggedTableId(table.id);
        const rect = e.currentTarget.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    const handleMouseMove = (e) => {
        if (!draggedTableId) return;
        const canvas = document.getElementById("floorplan-canvas");
        if (!canvas) return;
        const canvasRect = canvas.getBoundingClientRect();

        const newX = Math.max(
            30,
            Math.min(canvasRect.width - 130, e.clientX - canvasRect.left - dragOffset.x)
        );
        const newY = Math.max(
            30,
            Math.min(canvasRect.height - 110, e.clientY - canvasRect.top - dragOffset.y)
        );

        setCanvasTables((prev) =>
            prev.map((tItem) => (tItem.id === draggedTableId ? { ...tItem, x: newX, y: newY } : tItem))
        );
    };

    const handleMouseUp = () => {
        if (draggedTableId) {
            setDraggedTableId(null);
            writeSavedPositions(activeFloor?.Floor_id, activeFloorName, canvasTables);
        }
    };

    return (
        <div
            className="pt-6 md:pt-8 min-h-screen bg-white font-poppins select-none flex flex-col justify-between"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            {/* Header: Breadcrumb & Floor Switcher + Add Tables CTA matching Figma node 690-53194 */}
            <div className="px-6 md:px-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                {/* Left Breadcrumb */}
                <div className="flex items-center gap-2.5 pt-1">
                    <span
                        onClick={() => navigate("/dashboard/floorplan/edit")}
                        className="text-xl md:text-2xl font-bold text-[#666666] cursor-pointer hover:text-[#6A1B9A] transition-colors"
                    >
                        {t("floorPlan.editFloorPlan", "Edit Floor Plan")}
                    </span>
                    <span className="text-xl md:text-2xl font-bold text-black">&gt;</span>
                    <span className="text-xl md:text-2xl font-bold text-[#666666]">
                        {t("floorPlan.createPlan", "Create Plan")}
                    </span>
                </div>

                {/* Right: Floor Switcher Tabs & + Add Tables Action stacked right matching Figma node 690-53194 */}
                <div className="flex flex-col items-end gap-4">
                    {/* Row 1: Floor Tabs */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        {floorOptions.map((flr) => {
                            const isActive = activeFloorName === flr.Floor_Name;
                            return (
                                <button
                                    key={flr.Floor_Name}
                                    type="button"
                                    onClick={() => setActiveFloorName(flr.Floor_Name)}
                                    className={`px-5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                                        isActive
                                            ? "bg-[linear-gradient(180deg,_#6A1B9A_0%,_#D32F2F_100%)] text-white shadow-xs"
                                            : "bg-[#FAF2F6] border border-[#9C27B0]/70 text-gray-900 hover:bg-[#F3E5EE]"
                                    }`}
                                >
                                    {flr.Floor_Name}
                                </button>
                            );
                        })}
                    </div>

                    {/* Row 2: + Add Tables Gradient CTA Button */}
                    <button
                        type="button"
                        onClick={handleOpenAddModal}
                        className="px-5 py-2 rounded-lg bg-[linear-gradient(180deg,_#6A1B9A_0%,_#D32F2F_100%)] text-white font-medium text-xs md:text-sm shadow-sm hover:opacity-95 transition-opacity flex items-center gap-2 cursor-pointer"
                    >
                        <FaPlus className="text-xs" />
                        <span>{t("floorPlan.addTables", "Add Tables")}</span>
                    </button>
                </div>
            </div>

            {/* Full-bleed Canvas Area with top and bottom divider lines matching Figma node 690-53194 */}
            <div className="border-t border-b border-gray-300 flex-1">
                <div
                    id="floorplan-canvas"
                    className="relative w-full h-[540px] md:h-[580px] bg-white overflow-hidden cursor-default"
                >
                    {canvasTables.map((tbl) => (
                        <div
                            key={tbl.id}
                            onMouseDown={(e) => handleMouseDown(e, tbl)}
                            style={{
                                left: `${tbl.x}px`,
                                top: `${tbl.y}px`
                            }}
                            className="absolute flex items-center justify-center cursor-move transition-transform active:scale-105 group"
                        >
                            {/* Table Surface with Chairs matching media_1792071712455_49eb2d9b.png */}
                            <div className="relative">
                                {/* Top Chair */}
                                <div className="w-8 h-4 rounded-t-md bg-[#E2E8F0] border border-[#CBD5E1] absolute -top-4 left-1/2 -translate-x-1/2 shadow-2xs">
                                    <div className="w-full h-1 border-b border-[#CBD5E1]" />
                                </div>

                                {/* Bottom Chair */}
                                <div className="w-8 h-4 rounded-b-md bg-[#E2E8F0] border border-[#CBD5E1] absolute -bottom-4 left-1/2 -translate-x-1/2 shadow-2xs">
                                    <div className="w-full h-1 border-t border-[#CBD5E1] mt-auto" />
                                </div>

                                {/* Left Chair */}
                                <div className="w-4 h-8 rounded-l-md bg-[#E2E8F0] border border-[#CBD5E1] absolute -left-4 top-1/2 -translate-y-1/2 shadow-2xs">
                                    <div className="h-full w-1 border-r border-[#CBD5E1]" />
                                </div>

                                {/* Right Chair */}
                                <div className="w-4 h-8 rounded-r-md bg-[#E2E8F0] border border-[#CBD5E1] absolute -right-4 top-1/2 -translate-y-1/2 shadow-2xs">
                                    <div className="h-full w-1 border-l border-[#CBD5E1] ml-auto" />
                                </div>

                                {/* Main Table Surface */}
                                <div className="relative w-20 h-14 bg-[#F9E8EC] border border-[#F3D1DC] rounded-xl flex items-center justify-center font-bold text-xs text-gray-900 shadow-2xs select-none">
                                    {/* 4 subtle corner dots matching media_1792071712455_49eb2d9b.png */}
                                    <div className="w-2 h-2 rounded-full bg-white border border-gray-300 absolute top-1 left-1/2 -translate-x-1/2 pointer-events-none" />
                                    <div className="w-2 h-2 rounded-full bg-white border border-gray-300 absolute bottom-1 left-1/2 -translate-x-1/2 pointer-events-none" />
                                    <div className="w-2 h-2 rounded-full bg-white border border-gray-300 absolute left-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <div className="w-2 h-2 rounded-full bg-white border border-gray-300 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />

                                    <span>{tbl.code}</span>
                                </div>

                                {/* Floating Delete Icon on Top Right of Table matching media_1792071712455_49eb2d9b.png */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTable(tbl);
                                    }}
                                    className="absolute -top-5 -right-5 w-7 h-7 rounded-full bg-white border border-gray-200/80 flex items-center justify-center text-[#E53935] shadow-sm hover:bg-red-50 transition-colors z-10 cursor-pointer"
                                    title={t("floorPlan.delete", "Delete")}
                                    aria-label={t("floorPlan.deleteConfiguredTable", { name: tbl.code })}
                                >
                                    <FiTrash2 aria-hidden="true" size={13} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Footer Bar with Centered Save Button matching Figma node 690-53194 */}
            <div className="py-5 px-6 flex justify-center bg-white">
                <button
                    type="button"
                    onClick={handleSavePlan}
                    disabled={isSavingPlan}
                    className="min-w-[200px] px-14 py-2.5 rounded-xl bg-[linear-gradient(180deg,_#6A1B9A_0%,_#D32F2F_100%)] text-white font-medium text-sm shadow-md hover:opacity-95 transition-opacity cursor-pointer disabled:opacity-60"
                >
                    {isSavingPlan
                        ? t("floorPlan.saving", "Saving...")
                        : t("floorPlan.save", "Save")}
                </button>
            </div>

            {/* Add Table Modal matching media_1792071705963_635d374f.png */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-7 shadow-2xl max-w-lg w-full relative animate-fadeIn border border-purple-100">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">
                                {t("floorPlan.addTable", "Add Table")}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-gray-700 hover:text-black transition-colors cursor-pointer"
                            >
                                <IoMdClose size={24} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSaveTable} className="space-y-5">
                            {/* Row 1: Table Name & Table Type */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-900 mb-1.5">
                                        {t("floorPlan.tableName", "Table Name")}
                                    </label>
                                    <input
                                        type="text"
                                        value={tableName}
                                        onChange={(e) => setTableName(e.target.value)}
                                        placeholder="Table 01"
                                        className="w-full bg-[#FAF4F7] border border-[#9C27B0]/70 rounded-xl px-4 py-2.5 text-xs text-gray-800 font-medium focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-900 mb-1.5">
                                        {t("floorPlan.tableType", "Table Type")}
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={tableType}
                                            onChange={(e) => setTableType(e.target.value)}
                                            className="w-full bg-[#FAF4F7] border border-[#9C27B0]/70 rounded-xl px-4 py-2.5 text-xs text-gray-800 font-medium appearance-none cursor-pointer focus:outline-none pr-8"
                                        >
                                            <option value="Select Table Type">
                                                {t("floorPlan.selectTableType", "Select Table Type")}
                                            </option>
                                            <option value="Round Table">
                                                {t("floorPlan.roundTable", "Round Table")}
                                            </option>
                                            <option value="Square Table">
                                                {t("floorPlan.squareTable", "Square Table")}
                                            </option>
                                            <option value="Rectangle Table">
                                                {t("floorPlan.rectangleTable", "Rectangle Table")}
                                            </option>
                                            <option value="Booth Table">
                                                {t("floorPlan.boothTable", "Booth Table")}
                                            </option>
                                        </select>
                                        <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none text-sm" />
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: Table Capacity & Table Place */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-900 mb-1.5">
                                        {t("floorPlan.tableCapacity", "Table Capacity")}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={tableCapacity}
                                        onChange={(e) => setTableCapacity(e.target.value)}
                                        className="w-full bg-[#FAF4F7] border border-[#9C27B0]/70 rounded-xl px-4 py-2 text-xs text-gray-800 font-medium focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-900 mb-1.5">
                                        {t("floorPlan.tablePlace", "Table Place")}
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={tablePlace}
                                            onChange={(e) => setTablePlace(e.target.value)}
                                            className="w-full bg-[#FAF4F7] border border-[#9C27B0]/70 rounded-xl px-4 py-2.5 text-xs text-gray-800 font-medium appearance-none cursor-pointer focus:outline-none pr-8"
                                        >
                                            <option value="Select Table Place">
                                                {t("floorPlan.selectTablePlace", "Select Table Place")}
                                            </option>
                                            <option value="Indoor">{t("floorPlan.indoor", "Indoor")}</option>
                                            <option value="Outdoor">{t("floorPlan.outdoor", "Outdoor")}</option>
                                            <option value="Terrace">{t("floorPlan.terrace", "Terrace")}</option>
                                            <option value="Window">{t("floorPlan.window", "Window")}</option>
                                            <option value="Bar Side">{t("floorPlan.barSide", "Bar Side")}</option>
                                        </select>
                                        <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none text-sm" />
                                    </div>
                                </div>
                            </div>

                            {/* Centered Save Table CTA Button */}
                            <div className="pt-4 flex justify-center">
                                <button
                                    type="submit"
                                    className="px-12 py-2.5 rounded-xl bg-[linear-gradient(180deg,_#6A1B9A_0%,_#D32F2F_100%)] text-white font-medium text-sm shadow-md hover:opacity-95 transition-opacity cursor-pointer"
                                >
                                    {t("floorPlan.saveTable", "Save Table")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}