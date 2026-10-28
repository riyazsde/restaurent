import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import EmployeeSidebar from './EmployeeSidebar';
import EmployeeHeader from './EmployeeHeader';

const EmployeeLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

    return (
        <div className="flex h-screen w-full bg-white overflow-hidden relative">
            <EmployeeSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            
            <div className="flex flex-col flex-1 h-full overflow-hidden w-full">
                <EmployeeHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                
                <main className="flex-1 overflow-y-auto bg-white p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
            
            {/* Overlay for mobile when sidebar is open */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default EmployeeLayout;
