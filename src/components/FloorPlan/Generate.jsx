import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaChair, FaArrowRight, FaArrowDown } from "react-icons/fa";

export default function Generate() {
    const { t } = useTranslation("common");
    const navigate = useNavigate();
    const location = useLocation();

    const floorName = location.state?.floorName || "Floor 01";
    const rawLength = location.state?.rawLength || "200";
    const rawWidth = location.state?.rawWidth || "200";
    const tableList = location.state?.tableList || [];

    // Calculate row and column distribution based on floor dimensions or configured tables
    const totalTables = tableList.reduce((acc, itm) => acc + (itm.count || 1), 0) || 12;
    const tablesInRow = Math.max(1, Math.min(totalTables, Math.round(Number(rawLength) / 60) || 3));
    const tablesInColumn = Math.max(1, Math.ceil(totalTables / tablesInRow) || 12);

    const handleStartCreation = () => {
        navigate("createplan", {
            state: {
                ...location.state,
                tablesInRow,
                tablesInColumn
            }
        });
    };

    return (
        <div className="p-8 min-h-screen bg-white font-poppins">
            {/* Breadcrumb matching media_1792071689419_23a1aa07.png */}
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

            {/* Subheading */}
            <h2 className="text-lg md:text-xl font-bold text-[#1E1E1E] mb-8 font-poppins">
                {t("floorPlan.accordingToGivenData", "According to given Data")}
            </h2>

            {/* Visual Grid Card matching media_1792071689419_23a1aa07.png */}
            <div className="max-w-lg mb-12">
                <div className="bg-[linear-gradient(180deg,_#6A1B9A_0%,_#D32F2F_100%)] text-white rounded-2xl p-7 shadow-lg relative min-h-[170px] flex flex-col justify-between border border-purple-200">
                    <div className="flex items-start gap-4">
                        {/* Chair Icon in White Circle */}
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-purple-900 shadow-md shrink-0">
                            <FaChair className="text-xl text-[#6A1B9A]" />
                        </div>

                        {/* Arrow Right: Tables in Row */}
                        <div className="flex items-center gap-2 mt-3">
                            <FaArrowRight className="text-white text-sm" />
                            <span className="font-bold text-sm tracking-wide">
                                {t("floorPlan.tableInRow", "{{count}} Table in Row", {
                                    count: String(tablesInRow).padStart(2, "0")
                                })}
                            </span>
                        </div>
                    </div>

                    {/* Arrow Down: Tables in Column & Start Creation CTA */}
                    <div className="flex items-end justify-between mt-6">
                        <div className="flex flex-col items-center ml-4">
                            <FaArrowDown className="text-white text-sm mb-1" />
                            <span className="font-bold text-sm tracking-wide">
                                {t("floorPlan.tableInColumn", "{{count}} Table in Column", {
                                    count: String(tablesInColumn).padStart(2, "0")
                                })}
                            </span>
                        </div>

                        {/* Start Creation Pill Button */}
                        <button
                            type="button"
                            onClick={handleStartCreation}
                            className="bg-white/25 hover:bg-white/35 active:bg-white/40 text-white font-semibold text-xs px-4 py-2 rounded-full flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        >
                            <span>{t("floorPlan.startCreation", "Start Creation")}</span>
                            <FaArrowRight className="text-[10px]" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Generate Layout Button matching media_1792071689419_23a1aa07.png */}
            <div className="max-w-2xl">
                <button
                    type="button"
                    onClick={handleStartCreation}
                    className="w-full py-3 px-8 rounded-xl bg-[linear-gradient(180deg,_#6A1B9A_0%,_#D32F2F_100%)] text-white font-semibold text-sm shadow-md hover:opacity-95 transition-opacity"
                >
                    {t("floorPlan.generateLayout", "Generate Layout")}
                </button>
            </div>
        </div>
    );
}