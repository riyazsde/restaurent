import { useQuery } from '@tanstack/react-query';
import { SettingsTableSkeleton } from './SettingsSkeletons';
import { toast } from 'react-toastify';
import { addonsApi } from '../../api/addons.api';

const AddonsTab = () => {
    const { data: addons = [], isLoading, isError, error } = useQuery({
        queryKey: ['addons'],
        queryFn: async () => {
            const response = await addonsApi.list({ page: 1, limit: 100, merchant_id: 101 });
            return response.data?.data || [];
        }
    });

    if (isError) {
        toast.error(error.message || 'Failed to fetch addons');
    }
    
    if (isLoading) {
        return <SettingsTableSkeleton />;
    }

    return (
        <div className="font-poppins">
            <div className="flex flex-col sm:flex-row sm:items-center mb-6">
                <h2 className="text-2xl md:text-[32px] font-semibold">Addons</h2>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-[#F8EAF0] text-left">
                        <tr>
                            <th className="px-4 py-2 border">Module Name</th>
                            <th className="px-4 py-2 border">Billing Cycle</th>
                            <th className="px-4 py-2 border">Monthly Price</th>
                            <th className="px-4 py-2 border">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {addons.length > 0 ? (
                            addons.map((item, index) => (
                                <tr key={item.id || index}>
                                    <td className="px-4 py-2 border">{item.module_name || '-'}</td>
                                    <td className="px-4 py-2 border">{item.billing_cycle || '-'}</td>
                                    <td className="px-4 py-2 border">{item.monthly_price || '-'}</td>
                                    <td className="px-4 py-2 border">{item.addon_status || 'Active'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-4 py-8 text-center text-gray-500">No Addons found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AddonsTab;
