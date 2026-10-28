import React, { useState } from 'react';
import { Power, Calendar, Phone, Mail, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import attendanceService from '../../services/attendanceService';
import useTranslatedToast from '../../hooks/useTranslatedToast';

const EmployeeAttendance = () => {
    const [activeTab, setActiveTab] = useState('Attendance History');
    const [emergencyToggle, setEmergencyToggle] = useState(true);
    const queryClient = useQueryClient();
    const toast = useTranslatedToast();

    // Fetch Dashboard
    const { data: dashboardResp, isLoading: dashboardLoading } = useQuery({
        queryKey: ['attendanceDashboard'],
        queryFn: () => attendanceService.getDashboard()
    });

    // Fetch History
    const { data: historyResp, isLoading: historyLoading } = useQuery({
        queryKey: ['attendanceHistory'],
        queryFn: () => attendanceService.getHistory(),
        enabled: activeTab === 'Attendance History'
    });

    // Fetch Leave Status
    const { data: leaveResp, isLoading: leaveLoading } = useQuery({
        queryKey: ['leaveStatus'],
        queryFn: () => attendanceService.getLeaveStatus(),
        enabled: activeTab === 'Leave status'
    });

    // Clock In Mutation
    const clockInMutation = useMutation({
        mutationFn: () => attendanceService.clockIn(),
        onSuccess: (res) => {
            if (res.success) toast.success('Clocked in successfully');
            else toast.error(res.message || 'Failed to clock in');
            queryClient.invalidateQueries(['attendanceDashboard']);
            queryClient.invalidateQueries(['attendanceHistory']);
        },
        onError: (err) => toast.error(err.message || 'Error clocking in')
    });

    // Clock Out Mutation
    const clockOutMutation = useMutation({
        mutationFn: () => attendanceService.clockOut(),
        onSuccess: (res) => {
            if (res.success) toast.success('Clocked out successfully');
            else toast.error(res.message || 'Failed to clock out');
            queryClient.invalidateQueries(['attendanceDashboard']);
            queryClient.invalidateQueries(['attendanceHistory']);
        },
        onError: (err) => toast.error(err.message || 'Error clocking out')
    });

    const dashboardData = dashboardResp?.data || {};
    const attendanceData = historyResp?.data || [];
    const leaveData = leaveResp?.data || [];

    return (
        <div className="h-full flex flex-col font-sans px-8 py-6 max-h-screen overflow-hidden">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <h1 className="text-3xl font-bold text-gray-900">Employee Attendance & Leave</h1>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-6 pr-2 flex flex-col xl:flex-row gap-6">
                
                {/* Left Column (Main) */}
                <div className="flex-[2] flex flex-col gap-6">
                    
                    {/* Top Status Card */}
                    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
                        <div className="flex justify-between items-start border-b border-gray-100 pb-5 mb-5">
                            <div className="flex items-center space-x-4">
                                <img src="https://i.pravatar.cc/150?img=47" alt="Profile" className="w-14 h-14 rounded-full border-2 border-pink-100 object-cover" />
                                <div>
                                    <h3 className="text-[16px] font-bold text-gray-900">
                                        {dashboardLoading ? 'Loading...' : dashboardData?.user?.name || 'Employee Name'}
                                    </h3>
                                    <p className="text-[13px] text-gray-500 font-medium">
                                        {dashboardData?.user?.role || 'Staff'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center justify-end space-x-2 mb-1">
                                    <span className="text-[13px] font-bold text-gray-900">Current Shift</span>
                                    <span className="bg-[#dcfce7] text-[#16a34a] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div> On Shift
                                    </span>
                                </div>
                                <p className="text-[12px] text-gray-500 font-medium">
                                    {dashboardData?.currentShift?.time || 'No active shift'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            <div className="border border-pink-200 rounded-xl py-3 flex flex-col items-center justify-center">
                                <span className="text-[15px] font-bold text-gray-900">
                                    {dashboardData?.clockInTime || '--:--'}
                                </span>
                                <span className="text-[12px] font-medium text-gray-500">Clock in</span>
                            </div>
                            <div className="border border-pink-200 rounded-xl py-3 flex flex-col items-center justify-center">
                                <span className="text-[15px] font-bold text-gray-900">
                                    {dashboardData?.workedToday || '0hr 0min'}
                                </span>
                                <span className="text-[12px] font-medium text-gray-500">Worked today</span>
                            </div>
                            <div className="border border-[#86efac] bg-[#dcfce7] rounded-xl py-3 flex flex-col items-center justify-center cursor-pointer hover:bg-[#bbf7d0] transition-colors">
                                <span className="text-[15px] font-bold text-[#16a34a]">Start</span>
                                <span className="text-[12px] font-medium text-[#16a34a]">Break</span>
                            </div>
                            <div className="border border-pink-200 rounded-xl py-3 flex flex-col items-center justify-center">
                                <span className="text-[15px] font-bold text-gray-900">
                                    {dashboardData?.leavesLeft || '0'}
                                </span>
                                <span className="text-[12px] font-medium text-gray-500">Leaves Left</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs and Action */}
                    <div className="flex items-center space-x-4">
                        <div className="flex bg-[#f6f6f6] rounded-full p-1 shadow-inner items-center space-x-1">
                            {['Attendance History', 'Leave status'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-2 text-[14px] font-bold rounded-full transition-all ${
                                        activeTab === tab
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <button className="bg-[#22c55e] text-white px-6 py-2.5 rounded-full text-[14px] font-bold shadow-sm hover:bg-[#16a34a] transition-colors">
                            Apply Leave
                        </button>
                    </div>

                    {/* Table Area */}
                    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden min-h-[200px]">
                        {historyLoading || leaveLoading ? (
                            <div className="flex justify-center items-center h-[200px] text-gray-500 font-medium">Loading data...</div>
                        ) : activeTab === 'Attendance History' ? (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#fdf0f4]">
                                        <th className="py-4 px-6 text-[13px] font-bold text-gray-900">Date</th>
                                        <th className="py-4 px-6 text-[13px] font-bold text-gray-900 flex items-center">Check-in <span className="ml-1 opacity-50">⇅</span></th>
                                        <th className="py-4 px-6 text-[13px] font-bold text-gray-900">Check-Out <span className="opacity-50 ml-1">⇅</span></th>
                                        <th className="py-4 px-6 text-[13px] font-bold text-gray-900">Over Time/ Under Time <span className="opacity-50 ml-1">⇅</span></th>
                                        <th className="py-4 px-6 text-[13px] font-bold text-gray-900">Total Login</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceData.map((row, idx) => (
                                        <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50">
                                            <td className="py-5 px-6 text-[13px] font-bold text-gray-900">{row.date}</td>
                                            <td className="py-5 px-6 text-[13px] font-bold text-gray-700">{row.in}</td>
                                            <td className="py-5 px-6 text-[13px] font-bold text-gray-700">{row.out}</td>
                                            <td className={`py-5 px-6 text-[13px] font-bold ${row.overtime.includes('+') ? 'text-[#16a34a]' : 'text-[#ef4444]'}`}>
                                                {row.overtime}
                                            </td>
                                            <td className="py-5 px-6 text-[13px] font-bold text-gray-900">{row.total}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#fdf0f4]">
                                        <th className="py-4 px-6 text-[13px] font-bold text-gray-900">Date</th>
                                        <th className="py-4 px-6 text-[13px] font-bold text-gray-900">Type</th>
                                        <th className="py-4 px-6 text-[13px] font-bold text-gray-900">Days</th>
                                        <th className="py-4 px-6 text-[13px] font-bold text-gray-900">Leave Time</th>
                                        <th className="py-4 px-6 text-[13px] font-bold text-gray-900">Status</th>
                                        <th className="py-4 px-6 text-[13px] font-bold text-gray-900">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaveData.map((row, idx) => (
                                        <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50">
                                            <td className="py-5 px-6 text-[13px] font-bold text-gray-900">{row.date}</td>
                                            <td className="py-5 px-6 text-[13px] font-medium text-gray-700">{row.type}</td>
                                            <td className="py-5 px-6 text-[13px] font-medium text-gray-700">{row.days}</td>
                                            <td className="py-5 px-6 text-[13px] font-medium text-gray-700">{row.time}</td>
                                            <td className="py-5 px-6">
                                                <span className="border border-[#8e24aa] text-[#8e24aa] px-3 py-1 rounded-full text-[12px] font-medium flex items-center w-max">
                                                    {row.status} <Clock className="w-3.5 h-3.5 ml-2" />
                                                </span>
                                            </td>
                                            <td className="py-5 px-6">
                                                <button className="text-[13px] font-bold text-gray-900 underline hover:text-[#d32f2f]">
                                                    {row.action}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Bottom Action Cards */}
                    <div className="flex gap-6 mt-auto">
                        
                        {/* Attachment */}
                        <div className="flex-1 bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 flex flex-col">
                            <h3 className="text-[15px] font-bold text-gray-900 mb-1">Attachment</h3>
                            <p className="text-[12px] text-gray-500 mb-4">Lorem Ipsum is simply dummy text.</p>
                            
                            <div className="flex-1 border border-dashed border-gray-300 rounded-[16px] flex flex-col items-center justify-center p-6 mb-4 bg-gray-50/50">
                                <p className="text-[12px] font-medium text-gray-900 mb-2 text-center">Drag and drop file here<br/>Or</p>
                                <button className="border-2 border-[#8e24aa] text-[#8e24aa] text-[12px] font-bold py-1.5 px-6 rounded-lg mb-2 hover:bg-[#faf5fa] transition-colors">
                                    Browse File
                                </button>
                                <p className="text-[10px] text-gray-400">PDF, JPG, PNG (Max 5MB)</p>
                            </div>
                            
                            <button className="w-full py-2.5 text-sm font-bold text-white rounded-xl shadow-sm transition-all hover:opacity-90" style={{ background: 'linear-gradient(90deg, #8e24aa 0%, #d32f2f 100%)' }}>
                                Send
                            </button>
                        </div>

                        {/* Manager Approval */}
                        <div className="flex-1 bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 flex flex-col">
                            <h3 className="text-[15px] font-bold text-gray-900 mb-1">Manager Approval</h3>
                            <p className="text-[12px] text-gray-500 mb-4">Needs the manager's approval</p>
                            
                            <div className="border border-gray-200 rounded-[16px] p-4 flex items-center space-x-3 mb-6">
                                <img src="https://i.pravatar.cc/150?img=11" alt="Manager" className="w-10 h-10 rounded-full" />
                                <div>
                                    <h4 className="text-[13px] font-bold text-gray-900">Michael Brown</h4>
                                    <p className="text-[11px] text-gray-500">Restaurant Manager</p>
                                </div>
                            </div>
                            
                            <div className="bg-[#dcfce7] border border-[#86efac] rounded-[16px] p-4 flex-1 flex flex-col justify-center">
                                <h4 className="text-[13px] font-bold text-[#16a34a] mb-1">Pending Approval</h4>
                                <p className="text-[11px] text-[#22c55e]">Lorem Ipsum is simply dummy text.</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Right Column (Widgets) */}
                <div className="flex-[1] flex flex-col gap-6">
                    
                    {/* Clock In Widget */}
                    <div className="bg-white rounded-[24px] shadow-md border border-pink-100 p-8 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 border-2 border-transparent rounded-[24px]" style={{ background: 'linear-gradient(90deg, #8e24aa 0%, #d32f2f 100%)', maskImage: 'linear-gradient(white, white), linear-gradient(white, white)', maskClip: 'padding-box, border-box', maskComposite: 'exclude', WebkitMaskComposite: 'xor' }}></div>
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                            <Power className="w-8 h-8 text-gray-800" />
                        </div>
                        <h4 className="text-[14px] font-bold text-gray-900 mb-1">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                        </h4>
                        <h2 className="text-[24px] font-bold text-gray-900 mb-6">
                            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </h2>
                        
                        {dashboardData?.isClockedIn ? (
                            <button 
                                onClick={() => clockOutMutation.mutate()}
                                disabled={clockOutMutation.isPending}
                                className="w-full py-3 text-sm font-bold text-white rounded-xl shadow-sm transition-all hover:opacity-90 disabled:opacity-50" 
                                style={{ background: '#ef4444' }}
                            >
                                {clockOutMutation.isPending ? 'Clocking out...' : 'Clock Out'}
                            </button>
                        ) : (
                            <button 
                                onClick={() => clockInMutation.mutate()}
                                disabled={clockInMutation.isPending}
                                className="w-full py-3 text-sm font-bold text-white rounded-xl shadow-sm transition-all hover:opacity-90 disabled:opacity-50" 
                                style={{ background: 'linear-gradient(90deg, #8e24aa 0%, #d32f2f 100%)' }}
                            >
                                {clockInMutation.isPending ? 'Clocking in...' : 'Clock In'}
                            </button>
                        )}
                    </div>

                    {/* Leave Balance Widget */}
                    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 relative">
                        <div className="absolute inset-0 border-2 border-transparent rounded-[24px]" style={{ background: 'linear-gradient(90deg, #8e24aa 0%, #d32f2f 100%)', maskImage: 'linear-gradient(white, white), linear-gradient(white, white)', maskClip: 'padding-box, border-box', maskComposite: 'exclude', WebkitMaskComposite: 'xor' }}></div>
                        <div className="flex items-start space-x-4 mb-4">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white bg-gradient-to-br from-[#f87171] to-[#f43f5e]">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-[15px] font-bold text-gray-900">Leave Balance</h4>
                                <p className="text-[12px] text-gray-500">Annual Leave Remaning</p>
                            </div>
                        </div>
                        <h2 className="text-[22px] font-bold text-gray-900 mb-3">7 days</h2>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#8e24aa] to-[#d32f2f] h-2.5 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                    </div>

                    {/* Emergency Contact Widget */}
                    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 relative flex-1">
                        <div className="absolute inset-0 border-2 border-transparent rounded-[24px]" style={{ background: 'linear-gradient(90deg, #8e24aa 0%, #d32f2f 100%)', maskImage: 'linear-gradient(white, white), linear-gradient(white, white)', maskClip: 'padding-box, border-box', maskComposite: 'exclude', WebkitMaskComposite: 'xor' }}></div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-gradient-to-br from-[#f87171] to-[#f43f5e]">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <h4 className="text-[14px] font-bold text-gray-900">Emergency Contact</h4>
                            </div>
                            <div 
                                className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${emergencyToggle ? 'bg-gradient-to-r from-[#8e24aa] to-[#d32f2f]' : 'bg-gray-300'}`}
                                onClick={() => setEmergencyToggle(!emergencyToggle)}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${emergencyToggle ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </div>
                        </div>
                        
                        <div className="space-y-4 mb-8">
                            <div className="flex items-start space-x-3 border-b border-gray-100 pb-4">
                                <Phone className="w-4 h-4 text-gray-500 mt-0.5" />
                                <div>
                                    <h4 className="text-[13px] font-bold text-gray-900">+1 987 654 3210</h4>
                                    <p className="text-[11px] text-gray-500">John Doe</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3 border-b border-gray-100 pb-4">
                                <Mail className="w-4 h-4 text-gray-500 mt-0.5" />
                                <div>
                                    <h4 className="text-[13px] font-bold text-gray-900">John.doe@example.com</h4>
                                    <p className="text-[11px] text-gray-500">Eamil</p>
                                </div>
                            </div>
                        </div>

                        <button className="w-full py-2 border border-[#8e24aa] text-[#8e24aa] rounded-xl text-[13px] font-bold hover:bg-[#faf5fa] transition-colors">
                            Edit Contact
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EmployeeAttendance;
