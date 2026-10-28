import { useQuery } from '@tanstack/react-query';
import { SettingsFormSkeleton } from './SettingsSkeletons';
import { toast } from 'react-toastify';
import { merchantPaymentConfigApi } from '../../api/merchantPaymentConfig.api';

const MobileMoneyConfigTab = () => {
    const { data: configs = [], isLoading, isError, error } = useQuery({
        queryKey: ['merchantPaymentConfig'],
        queryFn: async () => {
            const response = await merchantPaymentConfigApi.list();
            return response.data?.data || [];
        }
    });

    if (isError) {
        toast.error(error.message || 'Failed to fetch payment configs');
    }
    
    if (isLoading) {
        return <SettingsFormSkeleton />;
    }

    return (
        <div className="font-poppins">
            <div className="flex flex-col sm:flex-row sm:items-center mb-6">
                <h2 className="text-2xl md:text-[32px] font-semibold">Mobile Money Configurations</h2>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-[#F8EAF0] text-left">
                        <tr>
                            <th className="px-4 py-2 border">Display Name</th>
                            <th className="px-4 py-2 border">Merchant Account ID</th>
                            <th className="px-4 py-2 border">Currency</th>
                            <th className="px-4 py-2 border">Enabled</th>
                        </tr>
                    </thead>
                    <tbody>
                        {configs.length > 0 ? (
                            configs.map((item, index) => (
                                <tr key={item.id || index}>
                                    <td className="px-4 py-2 border">{item.display_name || '-'}</td>
                                    <td className="px-4 py-2 border">{item.merchant_account_id || '-'}</td>
                                    <td className="px-4 py-2 border">{item.currency || '-'}</td>
                                    <td className="px-4 py-2 border">
                                        <span className={`px-2 py-1 rounded text-xs ${item.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {item.enabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-4 py-8 text-center text-gray-500">No Mobile Money Configurations found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MobileMoneyConfigTab;
