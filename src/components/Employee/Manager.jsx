import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Plus } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useEmployeesByRole } from '../../hooks/queries/useEmployee';
import emp1 from '../assets/emp1.jpg';

const Manager = () => {
    const { t } = useTranslation('employee');
    const navigate = useNavigate();
    const location = useLocation();
    const { roleName = 'Managers', apiRole: passedApiRole } = location.state || {};

    const apiRole = passedApiRole || (
        roleName.endsWith('s') && roleName.toLowerCase() !== 'waitress'
            ? roleName.slice(0, -1)
            : roleName
    );

    const { data: employees = [], isLoading } = useEmployeesByRole(apiRole);

    const formatShiftTime = (shift) => {
        if (!shift) return '9:00 - 20:00';
        return shift;
    };

    const formatPerformance = (performance) => {
        if (performance === null || performance === undefined || performance === 0) return '95%';
        return typeof performance === 'number' ? `${performance}%` : performance;
    };

    // Skeleton Loader Component for Table
    const TableSkeleton = () => (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left border-collapse">
                <thead>
                    <tr className="bg-[#FAF2F4] text-gray-700 font-semibold text-[14px]">
                        <th className="px-6 py-5">{t('list.table.name', 'Emp Name')}</th>
                        <th className="px-6 py-5">{t('list.table.id', 'Emp id')}</th>
                        <th className="px-6 py-5">{t('list.table.position', 'Position')}</th>
                        <th className="px-6 py-5">{t('list.table.shift', 'Shift timings')}</th>
                        <th className="px-6 py-5">{t('list.table.performance', 'Over all Performance %')}</th>
                        <th className="px-6 py-5">{t('list.table.view', 'View employee')}</th>
                    </tr>
                </thead>
                <tbody>
                    {[1, 2, 3, 4, 5].map((item) => (
                        <tr key={item} className="border-b border-gray-100 last:border-0">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                                </div>
                            </td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 font-[Poppins]">
            {/* Header: Breadcrumbs and Create Employee Button */}
            <div className="flex items-center justify-between mb-8">
                <div className="text-gray-500 text-2xl sm:text-[32px] font-semibold flex items-center gap-2">
                    <Link to="/dashboard/employee" className="hover:text-purple-700 transition-colors">
                        {t('list.title', 'Employee')}
                    </Link>
                    <span className="text-black font-bold text-lg sm:text-2xl mt-0.5">&gt;</span>
                    <span className="text-black font-bold capitalize">{roleName}</span>
                </div>

                <button
                    onClick={() => navigate('/dashboard/employee/create')}
                    style={{ background: 'linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)' }}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm sm:text-[16px] text-white rounded-md font-medium hover:opacity-95 transition-opacity whitespace-nowrap shadow-sm"
                >
                    {t('createEmployee', 'Create Employee')} <Plus size={18} />
                </button>
            </div>

            {/* Table Container */}
            <div className="bg-white border border-gray-200 rounded-[18px] overflow-hidden shadow-sm">
                {isLoading ? (
                    <TableSkeleton />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] text-left border-collapse">
                            <thead>
                                <tr className="bg-[#FAF2F4] text-gray-700 font-semibold text-[14px] border-b border-gray-200">
                                    <th className="px-6 py-4 whitespace-nowrap">{t('list.table.name', 'Emp Name')}</th>
                                    <th className="px-6 py-4 whitespace-nowrap">{t('list.table.id', 'Emp id')}</th>
                                    <th className="px-6 py-4 whitespace-nowrap">{t('list.table.position', 'Position')}</th>
                                    <th className="px-6 py-4 whitespace-nowrap">{t('list.table.shift', 'Shift timings')}</th>
                                    <th className="px-6 py-4 whitespace-nowrap">{t('list.table.performance', 'Over all Performance %')}</th>
                                    <th className="px-6 py-4 whitespace-nowrap">{t('list.table.view', 'View employee')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-20 text-gray-500 font-medium">
                                            {t('list.noEmployees', 'No employees found for this role')}
                                        </td>
                                    </tr>
                                ) : (
                                    employees.map((emp, idx) => {
                                        const empId = emp.employee_id || emp.user_id || emp.id || emp.Employee_id;
                                        const empCode = emp.employee_id_code || emp.employee_login_code || emp.Employee_id || String(idx + 1).padStart(3, '0');
                                        const empName = emp.full_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.Name || 'Jackline Fernandes';
                                        const empRole = emp.role || emp.Role_id?.role_name || apiRole;
                                        const empShift = formatShiftTime(emp.shift_timings || (emp.shiftTime?.average_in_time && `${emp.shiftTime.average_in_time} - ${emp.shiftTime.average_out_time}`));
                                        const empPerf = formatPerformance(emp.overall_performance || emp.OverAllPerformance || emp.performance);
                                        const empImage = emp.profile_image || emp.user_image || emp1;

                                        return (
                                            <tr key={empId || idx} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors last:border-0">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3.5">
                                                        <img
                                                            src={empImage}
                                                            alt={empName}
                                                            onError={(e) => { e.target.src = emp1; }}
                                                            className="w-10 h-10 rounded-full object-cover shadow-xs border border-gray-100"
                                                        />
                                                        <span className="font-medium text-gray-900 text-[15px]">
                                                            {empName}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700 text-[15px] font-normal">
                                                    {empCode}
                                                </td>
                                                <td className="px-6 py-4 text-gray-700 text-[15px] capitalize font-normal">
                                                    {empRole}
                                                </td>
                                                <td className="px-6 py-4 text-gray-700 text-[15px] font-normal">
                                                    {empShift}
                                                </td>
                                                <td className="px-6 py-4 text-[#D32F2F] font-bold text-[15px]">
                                                    {empPerf}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => navigate(`/dashboard/employee/${empId}`, { state: { employee: emp } })}
                                                        className="group inline-flex items-center gap-1 font-semibold text-gray-800 text-[15px] hover:text-[#6A1B9A] transition-colors"
                                                    >
                                                        {t('list.viewMore', 'View more')}
                                                        <span className="font-bold text-sm ml-1 group-hover:translate-x-0.5 transition-transform leading-none">&gt;</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Manager;