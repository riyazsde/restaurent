import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { IMAGE_BASE_URL } from '../../../services/fileUploadService';
import { useRestaurant } from '../../../hooks/queries/usePos';
import { resolveCurrencySymbol } from '../../../utils/currencyUtils';

const MenuItemCard = ({ item, onEdit, onDelete, onToggleStatus }) => {
    const { t } = useTranslation('settings');
    const { data: restaurantData } = useRestaurant();
    const currency = resolveCurrencySymbol(restaurantData?.currency) || 'XOF';

    const getImageUrl = (imageTail) => {
        if (!imageTail) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80';
        if (imageTail.startsWith('http')) return imageTail;
        return `${IMAGE_BASE_URL}${imageTail}`;
    };

    const displayName = item['item-name'] || item.Title || item.name || 'Menu Item';
    const rawPrice = item['item-price'] ?? item.Price ?? item.price ?? 0;
    const formattedPrice = Number(rawPrice).toLocaleString();
    const categoryName = item.Category?.Name || item.category || t('menuItems.meal', 'Meal');
    const variantCount = item.VariantsData?.length 
        || item.Variants?.length 
        || item.item_Variants?.length 
        || (Array.isArray(item.variants) ? item.variants.length : 0);

    return (
        <div className="p-[1.5px] rounded-[20px] bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] font-poppins shadow-sm w-full h-full transition-transform hover:-translate-y-0.5 duration-150">
            <div 
                className={`flex items-center justify-between gap-4 p-4 sm:p-5 rounded-[18.5px] h-full w-full ${
                    item.Status !== false
                        ? 'bg-white' 
                        : 'bg-gradient-to-b from-[rgba(106,27,154,0.06)] to-[rgba(211,47,47,0.06)] opacity-75'
                }`}
            >
                {/* Left: Avatar & Info */}
                <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 shadow-sm border border-gray-100">
                        <img
                            src={getImageUrl(item.image)}
                            alt={displayName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80';
                            }}
                        />
                    </div>

                    <div className="flex flex-col min-w-0">
                        <h3 className="text-black font-semibold text-sm sm:text-base truncate leading-snug">
                            {displayName}
                        </h3>
                        <p className="text-black font-semibold text-sm sm:text-base mt-0.5 leading-snug">
                            {formattedPrice} {currency}
                        </p>
                        <p className="text-gray-500 text-xs sm:text-sm mt-0.5 truncate leading-snug">
                            {categoryName}
                        </p>
                        {variantCount > 0 && (
                            <p className="text-gray-400 text-xs mt-0.5 leading-snug">
                                {variantCount} {variantCount === 1 ? t('menuItems.variant', 'Variant') : t('menuItems.variants', 'Variants')}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <button 
                        type="button"
                        onClick={() => onToggleStatus(item)} 
                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                        title={item.Status !== false ? t('menuItems.hideItem', 'Hide Item') : t('menuItems.showItem', 'Show Item')}
                    >
                        {item.Status !== false ? (
                            <FaEye className="text-black text-base sm:text-lg" />
                        ) : (
                            <FaEyeSlash className="text-gray-400 text-base sm:text-lg" />
                        )}
                    </button>
                    <button 
                        type="button"
                        onClick={() => onEdit(item)}
                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                        title={t('menuItems.editItem', 'Edit Item')}
                    >
                        <FiEdit className="text-black text-base sm:text-lg" />
                    </button>
                    <button 
                        type="button"
                        onClick={() => onDelete(item)}
                        className="p-1.5 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
                        title={t('menuItems.deleteItem', 'Delete Item')}
                    >
                        <FiTrash2 className="text-[#D32F2F] text-base sm:text-lg" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MenuItemCard;
