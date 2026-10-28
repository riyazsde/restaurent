import { useQuery } from '@tanstack/react-query';
import { SettingsTableSkeleton } from './SettingsSkeletons';
import { toast } from 'react-toastify';
import { servicesApi } from '../../api/services.api';

const ServicesTab = () => {
    const { data: services = [], isLoading, isError, error } = useQuery({
        queryKey: ['services'],
        queryFn: async () => {
            const response = await servicesApi.list({ page: 1, limit: 100 });
            return response.data?.data || [];
        }
    });

    if (isError) {
        toast.error(error.message || 'Failed to fetch services');
    }
    
    if (isLoading) {
        return <SettingsTableSkeleton />;
    }

    return (
        <div className="font-poppins">
            <div className="flex flex-col sm:flex-row sm:items-center mb-6">
                <h2 className="text-2xl md:text-[32px] font-semibold">Professional Services</h2>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-[#F8EAF0] text-left">
                        <tr>
                            <th className="px-4 py-2 border">Service Type</th>
                            <th className="px-4 py-2 border">Description</th>
                            <th className="px-4 py-2 border">Status</th>
                            <th className="px-4 py-2 border">Service Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.length > 0 ? (
                            services.map((item, index) => (
                                <tr key={item.id || index}>
                                    <td className="px-4 py-2 border">{item.service_type || '-'}</td>
                                    <td className="px-4 py-2 border">{item.service_description || '-'}</td>
                                    <td className="px-4 py-2 border">{item.service_status || '-'}</td>
                                    <td className="px-4 py-2 border">{item.service_date ? new Date(item.service_date).toLocaleDateString() : '-'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-4 py-8 text-center text-gray-500">No Services found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ServicesTab;
