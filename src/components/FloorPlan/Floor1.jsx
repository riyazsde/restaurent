import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaRegImage, FaChair } from "react-icons/fa";
import { FiTrash2, FiEdit2, FiChevronDown } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-toastify";
import { useCreateFloor, useUpdateFloor, useFloorById } from "../../hooks/queries/useFloorPlan";

export default function Floor1() {
    const { t } = useTranslation("common");
    const navigate = useNavigate();
    const location = useLocation();

    const passedFloor = location.state?.floor || null;
    const passedFloorId = location.state?.floorId || passedFloor?.Floor_id || passedFloor?._id || null;
    const initialMode = location.state?.mode || (passedFloorId ? "edit" : "create");

    const { data: fetchedFloor } = useFloorById(passedFloorId);
    const createFloorMutation = useCreateFloor();
    const updateFloorMutation = useUpdateFloor();

    const [floorName, setFloorName] = useState(
        location.state?.floorName || passedFloor?.Floor_Name || "Floor 01"
    );
    const [floorLength, setFloorLength] = useState(
        passedFloor?.floor_length ? `${passedFloor.floor_length} S qft` : "200 S qft"
    );
    const [floorWidth, setFloorWidth] = useState(
        passedFloor?.floor_width ? `${passedFloor.floor_width} S qft` : "200 S qft"
    );
    const [floorImage, setFloorImage] = useState(passedFloor?.floor_image || "");
    const [previewImage, setPreviewImage] = useState(passedFloor?.floor_image || null);

    // Configured tables list matching Figma node 196-58278
    const [tableList, setTableList] = useState([
        {
            type: "Round Table",
            count: 12,
            capacity: 12,
            length: 200,
            width: 200,
            size: "200x200"
        }
    ]);

    // Modal state for Add Table Details
    const [isAddTableModalOpen, setIsAddTableModalOpen] = useState(false);
    const [editingTableIndex, setEditingTableIndex] = useState(null);
    const [tableType, setTableType] = useState("Round Table");
    const [tableCount, setTableCount] = useState(0);
    const [tableSize, setTableSize] = useState("300x500");

    // Sync state when fetchedFloor loads
    useEffect(() => {
        const src = fetchedFloor || passedFloor;
        if (!src) return;
        if (src.Floor_Name) setFloorName(src.Floor_Name);
        if (src.floor_width) setFloorWidth(`${src.floor_width} S qft`);
        if (src.floor_height || src.floor_length) setFloorLength(`${src.floor_height || src.floor_length} S qft`);
        if (src.floor_image) {
            setFloorImage(src.floor_image);
            setPreviewImage(src.floor_image);
        }
        if (Array.isArray(src.tables) && src.tables.length > 0) {
            setTableList(
                src.tables.map((tb) => {
                    const parts = String(tb.table_size || "200x200").split("x");
                    return {
                        type: tb.table_type || "Round Table",
                        count: Number(tb.table_count || 12),
                        capacity: Number(tb.table_count || 12),
                        length: Number(parts[0] || 200),
                        width: Number(parts[1] || 200),
                        size: tb.table_size || "200x200"
                    };
                })
            );
        }
    }, [fetchedFloor, passedFloor]);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result);
            setFloorImage(reader.result);
            toast.success(t("floorPlan.imageUploaded", "Floor image selected!"));
        };
        reader.readAsDataURL(file);
    };

    const handleOpenAddTableModal = () => {
        setEditingTableIndex(null);
        setTableType("Round Table");
        setTableCount(0);
        setTableSize("300x500");
        setIsAddTableModalOpen(true);
    };

    const handleEditTable = (index) => {
        const item = tableList[index];
        if (!item) return;
        setEditingTableIndex(index);
        setTableType(item.type || "Round Table");
        setTableCount(item.count || item.capacity || 0);
        setTableSize(item.size || `${item.length}x${item.width}`);
        setIsAddTableModalOpen(true);
    };

    const handleDeleteTable = (index) => {
        setTableList((prev) => prev.filter((_, idx) => idx !== index));
    };

    const handleSaveTableDetails = (e) => {
        e.preventDefault();
        const parts = String(tableSize).split("x");
        const parsedLength = parseInt(parts[0], 10) || 200;
        const parsedWidth = parseInt(parts[1], 10) || 200;

        const newEntry = {
            type: tableType || "Round Table",
            count: Number(tableCount) || 12,
            capacity: Number(tableCount) || 12,
            length: parsedLength,
            width: parsedWidth,
            size: tableSize || "300x500"
        };

        if (editingTableIndex !== null) {
            setTableList((prev) =>
                prev.map((item, idx) => (idx === editingTableIndex ? newEntry : item))
            );
        } else {
            setTableList((prev) => [...prev, newEntry]);
        }
        setIsAddTableModalOpen(false);
    };

    const handleGenerateLayout = async () => {
        const rawLength = String(floorLength).replace(/[^0-9]/g, "") || "200";
        const rawWidth = String(floorWidth).replace(/[^0-9]/g, "") || "200";
        const totalTableCount = tableList.reduce((acc, itm) => acc + (Number(itm.count) || 1), 0) || 12;
        const safeImage =
            floorImage && !String(floorImage).startsWith("data:")
                ? floorImage
                : "https://example.com/floor.png";

        const payload = {
            Floor_Name: floorName.trim() || "Floor 01",
            floor_width: rawWidth,
            floor_height: rawLength,
            floor_length: rawLength,
            Total_Table_Count: totalTableCount,
            "Seating-Persons_Count": totalTableCount * 4,
            Details: `${floorName.trim() || "Floor 01"} dining area`,
            floor_image: safeImage,
            tables: tableList.map((tItem) => ({
                table_type: tItem.type || "Round Table",
                table_count: Number(tItem.count) || 12,
                table_size: tItem.size || "200x200"
            })),
            Status: true
        };

        let savedFloor = null;
        try {
            if (initialMode === "edit" && passedFloorId) {
                const res = await updateFloorMutation.mutateAsync({
                    id: Number(passedFloorId) || passedFloorId,
                    Floor_id: Number(passedFloorId) || passedFloorId,
                    ...payload
                });
                savedFloor = res?.data || payload;
            } else {
                const res = await createFloorMutation.mutateAsync(payload);
                savedFloor = res?.data || payload;
            }
        } catch (err) {
            savedFloor = payload;
        }

        navigate("generate", {
            state: {
                floorData: payload,
                savedFloor,
                floorId: savedFloor?.Floor_id || passedFloorId,
                floorName: payload.Floor_Name,
                tableList,
                rawLength,
                rawWidth
            }
        });
    };

    return (
        <div className="p-8 min-h-screen bg-white font-poppins">
            {/* Breadcrumb matching media_1792071669231_1d53011f.png */}
            <div className="flex items-center gap-2 mb-2">
                <span
                    onClick={() => navigate("/dashboard/floorplan")}
                    className="text-2xl font-bold text-[#666666] cursor-pointer hover:text-[#6A1B9A] transition-colors"
                >
                    {t("floorPlan.title", "Table")}
                </span>
                <span className="text-2xl font-bold text-black">&gt;</span>
                <span
                    onClick={() => navigate("/dashboard/floorplan/edit")}
                    className="text-2xl font-bold text-black cursor-pointer hover:text-[#6A1B9A] transition-colors"
                >
                    {t("floorPlan.editFloorPlan", "Edit Floor Plan")}
                </span>
            </div>

            {/* Subtitle */}
            <h2 className="text-lg md:text-xl font-bold text-[#1E1E1E] mb-6 font-poppins">
                {t("floorPlan.seamlesslyMakeChanges", "Seamlessly make Changes in your Floor Plan")}
            </h2>

            {/* Upload Floor Image Button */}
            <div className="mb-6">
                <label className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-[linear-gradient(180deg,_#6A1B9A_0%,_#D32F2F_100%)] text-white font-medium text-sm shadow-md hover:opacity-95 transition-opacity cursor-pointer">
                    <FaRegImage className="text-base" />
                    <span>{t("floorPlan.uploadFloorImage", "Upload Floor Image")}</span>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                    />
                </label>
                {previewImage && (
                    <span className="ml-3 text-xs text-green-600 font-semibold">
                        {t("floorPlan.imageAttached", "Image attached")}
                    </span>
                )}
            </div>

            {/* Form Fields Grid matching media_1792071652759_c5617668.png */}
            <div className="max-w-3xl space-y-5">
                {/* Row 1: Length & Width */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1.5">
                            {t("floorPlan.floorLength", "Floor Length (S qft)")}
                        </label>
                        <input
                            type="text"
                            value={floorLength}
                            onChange={(e) => setFloorLength(e.target.value)}
                            placeholder="200 S qft"
                            className="w-full border border-gray-400 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1.5">
                            {t("floorPlan.floorWidth", "Floor Width (S qft)")}
                        </label>
                        <input
                            type="text"
                            value={floorWidth}
                            onChange={(e) => setFloorWidth(e.target.value)}
                            placeholder="200 S qft"
                            className="w-full border border-gray-400 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                    </div>
                </div>

                {/* Row 2: Floor Name & Add Table CTA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1.5">
                            {t("floorPlan.floor", "Floor")}
                        </label>
                        <input
                            type="text"
                            value={floorName}
                            onChange={(e) => setFloorName(e.target.value)}
                            placeholder="Floor 01"
                            className="w-full border border-gray-400 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                    </div>
                    {tableList.length === 0 && (
                        <div>
                            <button
                                type="button"
                                onClick={handleOpenAddTableModal}
                                className="px-8 py-2.5 rounded-xl bg-[linear-gradient(180deg,_#6A1B9A_0%,_#D32F2F_100%)] text-white font-medium text-sm shadow-md hover:opacity-95 transition-opacity"
                            >
                                {t("floorPlan.addTable", "Add Table")}
                            </button>
                        </div>
                    )}
                </div>

                {/* Configured Table Cards List matching media_1792071669231_1d53011f.png */}
                {tableList.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-2">
                        <div className="space-y-3">
                            {tableList.map((tbl, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white rounded-2xl border border-gray-300 p-4 shadow-xs flex flex-col justify-between"
                                >
                                    {/* Top Row: Title & Action Icons */}
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-bold text-base text-gray-900">
                                            {tbl.type}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteTable(idx)}
                                                className="w-7 h-7 rounded-full border border-red-200 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                <FiTrash2 size={13} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleEditTable(idx)}
                                                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
                                            >
                                                <FiEdit2 size={13} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bottom Row: Chair icon + Count & Dimensions */}
                                    <div className="flex items-center justify-between text-xs text-gray-800">
                                        <div className="flex items-center gap-1.5 font-bold">
                                            <FaChair className="text-gray-700 text-sm" />
                                            <span>{tbl.capacity || tbl.count || 12}</span>
                                        </div>
                                        <span className="text-gray-600 font-medium">
                                            Length : {tbl.length || 200}m &amp; Width : {tbl.width || 200}m
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add Table Button aligned beside cards */}
                        <div>
                            <button
                                type="button"
                                onClick={handleOpenAddTableModal}
                                className="px-8 py-2.5 rounded-xl bg-[linear-gradient(180deg,_#6A1B9A_0%,_#D32F2F_100%)] text-white font-medium text-sm shadow-md hover:opacity-95 transition-opacity"
                            >
                                {t("floorPlan.addTable", "Add Table")}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Generate Layout CTA Button matching media_1792071669231_1d53011f.png */}
            <div className="mt-12 max-w-2xl">
                <button
                    type="button"
                    onClick={handleGenerateLayout}
                    className="w-full py-3 px-8 rounded-xl bg-[linear-gradient(180deg,_#6A1B9A_0%,_#D32F2F_100%)] text-white font-semibold text-sm shadow-md hover:opacity-95 transition-opacity"
                >
                    {t("floorPlan.generateLayout", "Generate Layout")}
                </button>
            </div>

            {/* Add Table Details Modal matching media_1792071659242_54bc786d.png */}
            {isAddTableModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-7 shadow-2xl max-w-md w-full relative animate-fadeIn border border-purple-100">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingTableIndex !== null
                                    ? t("floorPlan.editTableDetails", "Edit Table Details")
                                    : t("floorPlan.addTableDetails", "Add Table Details")}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsAddTableModalOpen(false)}
                                className="text-gray-700 hover:text-black transition-colors"
                            >
                                <IoMdClose size={24} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSaveTableDetails} className="space-y-4">
                            {/* Row 1: Table Type & No of Table */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-900 mb-1.5">
                                        {t("floorPlan.tableType", "Table Type")}
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={tableType}
                                            onChange={(e) => setTableType(e.target.value)}
                                            className="w-full bg-[#FAF4F7] border border-[#9C27B0]/70 rounded-xl px-3 py-2.5 text-xs text-gray-800 font-medium appearance-none cursor-pointer focus:outline-none pr-8"
                                        >
                                            <option value="Round Table">Round Table</option>
                                            <option value="Square Table">Square Table</option>
                                            <option value="Rectangle Table">Rectangle Table</option>
                                            <option value="Booth Table">Booth Table</option>
                                        </select>
                                        <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none text-sm" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-900 mb-1.5">
                                        {t("floorPlan.noOfTable", "No of Table")}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={tableCount}
                                        onChange={(e) => setTableCount(e.target.value)}
                                        className="w-full bg-[#FAF4F7] border border-[#9C27B0]/70 rounded-xl px-3 py-2 text-xs text-gray-800 font-medium focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Row 2: Size (Length x Width) */}
                            <div className="w-1/2 pr-2">
                                <label className="block text-xs font-semibold text-gray-900 mb-1.5">
                                    {t("floorPlan.sizeLengthWidth", "Size(Length x Width)")}
                                </label>
                                <input
                                    type="text"
                                    value={tableSize}
                                    onChange={(e) => setTableSize(e.target.value)}
                                    placeholder="300x500"
                                    className="w-full bg-[#FAF4F7] border border-[#9C27B0]/70 rounded-xl px-3 py-2.5 text-xs text-gray-800 font-medium focus:outline-none"
                                />
                            </div>

                            {/* Centered Save Table CTA */}
                            <div className="pt-4 flex justify-center">
                                <button
                                    type="submit"
                                    className="px-10 py-2.5 rounded-xl bg-[linear-gradient(180deg,_#6A1B9A_0%,_#D32F2F_100%)] text-white font-medium text-sm shadow-md hover:opacity-95 transition-opacity"
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