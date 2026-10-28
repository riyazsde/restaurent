import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaArrowRight } from "react-icons/fa";
import { useFloors } from "../../hooks/queries/useFloorPlan";

export default function EditTables() {
    const { t } = useTranslation("common");
    const [showFloorOptions, setShowFloorOptions] = useState(false);
    const navigate = useNavigate();

    const { data: floors = [] } = useFloors();

    const defaultFloorMeta = [
        { name: "Floor 01", details: "Ground Floor" },
        { name: "Floor 02", details: "First Floor" },
        { name: "Roof Top", details: "Rooftop Dining Area" }
    ];

    const displayFloors = defaultFloorMeta.map((meta, idx) => {
        const matched =
            floors.find(
                (f) => (f.Floor_Name || "").trim().toLowerCase() === meta.name.toLowerCase()
            ) || floors[idx];
        return {
            ...(matched || {}),
            Floor_id: matched?.Floor_id || matched?._id || null,
            Floor_Name: meta.name,
            Details: matched?.Details || meta.details
        };
    });

    const handleSelectExistingFloor = (floor) => {
        navigate("floor1", {
            state: {
                floor,
                floorId: floor.Floor_id || floor._id || null,
                floorName: floor.Floor_Name || "Floor 01",
                mode: "edit"
            }
        });
    };

    const handleCreateNewFloor = () => {
        navigate("floor1", {
            state: {
                floor: null,
                floorId: null,
                floorName: "Floor 01",
                mode: "create"
            }
        });
    };

    return (
        <div className="p-8 min-h-screen bg-white font-poppins">
            {/* Top Bar / Breadcrumb matching Figma node 196-58278 */}
            <div className="flex items-center gap-2 mb-3">
                <span
                    onClick={() => navigate("/dashboard/floorplan")}
                    className="text-2xl font-bold text-[#666666] cursor-pointer hover:text-[#6A1B9A] transition-colors"
                >
                    {t("floorPlan.title", "Table")}
                </span>
                <span className="text-2xl font-bold text-black">&gt;</span>
                <span className="text-2xl font-bold text-black">
                    {t("floorPlan.editFloorPlan", "Edit Floor Plan")}
                </span>
            </div>

            {/* Subheading */}
            <h2 className="text-lg md:text-xl font-bold text-[#1E1E1E] mb-8 font-poppins">
                {t("floorPlan.seamlesslyMakeChanges", "Seamlessly make Changes in your Floor Plan")}
            </h2>

            {/* Two Main Cards matching Figma node 196-58278 & uploaded screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl items-start">
                {/* Card 1: Edit Existing Floor Plan */}
                <div className="flex flex-col">
                    <div
                        onClick={() => setShowFloorOptions((prev) => !prev)}
                        className="rounded-2xl overflow-hidden shadow-md cursor-pointer transition-all hover:shadow-lg border border-purple-100"
                    >
                        {/* Top Gradient Banner */}
                        <div className="bg-[linear-gradient(180deg,#6A1B9A_0%,#D32F2F_100%)] px-6 py-5 flex items-center justify-between text-white">
                            <span className="font-bold text-base md:text-lg">
                                {t("floorPlan.editExistingFloorPlan", "Edit Existing Floor Plan")}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs">
                                <FaArrowRight />
                            </div>
                        </div>

                        {/* Bottom Light Pink Strip */}
                        <div className="bg-[#FAF2F6] px-6 py-3.5 text-center text-xs md:text-sm font-medium text-gray-800">
                            {t("floorPlan.seamlesslyEditYourFloorPlan", "Seamlessly Edit Your Floor Plan")}
                        </div>
                    </div>

                    {/* Expandable Floor List matching media_1792071591149_cb969bf8.png */}
                    {showFloorOptions && (
                        <div className="mt-3 space-y-2 animate-fadeIn">
                            {displayFloors.map((floor, idx) => (
                                <button
                                    key={floor.Floor_Name || idx}
                                    onClick={() => handleSelectExistingFloor(floor)}
                                    className="w-full py-3 px-4 text-center rounded-xl bg-[#FAF2F6] hover:bg-[#F3E5EE] active:bg-[#EDD7E6] text-gray-900 font-semibold text-sm transition-all shadow-xs border border-pink-100/60"
                                >
                                    {floor.Floor_Name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Card 2: Create Floor Plan */}
                <div
                    onClick={handleCreateNewFloor}
                    className="rounded-2xl overflow-hidden shadow-md cursor-pointer transition-all hover:shadow-lg border border-purple-100"
                >
                    {/* Top Gradient Banner */}
                    <div className="bg-[linear-gradient(180deg,#6A1B9A_0%,#D32F2F_100%)] px-6 py-5 flex items-center justify-between text-white">
                        <span className="font-bold text-base md:text-lg">
                            {t("floorPlan.createFloorPlanTitle", "Create Floor Plan")}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs">
                            <FaArrowRight />
                        </div>
                    </div>

                    {/* Bottom Light Pink Strip */}
                    <div className="bg-[#FAF2F6] px-6 py-3.5 text-center text-xs md:text-sm font-medium text-gray-800">
                        {t(
                            "floorPlan.buildYourFloorPlanFromScratch",
                            "Build Your Floor Plan From Scratch"
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}