import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../common/Modal';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useFloors } from '../../../hooks/queries/useFloorPlan';
import { toast } from 'react-toastify';

const TableFormModal = ({ isOpen, onClose, isEdit, tableData, onSave, isLoading }) => {
    const { t } = useTranslation('settings');
    const { data: floors = [], isLoading: isFloorsLoading } = useFloors();

    const [formData, setFormData] = useState({
        title: '',
        floor_id: '',
        capacity: 4
    });

    useEffect(() => {
        if (isOpen) {
            if (isEdit && tableData) {
                let foundFloorId = tableData.Floor_id;
                if (!foundFloorId && typeof tableData.Floor === 'object' && tableData.Floor?.Floor_id) {
                    foundFloorId = tableData.Floor.Floor_id;
                }
                if (!foundFloorId && (tableData.Floor || tableData.Floor_Name)) {
                    const floorName = typeof tableData.Floor === 'string' ? tableData.Floor : tableData.Floor_Name;
                    const matched = floors.find(f => f.Floor_Name === floorName || f.name === floorName);
                    if (matched) foundFloorId = matched.Floor_id;
                }
                if (!foundFloorId && floors.length > 0) {
                    foundFloorId = floors[0].Floor_id;
                }

                setFormData({
                    title: tableData.Title || tableData['Table-name'] || '',
                    floor_id: foundFloorId ? String(foundFloorId) : (floors[0]?.Floor_id ? String(floors[0].Floor_id) : ''),
                    capacity: Math.max(1, Number(tableData.Capacity || tableData['Seating-Persons_Count']) || 4)
                });
            } else {
                setFormData({
                    title: '',
                    floor_id: floors.length > 0 ? String(floors[0].Floor_id) : '',
                    capacity: 4
                });
            }
        }
    }, [isOpen, isEdit, tableData, floors]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'capacity' ? (value === '' ? '' : Math.max(1, parseInt(value) || 1)) : value
        }));
    };

    const handleIncrement = () => {
        setFormData(prev => ({ ...prev, capacity: (Number(prev.capacity) || 0) + 1 }));
    };

    const handleDecrement = () => {
        setFormData(prev => ({ ...prev, capacity: Math.max(1, (Number(prev.capacity) || 1) - 1) }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            toast.error(t('tables.titleRequired', 'Please enter table title'));
            return;
        }
        if (!formData.floor_id) {
            toast.error(t('tables.floorRequired', 'Please select a floor'));
            return;
        }
        const cap = Math.max(1, Number(formData.capacity) || 1);
        onSave({
            title: formData.title.trim(),
            floor_id: Number(formData.floor_id),
            capacity: cap
        });
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={isEdit ? t('tables.editTable', 'Update Table') : t('tables.addTable', 'Add Table')}
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 pt-2 font-poppins">
                {/* Title */}
                <div className="flex flex-col gap-2">
                    <label className="text-black font-bold text-[15px]">{t('tables.tableName', 'Title')}</label>
                    <input 
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder={t('tables.enterTitle', 'Enter Table Title')}
                        className="w-full bg-[#F5EAF4] text-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-purple-300 transition-all font-medium placeholder-gray-500"
                        required
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Floor */}
                    <div className="flex flex-col gap-2 flex-1">
                        <label className="text-black font-bold text-[15px]">{t('tables.floor', 'Floor')}</label>
                        <div className="relative p-[1px] rounded-xl bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F]">
                            <select 
                                name="floor_id"
                                value={formData.floor_id}
                                onChange={handleChange}
                                className="w-full bg-[#F5EAF4] text-gray-800 rounded-[11px] px-4 py-3 outline-none font-medium pr-10 appearance-none cursor-pointer"
                                required
                            >
                                {isFloorsLoading ? (
                                    <option value="">{t('common.loading', 'Loading...')}</option>
                                ) : floors.length === 0 ? (
                                    <option value="">{t('tables.noFloors', 'No floors available')}</option>
                                ) : (
                                    <>
                                        <option value="" disabled>{t('tables.selectFloor', 'Select Floor')}</option>
                                        {floors.map(floor => (
                                            <option key={floor.Floor_id} value={floor.Floor_id}>
                                                {floor.Floor_Name || `Floor ${floor.Floor_id}`}
                                            </option>
                                        ))}
                                    </>
                                )}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-700">
                                <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                            </div>
                        </div>
                    </div>

                    {/* Capacity */}
                    <div className="flex flex-col gap-2 flex-1">
                        <label className="text-black font-bold text-[15px]">{t('tables.capacity', 'Capacity')}</label>
                        <div 
                            className="p-[1px] rounded-xl bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F]"
                        >
                            <div className="flex items-center bg-[#F5EAF4] rounded-[11px] px-4 py-[7px] w-full">
                                <input 
                                    type="number"
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    placeholder={t('tables.enterCapacity', 'Enter Capacity')}
                                    className="flex-1 bg-transparent outline-none font-medium text-gray-800 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    min="1"
                                    required
                                />
                                <div className="flex flex-col border-l border-gray-300 pl-2 ml-2">
                                    <button type="button" onClick={handleIncrement} className="text-black hover:text-gray-600">
                                        <ChevronUp className="w-4 h-4 stroke-[3]" />
                                    </button>
                                    <button type="button" onClick={handleDecrement} className="text-black hover:text-gray-600">
                                        <ChevronDown className="w-4 h-4 stroke-[3]" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex justify-center w-full max-w-[200px] mx-auto">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 rounded-xl text-white font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F]"
                    >
                        {isLoading ? t('tables.saving', 'Saving...') : t('tables.save', 'Save')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default TableFormModal;
