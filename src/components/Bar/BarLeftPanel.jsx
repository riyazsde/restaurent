import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IMAGE_BASE_URL } from '../../services/fileUploadService';
import { formatCurrency } from '../../utils/currencyUtils';

const DrinkItemCard = ({ item, onSelect, currency }) => {
    const [imageError, setImageError] = useState(false);

    const title = item.Title || item['item-name'] || item.name || item.Item_Name || 'Drink Item';
    const rawPrice = item.Price ?? item['item-price'] ?? item.Net_Price ?? 0;

    // Check if item has a valid image string from the API
    const rawImage = item.image || item.Image || item.Image_url;
    const hasApiImage = Boolean(
        rawImage && 
        typeof rawImage === 'string' && 
        rawImage.trim() !== '' && 
        rawImage !== 'null' && 
        rawImage !== 'undefined'
    );

    const imageSrc = hasApiImage
        ? (rawImage.startsWith('http') ? rawImage : `${IMAGE_BASE_URL}${rawImage}`)
        : null;

    // Retrieve emoji from inside the category object, or fallback to item emoji
    const emoji = item.Category?.emozi || 
                  item.Category?.emoji || 
                  item.Category?.Emozi || 
                  item.Emozi || 
                  item.emozi || 
                  '🍸';

    const shouldShowImage = hasApiImage && !imageError;

    return (
        <div 
            onClick={() => onSelect?.(item)}
            className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all h-[185px] group select-none"
            style={{ boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)' }}
        >
            <div className="w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center mb-3">
                {shouldShowImage ? (
                    <img 
                        src={imageSrc} 
                        alt={title} 
                        className="w-full h-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center rounded-2xl bg-[#FFF6F0] text-4xl sm:text-5xl group-hover:scale-110 transition-transform">
                        <span role="img" aria-label={title}>{emoji}</span>
                    </div>
                )}
            </div>
            <h3 
                className="font-manrope font-bold text-gray-900 text-[14px] text-center w-full truncate leading-snug" 
                title={title}
            >
                {title}
            </h3>
            <p className="font-manrope font-extrabold text-black text-[13px] mt-1">
                {formatCurrency(rawPrice, currency)}
            </p>
        </div>
    );
};

const BarLeftPanel = ({
    items = [],
    loading = false,
    categories = [],
    selectedCategoryId = 'all',
    onSelectCategory,
    onSelectItem,
    currency = 'XOF'
}) => {
    const { t } = useTranslation('common');

    return (
        <div className="bg-white rounded-3xl shadow-sm flex-1 p-6 h-[710px] flex flex-col border border-gray-100">
            {/* Categories Capsule Bar matching Reference Design */}
            <div className="bg-[#f0f0f4] rounded-full flex items-center justify-between p-1.5 mb-7 w-full max-w-4xl mx-auto overflow-x-auto hide-scrollbar gap-1.5 shadow-inner">
                {categories.map(category => {
                    const isSelected = String(selectedCategoryId) === String(category.id);
                    const emoji = category.emozi || category.emoji || category.Emozi || '';
                    const label = category.name || category.label || category.Name || '';

                    return (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() => onSelectCategory?.(category.id)}
                            className={`flex-1 py-2.5 px-4 text-sm font-manrope font-semibold rounded-full transition-all duration-200 whitespace-nowrap flex items-center justify-center gap-1.5 ${
                                isSelected
                                    ? 'bg-white shadow-sm text-gray-900'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/40'
                            }`}
                        >
                            {emoji && <span className="text-base leading-none">{emoji}</span>}
                            <span>{label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Drink Items 5-Column Grid */}
            <div className="flex-1 overflow-y-auto hide-scrollbar">
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pr-1">
                        {Array.from({ length: 15 }).map((_, idx) => (
                            <div 
                                key={idx} 
                                className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center justify-center h-[180px] animate-pulse"
                                style={{ boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)' }}
                            >
                                <div className="w-16 h-16 bg-gray-200 rounded-lg mb-3"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 font-manrope">
                        <span className="text-4xl mb-2">🍹</span>
                        <p className="text-sm font-medium">{t('bar.noDrinkItems', 'No drink items available for this category.')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pr-1">
                        {items.map((item, index) => {
                            const keyId = item.Items_id || item._id || item.id || index;
                            return (
                                <DrinkItemCard
                                    key={keyId}
                                    item={item}
                                    onSelect={onSelectItem}
                                    currency={currency}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BarLeftPanel;

