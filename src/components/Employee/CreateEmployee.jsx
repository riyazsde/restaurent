import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useCreateEmployee } from '../../hooks/queries/useEmployee';

const CreateEmployee = () => {
    const { t } = useTranslation('employee');
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        role: '',
        permissions: '',
        email: '',
        password: '',
        confirm_password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const createMutation = useCreateEmployee({
        onSuccess: (response) => {
            if (response.success || response.status === 200 || response.data) {
                toast.success(t('create.success', 'Employee created successfully!'));
                navigate('/dashboard/employee');
            } else {
                toast.error(response.message || t('create.error', 'Failed to create employee'));
            }
        },
        onError: (error) => {
            toast.error(error.message || t('create.error', 'An error occurred during creation.'));
        }
    });

    const isSubmitting = createMutation.isPending;

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.first_name?.trim()) {
            toast.error(t('create.validation.firstNameRequired', 'First name is required'));
            return;
        }
        if (!formData.last_name?.trim()) {
            toast.error(t('create.validation.lastNameRequired', 'Last name is required'));
            return;
        }
        if (!formData.role) {
            toast.error(t('create.validation.roleRequired', 'Please select a role'));
            return;
        }
        if (!formData.email?.trim()) {
            toast.error(t('create.validation.emailRequired', 'Email is required'));
            return;
        }
        if (!formData.password) {
            toast.error(t('create.validation.passwordRequired', 'Password is required'));
            return;
        }
        if (formData.password !== formData.confirm_password) {
            toast.error(t('create.validation.passwordMismatch', 'Passwords do not match'));
            return;
        }

        // Map permissions
        let perms = [];
        if (formData.permissions === 'All') {
            perms = ["Dashboard", "POS", "Orders", "Kitchen", "Floor Plan", "Reservations", "Customers", "Invoices", "Feedbacks", "Reports", "Users", "Settings"];
        } else if (formData.permissions) {
            perms = [formData.permissions];
        } else {
            perms = ["Dashboard", "POS", "Orders"];
        }

        const payload = {
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            email: formData.email.trim(),
            phone: '+1 555-0199',
            role: formData.role,
            permissions: perms,
            responsibility: formData.role === 'Cashier' 
                ? 'Billing & Cashiering' 
                : formData.role === 'Chef' 
                    ? 'Kitchen Coordination' 
                    : formData.role === 'Waiter'
                        ? 'Table Service'
                        : 'General Operations',
            onboarding_date: new Date().toISOString().split('T')[0],
            experience_years: 1,
            shift_timings: '9:00 - 20:00',
            total_leave_days: 12,
            leave_left_days: 12,
            profile_image: '',
            password: formData.password,
            status: true
        };

        createMutation.mutate(payload);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 font-[Poppins]">
            {/* Header */}
            <h1 className="text-2xl sm:text-[32px] font-bold text-black mb-8">
                {t('create.title', 'Create Employee')}
            </h1>

            {/* Form Container */}
            <div className="bg-[#FAF5F8] p-6 sm:p-10 lg:p-12 rounded-[24px] w-full max-w-5xl border border-[#F2E7EE] shadow-xs">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    
                    {/* First Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1.5">
                            {t('create.firstName', 'First Name')}
                        </label>
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            placeholder={t('create.placeholders.firstName', 'Type Business name')}
                            className="w-full border border-gray-300 rounded-[8px] px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                        />
                    </div>

                    {/* Last Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1.5">
                            {t('create.lastName', 'Last Name')}
                        </label>
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            placeholder={t('create.placeholders.lastName', 'Type Business name')}
                            className="w-full border border-gray-300 rounded-[8px] px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1.5">
                            {t('create.role', 'Role')}
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-[8px] px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white cursor-pointer"
                        >
                            <option value="">{t('create.placeholders.selectRole', 'Enter Role')}</option>
                            <option value="Manager">Manager</option>
                            <option value="Cashier">Cashier</option>
                            <option value="Waiter">Waiter</option>
                            <option value="Chef">Chef</option>
                        </select>
                    </div>

                    {/* Permissions */}
                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1.5">
                            {t('create.permissions', 'Permissions')}
                        </label>
                        <select
                            name="permissions"
                            value={formData.permissions}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-[8px] px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white cursor-pointer"
                        >
                            <option value="">{t('create.placeholders.selectPermissions', 'Enter Permissions')}</option>
                            <option value="All">All</option>
                            <option value="Dashboard">Dashboard</option>
                            <option value="POS">POS</option>
                            <option value="Orders">Orders</option>
                            <option value="Kitchen">Kitchen</option>
                            <option value="Floor Plan">Floor Plan</option>
                            <option value="Reservations">Reservations</option>
                            <option value="Customers">Customers</option>
                            <option value="Invoices">Invoices</option>
                            <option value="Settings">Settings</option>
                        </select>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1.5">
                            {t('create.email', 'Email')}
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder={t('create.placeholders.email', 'Enter Email')}
                            className="w-full border border-gray-300 rounded-[8px] px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                        />
                    </div>

                    {/* Blank second column on desktop to match exact Figma layout */}
                    <div className="hidden md:block" />

                    {/* Create Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1.5">
                            {t('create.createPassword', 'Create Password')}
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder={t('create.placeholders.password', 'Create Password')}
                            className="w-full border border-gray-300 rounded-[8px] px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                        />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1.5">
                            {t('create.confirmPassword', 'Confirm Password')}
                        </label>
                        <input
                            type="password"
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            placeholder={t('create.placeholders.confirmPassword', 'Confirm Password')}
                            className="w-full border border-gray-300 rounded-[8px] px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="md:col-span-2 flex justify-center mt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full max-w-[440px] py-3.5 rounded-xl font-semibold text-[16px] text-white hover:opacity-95 transition-opacity disabled:opacity-50 shadow cursor-pointer"
                            style={{ background: 'linear-gradient(90deg, #6A1B9A 0%, #D32F2F 100%)' }}
                        >
                            {isSubmitting ? t('create.creating', 'Saving...') : t('create.save', 'Save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEmployee;