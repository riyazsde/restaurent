import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTables } from '../../hooks/queries/useTables';
import StoreTableCard from './Tables/StoreTableCard';
import StoreTableSkeleton from './Tables/StoreTableSkeleton';
import TableFormModal from './Tables/TableFormModal';
import QRModal from './Tables/QRModal';
import ConfirmDialog from '../common/ConfirmDialog';
import GradientOutlineButton from '../common/GradientOutlineButton';
import useSearchStore from '../../store/searchStore';

const TablesTab = () => {
    const { t } = useTranslation('settings');
    const { getTables, createTable, updateTable, deleteTable } = useTables();
    const { searchQuery, setSearchPlaceholder } = useSearchStore();

    React.useEffect(() => {
        setSearchPlaceholder('Search tables...');
        return () => setSearchPlaceholder('');
    }, [setSearchPlaceholder]);
    
    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    // Selected table state
    const [selectedTable, setSelectedTable] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Handlers
    const handleAddNew = () => {
        setSelectedTable(null);
        setIsEditMode(false);
        setIsFormModalOpen(true);
    };

    const handleEdit = (table) => {
        setSelectedTable(table);
        setIsEditMode(true);
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = (table) => {
        setSelectedTable(table);
        setIsDeleteModalOpen(true);
    };

    const handleDownloadQR = (table) => {
        setSelectedTable(table);
        setIsQRModalOpen(true);
    };

    // Form Save
    const handleSaveForm = (formData) => {
        const payload = {
            Title: formData.title,
            Floor_id: Number(formData.floor_id),
            Capacity: Number(formData.capacity),
            'Table-name': formData.title,
            'Seating-Persons_Count': Number(formData.capacity),
            'Table-code': formData.title.replace(/\s+/g, '-').toUpperCase(),
            Table_types_id: 1,
            'Table-Booking-Status_id': 1,
            Emozi: '🪑',
            Status: true,
        };

        if (isEditMode && selectedTable) {
            const tableId = selectedTable.Table_id || selectedTable.id || selectedTable._id;
            updateTable.mutate(
                { id: tableId, ...payload },
                {
                    onSuccess: () => {
                        setIsFormModalOpen(false);
                        setSelectedTable(null);
                    }
                }
            );
        } else {
            createTable.mutate(
                payload,
                {
                    onSuccess: () => {
                        setIsFormModalOpen(false);
                    }
                }
            );
        }
    };

    // Confirm Delete
    const handleConfirmDelete = () => {
        if (selectedTable?.Table_id) {
            deleteTable.mutate(selectedTable.Table_id, {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setSelectedTable(null);
                }
            });
        }
    };

    const displayedTables = React.useMemo(() => {
        const tables = getTables.data || [];
        if (!searchQuery || !searchQuery.trim()) return tables;
        const q = searchQuery.toLowerCase().trim();
        return tables.filter(table => {
            const title = String(table.Title || table['Table-name'] || '').toLowerCase();
            const code = String(table['Table-code'] || '').toLowerCase();
            const floor = String(table.Floor_id || '').toLowerCase();
            return title.includes(q) || code.includes(q) || floor.includes(q);
        });
    }, [getTables.data, searchQuery]);

    return (
        <div className="mx-auto p-6 md:p-8 font-poppins">
            <div className="flex flex-col sm:flex-row sm:items-center mb-6">
                <h2 className="text-2xl md:text-[32px] font-bold text-black">{t('tables.title', 'Store Tables')}</h2>
                <GradientOutlineButton
                    onClick={handleAddNew}
                    className="mt-4 sm:mt-0 sm:ml-4 px-6 rounded-[12px]"
                >
                    {t('common.new', '+ New')}
                </GradientOutlineButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {getTables.isLoading ? (
                    Array(6).fill(0).map((_, idx) => <StoreTableSkeleton key={`skel-${idx}`} />)
                ) : displayedTables.length > 0 ? (
                    displayedTables.map(table => (
                        <StoreTableCard 
                            key={table.Table_id} 
                            table={table} 
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                            onDownloadQR={handleDownloadQR}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-gray-500 font-medium">
                        {searchQuery ? t('common.noResults', 'No tables found matching your search') : t('tables.noTables', 'No tables found. Add a new one!')}
                    </div>
                )}
            </div>

            {/* Modals */}
            <TableFormModal 
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                isEdit={isEditMode}
                tableData={selectedTable}
                onSave={handleSaveForm}
                isLoading={createTable.isPending || updateTable.isPending}
            />

            <QRModal 
                isOpen={isQRModalOpen}
                onClose={() => setIsQRModalOpen(false)}
                table={selectedTable}
            />

            <ConfirmDialog 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                isLoading={deleteTable.isPending}
            />
        </div>
    );
};

export default TablesTab;
