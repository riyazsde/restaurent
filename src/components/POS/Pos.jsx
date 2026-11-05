import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, QrCode, FileText, Armchair, LayoutGrid, Search, AlertCircle, RefreshCw } from 'lucide-react';

// Custom Hooks & Utils
import { useDragScroll } from './hooks/useDragScroll';
import { usePosWorkflow } from './hooks/usePosWorkflow';
import { getImageUrl, formatCurrency } from './utils/posHelpers';
import { useSearchStore } from '../../store/searchStore';

// Subcomponents & Modals
import RightPanelAll from './RightPanelAll';
import SegmentedTab from '../common/SegmentedTab';
import GradientOutlineButton from '../common/GradientOutlineButton';
import QRMenuOrdersModal from './modals/QRMenuOrdersModal';
import NotesListModal from './modals/NotesListModal';

const POS = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation('pos');
    const pos = usePosWorkflow();
    const categoryScrollRef = useRef(null);
    useDragScroll(categoryScrollRef);
    const { searchQuery, setSearchQuery, setSearchPlaceholder } = useSearchStore();

    useEffect(() => {
        setSearchPlaceholder(t('searchDishes', 'Search Dishes'));
        return () => setSearchPlaceholder('');
    }, [setSearchPlaceholder, t]);

    useEffect(() => {
        if (searchQuery !== undefined && searchQuery !== pos.itemSearchTerm) {
            pos.handleItemSearch(searchQuery);
        }
    }, [searchQuery]);

    // Initial Loading Skeleton State
    if (pos.isInitialLoading) {
        return (
            <div className="p-4 sm:p-6 font-[Poppins] max-w-[100vw] overflow-x-hidden animate-pulse">
                {/* Header Skeleton */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
                </div>

                {/* Main Content Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                    {/* Left Panel Skeleton */}
                    <div className="lg:col-span-2 relative p-[1.5px] rounded-[28px] bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F]">
                        <div className="bg-white rounded-[26.5px] p-5 sm:p-6 h-full flex flex-col">
                            <div className="flex flex-col sm:flex-row gap-3 mb-6 items-start sm:items-center justify-between">
                                <div className="flex gap-2.5">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-10 w-24 bg-gray-200 rounded-xl"></div>
                                    ))}
                                </div>
                                <div className="h-10 w-full sm:w-64 bg-gray-200 rounded-xl"></div>
                            </div>

                            {/* Items Grid Skeleton */}
                            <div className="h-[500px] sm:h-[620px]">
                                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                        <div key={i} className="bg-white border border-gray-900 rounded-[22px] overflow-hidden shadow-sm">
                                            <div className="w-full h-[145px] sm:h-[155px] bg-gray-200"></div>
                                            <div className="p-3.5 sm:p-4">
                                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel Skeleton */}
                    <div className="lg:col-span-1 border border-pink-100 rounded-2xl p-4 flex flex-col gap-4">
                        <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                        <div className="h-10 bg-gray-200 rounded-lg w-full mb-4"></div>

                        <div className="flex-1 bg-gray-50 rounded-lg flex flex-col items-center justify-center min-h-[400px]">
                            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-48"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <div className="h-10 bg-gray-200 rounded-lg"></div>
                            <div className="h-10 bg-gray-200 rounded-lg"></div>
                        </div>
                        <div className="h-12 bg-gray-200 rounded-lg w-full mt-2"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 font-[Poppins] max-w-[100vw] overflow-x-hidden">
            {/* Top Bar with Title, Language Selector, Actions, and Food/Bar Segmented Tab */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-5 gap-3">
                <div className="flex items-center gap-3">
                    <h1 style={{ fontFamily: 'Manrope' }} className="text-[22px] sm:text-[26px] font-bold text-gray-900 tracking-tight whitespace-nowrap">
                        {t('posTitle', 'POS - Point of Sales')}
                    </h1>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <GradientOutlineButton
                        variant="solid"
                        onClick={() => navigate('/dashboard/menuitems/create', { state: { from: '/dashboard/pos' } })}
                        icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
                    >
                        {t('new', 'New')}
                    </GradientOutlineButton>

                    <GradientOutlineButton
                        variant="subtle"
                        onClick={() => pos.setIsQrMenuOrdersOpen(true)}
                        icon={<QrCode className="w-4 h-4 text-gray-800" />}
                    >
                        {t('qrMenuOrders', 'QR Menu Orders')}
                    </GradientOutlineButton>

                    <GradientOutlineButton
                        variant="subtle"
                        onClick={() => pos.setIsNotesListOpen(true)}
                        icon={<FileText className="w-4 h-4 text-gray-800" />}
                    >
                        {t('notesList', 'Notes List')}
                    </GradientOutlineButton>

                    <GradientOutlineButton
                        variant="subtle"
                        onClick={() => navigate('/dashboard/tables')}
                        icon={<Armchair className="w-4 h-4 text-gray-800" />}
                    >
                        {t('tableOrders', 'Table Orders')}
                    </GradientOutlineButton>

                    <SegmentedTab
                        tabs={[
                            { id: 'Food', label: t('food', 'Food') },
                            { id: 'Bar', label: t('bar', 'Bar') }
                        ]}
                        activeTab={pos.posType}
                        onTabChange={(tabId) => {
                            pos.setPosType(tabId);
                            pos.setSelectedTab(tabId);
                            if (tabId === 'Bar') {
                                navigate('/dashboard/bar');
                            }
                        }}
                    />
                </div>
            </div>

            {/* Main POS Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Panel: Categories, Search, Dish Cards with Figma Gradient Border */}
                <div className="lg:col-span-2 relative self-start p-[1.5px] rounded-[28px] bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] shadow-sm">
                    <div className="bg-white rounded-[26.5px] p-5 sm:p-6 flex flex-col">
                        {/* Top Controls Row: Categories + Search + Grid Toggle */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-center justify-between w-full">
                            {/* Horizontal Categories Scroll Container */}
                            <div
                                ref={categoryScrollRef}
                                className="flex items-center gap-2.5 overflow-x-auto hide-scrollbar flex-shrink-0 max-w-full sm:max-w-[55%]"
                            >
                                {pos.categories.map((category) => {
                                    const isSelected = pos.selectedCategory === category.name;
                                    const categoryLabel = category.name === 'All' ? t('all', 'All') : category.name;
                                    return (
                                        <button
                                            key={category.id || category.name}
                                            onClick={() => pos.handleCategorySelect(category)}
                                            style={isSelected ? {
                                                background: 'linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)'
                                            } : undefined}
                                            className={`px-7 py-2.5 rounded-full font-medium text-[15px] font-manrope whitespace-nowrap transition-all flex items-center justify-center flex-shrink-0 ${
                                                isSelected
                                                    ? 'text-white shadow-sm'
                                                    : 'bg-[#FAEFF5] text-gray-900 font-semibold hover:bg-[#F3E2ED]'
                                            }`}
                                        >
                                            {categoryLabel}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Search Dishes Input & View Mode Toggle */}
                            <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
                                <div className="relative flex items-center flex-1 bg-[#FAEFF5] rounded-2xl px-4 py-2.5">
                                    <Search className="text-gray-900 w-4 h-4 mr-2.5 flex-shrink-0 stroke-[2.5]" />
                                    <input
                                        type="text"
                                        placeholder={t('searchDishes', 'Search Dishes')}
                                        value={pos.itemSearchTerm}
                                        onChange={(e) => {
                                            pos.handleItemSearch(e.target.value);
                                            setSearchQuery(e.target.value);
                                        }}
                                        className="w-full bg-transparent text-[15px] font-medium text-gray-900 placeholder:text-gray-900 placeholder:font-medium focus:outline-none"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => pos.setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
                                    className="flex-shrink-0 w-[44px] h-[44px] flex items-center justify-center bg-[#FAEFF5] hover:bg-[#F3E2ED] transition-colors rounded-2xl text-gray-900"
                                    title={pos.viewMode === 'grid' ? t('switchTo2Col', 'Switch to 2-Column View') : t('switchToGrid', 'Switch to Grid View')}
                                >
                                    <LayoutGrid className="w-5 h-5 text-gray-900" />
                                </button>
                            </div>
                        </div>

                        {/* Dish Cards Display Area */}
                        <div className="overflow-y-auto max-h-[640px] xl:max-h-[720px] pr-1">
                            {pos.registerLoadError && pos.filteredItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                                    <AlertCircle className="w-10 h-10 text-amber-600 mb-3" aria-hidden="true" />
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        {pos.hasRegisterPermissionError
                                            ? t('registerPermissionTitle', 'You do not have permission to load the register')
                                            : t('registerLoadErrorTitle', 'Unable to load the register')}
                                    </h2>
                                    <p className="mt-2 max-w-md text-sm text-gray-600">
                                        {pos.hasRegisterPermissionError
                                            ? t('registerPermissionMessage', 'Your account may not have access to the register data. Check your access or contact an administrator.')
                                            : t('registerLoadErrorMessage', 'The menu could not be loaded. Check your connection and try again.')}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={pos.retryRegisterLoad}
                                        disabled={pos.isRetryingRegisterLoad}
                                        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-purple-800 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-900 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <RefreshCw className={`h-4 w-4 ${pos.isRetryingRegisterLoad ? 'animate-spin' : ''}`} aria-hidden="true" />
                                        {pos.isRetryingRegisterLoad
                                            ? t('retrying', 'Retrying...')
                                            : t('retry', 'Try again')}
                                    </button>
                                </div>
                            ) : !pos.restaurantObj ? (
                                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                                    <AlertCircle className="w-10 h-10 text-amber-600 mb-3" aria-hidden="true" />
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        {t('restaurantSetupTitle', 'Restaurant setup is incomplete')}
                                    </h2>
                                    <p className="mt-2 max-w-md text-sm text-gray-600">
                                        {t('restaurantSetupMessage', 'Complete your restaurant profile before opening the register.')}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/dashboard/settings')}
                                        className="mt-5 rounded-lg bg-purple-800 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-900"
                                    >
                                        {t('openSettings', 'Open settings')}
                                    </button>
                                </div>
                            ) : !pos.hasMenuItems ? (
                                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                                    <AlertCircle className="w-10 h-10 text-amber-600 mb-3" aria-hidden="true" />
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        {t('menuSetupTitle', 'No menu items are available')}
                                    </h2>
                                    <p className="mt-2 max-w-md text-sm text-gray-600">
                                        {t('menuSetupMessage', 'Add active menu items to start creating orders in the register.')}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/dashboard/menuitems/create', { state: { from: '/dashboard/pos' } })}
                                        className="mt-5 rounded-lg bg-purple-800 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-900"
                                    >
                                        {t('addMenuItem', 'Add menu item')}
                                    </button>
                                </div>
                            ) : pos.filteredItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                    <p className="text-base font-medium">{t('noSearchResults', 'No dishes found')}</p>
                                </div>
                            ) : (
                                <div className={
                                    pos.viewMode === 'grid'
                                        ? "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
                                        : "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5"
                                }>
                                    {pos.filteredItems.map((item, index) => {
                                        const itemName = item.Title || item['item-name'] || item.name || 'Dish';
                                        const rawPrice = item.Price ?? item['item-price'] ?? item.price ?? 3000;
                                        const fallbackImage = "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80";

                                        if (pos.viewMode === 'grid') {
                                            return (
                                                <div
                                                    key={item.Items_id || item.id || `dish-grid-${index}`}
                                                    onClick={() => pos.handleItemClick(item)}
                                                    className="bg-white border border-gray-900 rounded-[22px] overflow-hidden flex flex-col hover:shadow-md transition-all duration-200 cursor-pointer group"
                                                >
                                                    <div className="w-full h-[140px] sm:h-[155px] bg-[#fbf5f7] overflow-hidden">
                                                        <img
                                                            src={getImageUrl(item.image) || fallbackImage}
                                                            alt={itemName}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = fallbackImage;
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="p-3.5 sm:p-4 bg-white flex flex-col justify-between flex-grow rounded-b-[21px]">
                                                        <h4 className="text-[15px] sm:text-[16px] font-medium font-manrope text-gray-900 truncate leading-snug">
                                                            {itemName}
                                                        </h4>
                                                        <p className="text-[14px] sm:text-[15px] text-[#A82D6E] font-semibold font-manrope mt-1.5">
                                                            {formatCurrency(rawPrice, pos.currency)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // 2-Column Horizontal Card View on Toggle (Matching Figma Prototype)
                                        const variantCount = Array.isArray(item.Variants) && item.Variants.length > 0
                                            ? item.Variants.length
                                            : (Array.isArray(item.variants) && item.variants.length > 0 ? item.variants.length : 2);
                                        const addonCount = Array.isArray(item.Addons) && item.Addons.length > 0
                                            ? item.Addons.length
                                            : (Array.isArray(item.addons) && item.addons.length > 0 ? item.addons.length : 4);
                                        const itemDesc = item.Description || item.Details || item['item-description'] || item.description || `Lorem ${itemName} ${itemName}.......`;

                                        return (
                                            <div
                                                onClick={() => pos.handleItemClick(item)}
                                                key={item.Items_id || item.id || `dish-list-${index}`}
                                                className="bg-white border border-gray-900 rounded-[22px] overflow-hidden flex hover:shadow-md transition-all duration-200 cursor-pointer group min-h-[145px] sm:min-h-[155px]"
                                            >
                                                {/* Left Side: Dish Image */}
                                                <div className="w-[110px] sm:w-[120px] flex-shrink-0 relative overflow-hidden bg-[#fbf5f7] border-r border-gray-900">
                                                    <img
                                                        src={getImageUrl(item.image) || fallbackImage}
                                                        alt={itemName}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = fallbackImage;
                                                        }}
                                                    />
                                                </div>

                                                {/* Right Side: Details & Actions */}
                                                <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between overflow-hidden">
                                                    <div>
                                                        <h4 className="text-[14px] sm:text-[15px] font-semibold font-manrope text-[#1E1E1E] truncate leading-tight">
                                                            {itemName}
                                                        </h4>
                                                        <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 leading-snug">
                                                            {itemDesc}
                                                        </p>
                                                    </div>

                                                    <div className="mt-2">
                                                        <p className="text-[14px] sm:text-[15px] font-bold font-manrope text-[#A82D6E]">
                                                            {formatCurrency(rawPrice, pos.currency)}
                                                        </p>

                                                        <div className="flex items-center justify-between gap-1 mt-1">
                                                            <div className="text-[9.5px] sm:text-[10.5px] text-gray-800 font-medium whitespace-nowrap flex items-center gap-1 sm:gap-1.5 overflow-hidden">
                                                                <span>{variantCount} {t('variants', 'Variants')}</span>
                                                                <span>{addonCount} {i18n?.language?.startsWith('fr') ? 'Supp.' : t('addons', 'Addons')}</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    pos.handleItemClick(item);
                                                                }}
                                                                className="flex-shrink-0 bg-[linear-gradient(180deg,_#6A1B9A_0%,_#D32F2F_100%)] text-white text-xs font-semibold px-3 sm:px-3.5 py-1 rounded-lg shadow-sm hover:opacity-90 transition-opacity"
                                                            >
                                                                {t('add', 'Add')}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="lg:col-span-1">
                    <RightPanelAll
                        selectedDining={pos.selectedDining}
                        onDiningTypeSelect={pos.setSelectedDining}
                        onDropdownToggle={pos.handleDropdownToggle}
                        showBoxes={pos.showBoxes}
                        setShowBoxes={pos.setShowBoxes}
                        cartItems={pos.cartItems}
                        setCartItems={pos.setCartItems}
                        selectedCustomer={pos.selectedCustomer}
                        setSelectedCustomer={pos.setSelectedCustomer}
                        customers={pos.filteredCustomers}
                        customerSearchTerm={pos.customerSearchTerm}
                        setCustomerSearchTerm={pos.setCustomerSearchTerm}
                        showCustomerDropdown={pos.showCustomerDropdown}
                        setShowCustomerDropdown={pos.setShowCustomerDropdown}
                        customerDropdownRef={pos.customerDropdownRef}
                        diningOption={pos.diningOption}
                        handleDiningOptionSelect={pos.handleDiningOptionSelect}
                        selectedTable={pos.selectedTable}
                        selectedSlot={pos.selectedSlot}
                        setSelectedSlot={pos.setSelectedSlot}
                        tables={pos.tables}
                        floors={pos.floors}
                        showTableSelection={pos.showTableSelection}
                        setShowTableSelection={pos.setShowTableSelection}
                        handleTableSelect={pos.handleTableSelect}
                        updateCartItemQuantity={pos.updateCartItemQuantity}
                        removeFromCart={pos.removeFromCart}
                        subTotal={pos.subTotal}
                        taxAmount={pos.taxAmount}
                        taxRate={pos.taxRate}
                        total={pos.total}
                        handleSendToKitchen={pos.handleSendToKitchen}
                        isSubmitting={pos.isSubmitting}
                        getImageUrl={getImageUrl}
                        handleCreateCustomer={pos.handleCreateCustomer}
                        handleUpdateCustomer={pos.handleUpdateCustomer}
                        onCustomerCreated={(newCust) => {
                            pos.setSelectedCustomer(newCust);
                        }}
                        onCustomerUpdated={(updatedCust) => {
                            pos.setSelectedCustomer(updatedCust);
                        }}
                        currency={pos.currency}
                        restaurantData={pos.restaurantObj || pos.restaurantData}
                    />
                </div>
            </div>

            {/* Variant / Addon Selection Modal */}
            {pos.isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg w-[95%] sm:w-[600px] relative px-4 sm:px-6 py-6">
                        <button
                            className="absolute top-3 right-3 text-gray-700 text-xl font-bold"
                            onClick={() => {
                                pos.setIsModalOpen(false);
                                pos.setSelectedItem(null);
                            }}
                        >
                            ×
                        </button>
                        <h2
                            style={{ fontFamily: 'Manrope' }}
                            className="text-[24px] sm:text-[29px] font-semibold text-center mb-6"
                        >
                            {t('selectVariantsAddons', 'Select the variants & Addons')}
                        </h2>
                        {pos.isLoadingItemDetails ? (
                            <div className="flex items-center justify-center py-8">
                                <p className="text-gray-500">{t('loadingOptions', 'Loading options...')}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <h3
                                        style={{ fontFamily: 'Manrope' }}
                                        className="text-[22px] sm:text-[27px] font-bold mb-2"
                                    >
                                        {t('variants', 'Variants')}
                                    </h3>
                                    <div className="space-y-2">
                                        {pos.availableVariants.length > 0 ? (
                                            pos.availableVariants.map((variant) => (
                                                <label key={variant.item_map_Variants_id} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="mr-2 text-[14px] sm:text-[16px]"
                                                        checked={pos.selectedVariant === variant.item_Variants_id?.item_Variants_id}
                                                        onChange={() => pos.setSelectedVariant(
                                                            pos.selectedVariant === variant.item_Variants_id?.item_Variants_id
                                                                ? null
                                                                : variant.item_Variants_id?.item_Variants_id
                                                        )}
                                                    />
                                                    {variant.item_Variants_id?.Variants} (+{formatCurrency(variant.Item_prices, pos.currency)})
                                                </label>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500">{t('noVariants', 'No variants available')}</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h3
                                        style={{ fontFamily: 'Manrope' }}
                                        className="font-bold text-[22px] sm:text-[27px] mb-2"
                                    >
                                        {t('addons', 'Addons')}
                                    </h3>
                                    <div className="space-y-2">
                                        {pos.availableAddons.length > 0 ? (
                                            pos.availableAddons.map((addon) => (
                                                <label key={addon.item_map_Addons_id} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="mr-2 text-[14px] sm:text-[16px]"
                                                        checked={pos.selectedAddon === addon.item_Addons_id?.item_Addons_id}
                                                        onChange={() => pos.setSelectedAddon(
                                                            pos.selectedAddon === addon.item_Addons_id?.item_Addons_id
                                                                ? null
                                                                : addon.item_Addons_id?.item_Addons_id
                                                        )}
                                                    />
                                                    {addon.item_Addons_id?.Addons} (+{formatCurrency(addon.Item_prices, pos.currency)})
                                                </label>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500">{t('noAddons', 'No addons available')}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="mt-6 flex justify-center">
                            <button
                                style={{
                                    background: 'linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)',
                                }}
                                onClick={pos.handleAddToCart}
                                className="text-white text-[18px] sm:text-[20px] font-medium px-8 sm:px-12 py-2 rounded-md"
                            >
                                {t('save', 'Save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* QR Menu Orders Modal */}
            <QRMenuOrdersModal
                isOpen={pos.isQrMenuOrdersOpen}
                onClose={() => pos.setIsQrMenuOrdersOpen(false)}
                currency={pos.currency}
                onLoadOrder={(order) => {
                    const original = order.originalOrder || order;
                    if (original.Customer) {
                        pos.setSelectedCustomer(original.Customer);
                    }
                    if (original.Table) {
                        const rawTableId = original.Table.table_id?.Table_id || original.Table.Table_id || original.Table.table_id || original.Table.id;
                        const matchedTable = Array.isArray(pos.tables)
                            ? pos.tables.find((t) => {
                                const tId = t?.table_id?.Table_id || t?.Table_id || t?.table_id || t?.id;
                                return tId && rawTableId && String(tId) === String(rawTableId);
                            })
                            : null;
                        pos.setSelectedTable(
                            matchedTable || {
                                ...original.Table,
                                Table_id: rawTableId,
                                table_id: typeof original.Table.table_id === 'object' && original.Table.table_id !== null
                                    ? original.Table.table_id
                                    : {
                                        Table_id: rawTableId,
                                        'Table-code': original.Table.table_name || original.Table['Table-code'] || `Table ${original.Table.Table_No || rawTableId || ''}`.trim(),
                                        'Table-name': original.Table.table_name || original.Table['Table-name'] || `Table ${original.Table.Table_No || rawTableId || ''}`.trim()
                                    }
                            }
                        );
                    }
                    if (original.Dining_Option) {
                        pos.setDiningOption(original.Dining_Option);
                    }
                    if (Array.isArray(original.items) && original.items.length > 0) {
                        const loadedCart = original.items.map((it, idx) => {
                            const rawDetails = it.Item || it.itemDetails || it;
                            const resolvedName = rawDetails?.['item-name'] || rawDetails?.item_name || rawDetails?.Title || rawDetails?.Name || rawDetails?.name || it.item_name || it['item-name'] || 'Dish';
                            const resolvedPrice = Number(rawDetails?.Price ?? rawDetails?.['item-price'] ?? rawDetails?.prices ?? rawDetails?.price ?? it.Price ?? it['item-price'] ?? it.prices ?? it.price ?? 0);

                            return {
                                item_id: it.item_id || it.Items_id || it.Item?.Items_id || it.Item?.item_id || idx + 1,
                                item_Quentry: it.item_Quentry || it.quantity || 1,
                                item_size: it.item_size || rawDetails?.['item-size'] || rawDetails?.size || '',
                                item_status: it.item_status || 'Preparing',
                                item_Variants_id: it.item_Variants_id || null,
                                item_Addons_id: it.item_Addons_id || null,
                                itemDetails: {
                                    ...rawDetails,
                                    'item-name': resolvedName,
                                    item_name: resolvedName,
                                    Title: resolvedName,
                                    Name: resolvedName,
                                    Price: resolvedPrice,
                                    'item-price': resolvedPrice,
                                    prices: resolvedPrice,
                                    price: resolvedPrice
                                },
                                cartId: Date.now() + idx
                            };
                        });
                        pos.setCartItems(loadedCart);
                        pos.setShowBoxes(true);
                        pos.setShowBoxes3(true);
                    }
                    pos.setIsQrMenuOrdersOpen(false);
                }}
            />

            {/* Notes List Modal */}
            <NotesListModal
                isOpen={pos.isNotesListOpen}
                onClose={() => pos.setIsNotesListOpen(false)}
                activeTableId={pos.selectedTable?.table_id?.Table_id || pos.selectedTable?.table_number || ''}
            />
        </div>
    );
};

export default POS;
