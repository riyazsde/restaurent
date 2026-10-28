import React from 'react';
import { useTranslation } from 'react-i18next';
import StatusToggle from '../../common/StatusToggle';
import DaySelector from '../../common/DaySelector';
import TimeRangePicker from '../../common/TimeRangePicker';
import { useHappyHourSettings, useUpdateHappyHour } from '../../../hooks/queries/useLoyalty';

const HappyHourCard = () => {
    const { t } = useTranslation('common');
    const { data: response, isLoading } = useHappyHourSettings();
    const updateMutation = useUpdateHappyHour();
    const settings = response?.data;

    if (isLoading || !settings) {
        return (
            <div className="w-full bg-white rounded-[20px] border border-gray-200 p-8 mt-6 animate-pulse flex flex-col lg:flex-row gap-8">
                <div className="flex-1 flex flex-col gap-6">
                    <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                    <div className="h-10 w-full bg-gray-200 rounded"></div>
                    <div className="h-10 w-full bg-gray-200 rounded"></div>
                    <div className="h-10 w-full bg-gray-200 rounded"></div>
                </div>
                <div className="flex-1 min-h-[300px] bg-gray-200 rounded-[18px]"></div>
            </div>
        );
    }

    const handleChange = (key, value) => {
        updateMutation.mutate({ ...settings, [key]: value });
    };

    return (
        <div className="w-full bg-white rounded-[20px] border border-gray-200 p-8 mt-6 shadow-sm flex flex-col lg:flex-row gap-10 font-poppins">
            {/* Left Controls */}
            <div className="flex-1 flex flex-col justify-between space-y-6">
                
                {/* Header */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                        {t('loyalty.happyHourTitle', 'Happy Hour Bonus Points')}
                    </h2>
                    <p className="text-xs text-gray-500">
                        {t('loyalty.happyHourSubtitle', 'Automatically award bonus points during happy hour.')}
                    </p>
                </div>

                {/* Enable Toggle */}
                <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-bold text-gray-900">
                        {t('loyalty.enableBonusPoints', 'Enable Bonus Points')}
                    </span>
                    <StatusToggle 
                        isActive={settings.enabled} 
                        onChange={() => handleChange('enabled', !settings.enabled)} 
                        disabled={updateMutation.isLoading}
                        activeText={t('loyalty.active', 'Active')}
                        inactiveText={t('loyalty.inactive', 'Inactive')}
                    />
                </div>

                {/* Multiplier Dropdown */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-gray-900">
                            {t('loyalty.bonusPointsMultiplier', 'Bonus Points Multiplier')}
                        </span>
                        <div className="relative">
                            <select 
                                value={settings.multiplier}
                                onChange={(e) => handleChange('multiplier', e.target.value)}
                                disabled={updateMutation.isLoading}
                                className="border border-gray-300 rounded-[8px] pl-3.5 pr-8 py-2 text-sm font-medium text-gray-800 outline-none focus:border-purple-500 bg-white w-[140px] shadow-sm appearance-none cursor-pointer"
                                style={{ 
                                    backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E")', 
                                    backgroundRepeat: 'no-repeat', 
                                    backgroundPosition: 'right 8px center' 
                                }}
                            >
                                <option value="1x">1x</option>
                                <option value="1.25x">1.25x</option>
                                <option value="1.5x">1.5x</option>
                                <option value="2x">2x</option>
                                <option value="3x">3x</option>
                            </select>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400">
                        {t('loyalty.bonusPointsMultiplierDesc', 'Points multiplier applied during happy hour.')}
                    </p>
                </div>

                {/* Happy Hour Times */}
                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">
                        {t('loyalty.happyHour', 'Happy Hour')}
                    </span>
                    <TimeRangePicker 
                        startTime={settings.startTime} 
                        endTime={settings.endTime} 
                        onStartTimeChange={(val) => handleChange('startTime', val)}
                        onEndTimeChange={(val) => handleChange('endTime', val)}
                    />
                </div>

                {/* Days Selection */}
                <div>
                    <span className="text-sm font-bold text-gray-900 block mb-3">
                        {t('loyalty.days', 'Days')}
                    </span>
                    <DaySelector 
                        selectedDays={settings.days} 
                        onChange={(val) => handleChange('days', val)}
                    />
                </div>

            </div>

            {/* Right Video / Photo Showcase */}
            <div className="flex-1 rounded-[18px] overflow-hidden min-h-[320px] max-h-[400px] relative bg-black shadow-inner">
                <video 
                    src="/istockphoto-1365344696-640_adpp_is.mp4" 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="absolute inset-0 w-full h-full object-cover" 
                />
            </div>
        </div>
    );
};

export default HappyHourCard;
