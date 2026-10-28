import { useQuery } from '@tanstack/react-query';
import { SettingsTableSkeleton } from './SettingsSkeletons';
import { toast } from 'react-toastify';
import { transactionsApi } from '../../api/transactions.api';

const TransactionsTab = () => {
    const { data: transactions = [], isLoading, isError, error } = useQuery({
        queryKey: ['transactions'],
        queryFn: async () => {
            const response = await transactionsApi.listByMerchant(101, { page: 1, limit: 100 });
            return response.data?.data || [];
        }
    });

    if (isError) {
        toast.error(error.message || 'Failed to fetch transactions');
    }
    
    if (isLoading) {
        return <SettingsTableSkeleton />;
    }

    return (
        <div className="font-poppins">
            <div className="flex flex-col sm:flex-row sm:items-center mb-6">
                <h2 className="text-2xl md:text-[32px] font-semibold">Transactions History</h2>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-[#F8EAF0] text-left">
                        <tr>
                            <th className="px-4 py-2 border">Order ID</th>
                            <th className="px-4 py-2 border">Amount</th>
                            <th className="px-4 py-2 border">Payment Method</th>
                            <th className="px-4 py-2 border">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length > 0 ? (
                            transactions.map((item, index) => (
                                <tr key={item.id || index}>
                                    <td className="px-4 py-2 border">{item.order_id || '-'}</td>
                                    <td className="px-4 py-2 border">{item.transaction_amount ? `${item.transaction_amount} ${item.currency || ''}` : '-'}</td>
                                    <td className="px-4 py-2 border">{item.payment_method_used || '-'}</td>
                                    <td className="px-4 py-2 border">
                                        <span className={`px-2 py-1 rounded text-xs ${item.transaction_status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {item.transaction_status || 'Pending'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-4 py-8 text-center text-gray-500">No Transactions found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionsTab;
