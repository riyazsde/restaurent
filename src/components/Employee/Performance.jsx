import { useState } from 'react'
import { useNavigate, Link, useLocation, useParams } from 'react-router-dom'
import { Trash2 } from 'lucide-react';
import { FiEdit, FiChevronRight } from 'react-icons/fi';
import profile from '../assets/profile.png'
import pic from '../assets/pic.png'
import save from '../assets/save.svg'
import group from '../assets/group.svg'
import { FaStar } from "react-icons/fa";
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useEmployeeDetails, useEmployeePerformance } from '../../hooks/queries/useEmployee';
import { useRestaurant } from '../../hooks/queries/usePos';
import { resolveCurrencySymbol } from '../../utils/currencyUtils';

const Performance = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id: employeeId } = useParams();
    const { employee } = location.state || {};
    const { t } = useTranslation('employee');

    const { data: restaurantData } = useRestaurant();
    const currency = resolveCurrencySymbol(restaurantData?.currency) || '';

    const [activeTab, setActiveTab] = useState("Details");
    const userId = employeeId || employee?.user_id;

    // TanStack Query for employee details
    const { data: employeeData = null, isLoading: isLoadingDetails } = useEmployeeDetails(userId);

    // TanStack Query for employee performance
    const { data: performanceData = null, isLoading: isLoadingPerformance } = useEmployeePerformance(userId, {
        enabled: Boolean(userId && activeTab === "Performance")
    });

    const InfoBox = ({ label, value, editable = false }) => (
        <div>
            <p className="text-black font-semibold text-[14px] mb-2">{label}</p>
            <div style={{
                background: 'linear-gradient(180deg, rgba(106, 27, 154, 0.1) 0%, rgba(211, 47, 47, 0.1) 100%)'
            }} className="flex items-center justify-between rounded-lg px-4 py-3">
                <span className="text-gray-800 text-[14px] truncate">{value}</span>
                {editable && (
                    <FiEdit size={16} className="text-black cursor-pointer ml-3 flex-shrink-0" />
                )}
            </div>
        </div>
    );

    const GradientBox = ({ label, value }) => (
        <div style={{
            background: 'linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)'
        }} className="text-white px-3 sm:px-4 py-2 rounded-md text-center min-w-[80px] sm:min-w-[100px]">
            <p className="font-semibold text-sm sm:text-base">{value}</p>
            <p className="text-xs">{label}</p>
        </div>
    );

    return (
        <>
            <div style={{ fontFamily: 'Poppins' }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 pb-2">
                <div className="flex items-center gap-3 text-gray-500 text-[24px] sm:text-[32px] font-semibold">
                    <Link to="/dashboard/employee" className="hover:text-gray-700 transition-colors">
                        {t('performance.title')}
                    </Link>
                    <FiChevronRight size={32} className="text-black mt-1" />
                    <span className="text-black font-bold">{employee?.Role_id?.role_name || employee?.role || t('list.title')}</span>
                </div>
            </div>
            <div style={{ fontFamily: 'Poppins' }} className="max-w-7xl mx-auto p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mb-6">
                    <div className="flex gap-6 text-[16px] font-bold">
                        <button
                            onClick={() => setActiveTab("Details")}
                            className={`relative pb-3 ${activeTab === "Details"
                                ? "text-[#C21D00] after:absolute after:left-0 after:bottom-0 after:h-[3px] after:w-full after:bg-[#C21D00] after:rounded-full"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {t('performance.tabs.details')}
                        </button>
                        <button
                            onClick={() => setActiveTab("Performance")}
                            className={`relative pb-3 ${activeTab === "Performance"
                                ? "text-[#C21D00] after:absolute after:left-0 after:bottom-0 after:h-[3px] after:w-full after:bg-[#C21D00] after:rounded-full"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {t('performance.tabs.performance')}
                        </button>
                    </div>
                    <div className="flex-1 h-[1px] bg-gray-200 mb-3" />
                    <button className="flex items-center gap-2 text-white bg-[#C21D00] px-4 py-2.5 rounded-md font-medium text-[14px] hover:bg-red-700 transition mb-[2px]">
                        {t('performance.delete')}
                        <Trash2 size={16} />
                    </button>
                </div>

                <div className="mt-4 text-sm text-gray-700">
                    {activeTab === "Details" && (
                        isLoadingDetails ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                                <span className="ml-3 text-lg text-gray-600">{t('performance.loadingDetails')}</span>
                            </div>
                        ) : (
                            <div className="space-y-6 sm:space-y-8">
                                <div>
                                    <h2 className="font-semibold text-[18px] sm:text-[20px] text-gray-500 mb-6">{t('performance.employeeDetails')}</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 items-start">
                                        <div className="col-span-1">
                                            <img
                                                src={employeeData?.user_image || employee?.profile_image || pic}
                                                alt="Employee"
                                                className="rounded-[20px] w-full max-w-[290px] h-[200px] object-cover"
                                                onError={(e) => { e.target.src = pic; }}
                                            />
                                        </div>
                                        <div className="col-span-1 sm:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
                                            <InfoBox label={t('performance.labels.name')} value={employeeData?.full_name || `${employeeData?.first_name || ''} ${employeeData?.last_name || ''}`.trim() || employeeData?.name || employee?.first_name || 'N/A'} />
                                            <InfoBox label={t('performance.labels.email')} value={employeeData?.email || employee?.email || 'N/A'} editable />
                                            <InfoBox label={t('performance.labels.phone')} value={employeeData?.phone || employee?.phone || 'N/A'} editable />
                                            <InfoBox label={t('performance.labels.employeeId')} value={employeeData?.employee_id_code || employeeData?.employee_login_code || employeeData?.employee_id || employee?.employee_id_code || 'N/A'} />
                                            <InfoBox label={t('performance.labels.role')} value={employeeData?.role?.role_name || employeeData?.role || employee?.role || 'N/A'} editable />
                                            <InfoBox label={t('performance.labels.responsibility')} value={employeeData?.responsibility?.Responsibility_name || employeeData?.responsibility || employee?.responsibility || 'N/A'} editable />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h2 className="font-semibold text-[18px] sm:text-[20px] text-gray-500 mb-6 mt-8">{t('performance.workDetails')}</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-full sm:max-w-[75%]">
                                        <InfoBox label={t('performance.labels.onboardingDate')} value={employeeData?.onboarding_date ? new Date(employeeData.onboarding_date).toLocaleDateString() : (employee?.onboarding_date ? new Date(employee.onboarding_date).toLocaleDateString() : 'N/A')} />
                                        <InfoBox label={t('performance.labels.experience')} value={employeeData?.experience?.display || (employeeData?.experience_years ? `${employeeData.experience_years} Year's` : (employee?.experience_years ? `${employee.experience_years} Year's` : 'N/A'))} />
                                        <div className="hidden sm:block"></div>
                                        <InfoBox label={t('performance.labels.shiftTimings', 'Shift Timings')} value={employeeData?.shift_timings || employee?.shift_timings || 'N/A'} />
                                        <InfoBox label={t('performance.labels.totalLeave', 'Total Leave')} value={employeeData?.total_leave_days || employee?.total_leave_days ? `${employeeData?.total_leave_days || employee?.total_leave_days} Day's` : 'N/A'} />
                                        <InfoBox label={t('performance.labels.leaveLeft', 'Leave Left')} value={employeeData?.leave_left_days || employee?.leave_left_days ? `${employeeData?.leave_left_days || employee?.leave_left_days} Day's` : 'N/A'} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    {activeTab === "Performance" && (
                        isLoadingPerformance ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                                <span className="ml-3 text-lg text-gray-600">{t('performance.loadingPerformance')}</span>
                            </div>
                        ) : performanceData ? (
                            <div className="p-3 sm:p-6 font-[Poppins] text-xs sm:text-sm">
                                {/* Employee Quick Stats */}
                                <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6">
                                    <div style={{
                                        background: 'linear-gradient(180deg, rgba(106, 27, 154, 0.1) 0%, rgba(211, 47, 47, 0.1) 100%)'
                                    }} className="flex items-center gap-2 bg-white text-black px-3 py-3 rounded-md">
                                        <img
                                            src={performanceData.employeeDetails?.image || profile}
                                            alt="Employee"
                                            className="w-10 h-10 rounded-full object-cover"
                                            onError={(e) => { e.target.src = profile; }}
                                        />
                                        <div>
                                            <p className="font-medium leading-tight">{performanceData.employeeDetails?.Name || 'N/A'}</p>
                                            <p className="text-xs">{performanceData.employeeDetails?.role || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <GradientBox label={t('performance.stats.clockIn')} value={performanceData.employeeDetails?.clockin || 'N/A'} />
                                    <GradientBox label={t('performance.stats.hrsWorked')} value={performanceData.employeeDetails?.WorkedToday || 0} />
                                    <GradientBox label={t('performance.stats.minsBreak')} value={performanceData.employeeDetails?.MinsBreak || 0} />
                                    <GradientBox label={t('performance.stats.leavesLeft')} value={performanceData.employeeDetails?.LeavesLeft || 0} />
                                </div>

                                {/* Charts Section */}
                                <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                                    {/* Avg Working Hours Chart */}
                                    <div>
                                        <h2 className="text-lg sm:text-[24px] text-black font-semibold mb-2">{t('performance.charts.avgWorkingHrs')}</h2>
                                        <div className="bg-white mt-3 sm:mt-4 rounded-2xl shadow-xl p-3 sm:p-4">
                                            <div className="flex justify-end mb-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                                                <div className="flex items-center gap-1">
                                                    <span className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-blue-600"></span>
                                                    {t('performance.charts.serving')}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-teal-400"></span>
                                                    {t('performance.charts.helping')}
                                                </div>
                                            </div>
                                            <div className="w-full h-40 sm:h-64 flex items-center justify-center">
                                                <img src={group} alt="Bar Chart" className="w-full h-auto object-contain" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total Tips Earned */}
                                    <div>
                                        <h2 className="text-lg sm:text-[24px] text-black font-semibold mb-2">{t('performance.charts.totalTips')}</h2>
                                        <div className="bg-white mt-3 sm:mt-4 rounded-2xl shadow-xl p-3 sm:p-4">
                                            <div className="text-center py-6">
                                                <div className="text-5xl sm:text-6xl font-bold bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] bg-clip-text text-transparent mb-2">
                                                    {performanceData.totalTipsEarned?.totalTips || 0}
                                                </div>
                                                <p className="text-lg sm:text-xl font-semibold text-gray-700">
                                                    {performanceData.totalTipsEarned?.currency || currency}
                                                </p>
                                            </div>

                                            <div className="text-center mt-4 space-y-1">
                                                <p className="text-xs sm:text-sm text-gray-600">
                                                    {t('performance.charts.earnedTip')} {performanceData.totalTipsEarned?.period || '30 days'}
                                                </p>
                                                {performanceData.totalTipsEarned?.avgTipMin !== undefined && performanceData.totalTipsEarned?.avgTipMax !== undefined && (
                                                    <p className="text-xs text-gray-500">
                                                        Avg: {performanceData.totalTipsEarned.avgTipMin} - {performanceData.totalTipsEarned.avgTipMax} {performanceData.totalTipsEarned?.currency || currency}
                                                    </p>
                                                )}
                                                {performanceData.totalTipsEarned?.percentage !== undefined && (
                                                    <p className="text-xs text-gray-500">
                                                        {performanceData.totalTipsEarned.percentage}% {t('performance.charts.ofEarnings')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Feedback Section */}
                                <div>
                                    <h2 style={{ fontFamily: 'Manrope' }} className="text-[20px] sm:text-[29px] font-semibold mt-6 sm:mt-8 mb-4">{t('performance.feedback.title')}</h2>
                                    <div style={{ fontFamily: 'Poppins' }} className="grid grid-cols-1 gap-4 sm:grid-cols-[250px_1fr] sm:gap-6">
                                        {/* Overall Feedback */}
                                        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-xl">
                                            <div className="flex justify-between font-medium mb-2 text-xs sm:text-sm">
                                                <span>{t('performance.feedback.overall')}</span>
                                                <span>{t('performance.feedback.peoples')}</span>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <span>😍</span>
                                                        <span>{t('performance.feedback.lovedIt')}</span>
                                                    </div>
                                                    <span className="font-semibold">{performanceData.overallFeedback?.lovedIt || 0}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <span>😊</span>
                                                        <span>{t('performance.feedback.good')}</span>
                                                    </div>
                                                    <span className="font-semibold">{performanceData.overallFeedback?.good || 0}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <span>😐</span>
                                                        <span>{t('performance.feedback.average')}</span>
                                                    </div>
                                                    <span className="font-semibold">{performanceData.overallFeedback?.average || 0}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <span>😕</span>
                                                        <span>{t('performance.feedback.bad')}</span>
                                                    </div>
                                                    <span className="font-semibold">{performanceData.overallFeedback?.bad || 0}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <span>😡</span>
                                                        <span>{t('performance.feedback.worst')}</span>
                                                    </div>
                                                    <span className="font-semibold">{performanceData.overallFeedback?.worst || 0}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Category Feedback */}
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <div className="bg-white rounded-xl h-[100px] sm:h-[112px] p-3 sm:p-4 shadow-xl">
                                                <p className="text-xs sm:text-sm font-medium mb-1">{t('performance.feedback.staffBehavior')}</p>
                                                <div className="flex items-center gap-2 text-sm sm:text-lg font-semibold">
                                                    <span>😍</span>
                                                    <span>{performanceData.staffBehavior || 'N/A'}</span>
                                                </div>
                                            </div>
                                            <div className="bg-white rounded-xl h-[100px] sm:h-[112px] p-3 sm:p-4 shadow-xl">
                                                <p className="text-xs sm:text-sm font-medium mb-1">{t('performance.feedback.waitingTime')}</p>
                                                <div className="flex items-center gap-2 text-sm sm:text-lg font-semibold">
                                                    <span>😍</span>
                                                    <span>{performanceData.waitingTime || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Feedback Table */}
                                    <div className="mt-6">
                                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                                            <table className="min-w-full text-xs sm:text-sm font-[Poppins] text-left">
                                                <thead style={{
                                                    background: 'linear-gradient(180deg, rgba(106, 27, 154, 0.1) 0%, rgba(211, 47, 47, 0.1) 100%)'
                                                }} className="text-[#333]">
                                                    <tr>
                                                        <th className="py-2 px-2 sm:px-4">{t('performance.feedback.table.hash')}</th>
                                                        <th className="py-2 px-2 sm:px-4">{t('performance.feedback.table.feedback')}</th>
                                                        <th className="py-2 px-2 sm:px-4 hidden sm:table-cell">{t('performance.feedback.table.orderId')}</th>
                                                        <th className="py-2 px-2 sm:px-4 hidden sm:table-cell">{t('performance.feedback.table.date')}</th>
                                                        <th className="py-2 px-2 sm:px-4 hidden sm:table-cell">{t('performance.feedback.table.amount')}</th>
                                                        <th className="py-2 px-2 sm:px-4">{t('performance.feedback.table.ratings')}</th>
                                                        <th className="py-2 px-2 sm:px-4 hidden sm:table-cell">{t('performance.feedback.table.recommend')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white">
                                                    {performanceData.feedbacks && performanceData.feedbacks.length > 0 ? (
                                                        performanceData.feedbacks.map((feedback, idx) => (
                                                            <tr key={idx} className="border-t border-gray-100">
                                                                <td className="py-2 px-2 sm:px-4">{String(idx + 1).padStart(2, '0')}</td>
                                                                <td className="py-2 px-2 sm:px-4">{feedback.comment}</td>
                                                                <td className="py-2 px-2 sm:px-4 hidden sm:table-cell">#{feedback.orderId}</td>
                                                                <td className="py-2 px-2 sm:px-4 hidden sm:table-cell">{feedback.date}</td>
                                                                <td className="py-2 px-2 sm:px-4 hidden sm:table-cell">{feedback.amount} {feedback.currency}</td>
                                                                <td className="py-2 px-2 sm:px-4 flex items-center gap-1 text-yellow-500">
                                                                    <FaStar /> {feedback.rating}
                                                                </td>
                                                                <td className="py-2 px-2 sm:px-4 text-green-600 font-medium hidden sm:table-cell">
                                                                    {feedback.willRecommend ? 'Yes' : 'No'}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="7" className="py-8 text-center text-gray-500">
                                                                {t('performance.feedback.noFeedback')}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <p>{t('performance.noData')}</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </>
    )
}

export default Performance