import React, { useState, useRef, useEffect, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { FiDownload, FiCalendar, FiChevronDown, FiMapPin, FiShoppingCart, FiBarChart2 } from "react-icons/fi";
import { UtensilsCrossed } from "lucide-react";
import reportsService from '../../services/reportsService';
import { useRestaurant } from '../../hooks/queries/usePos';
import { resolveCurrencySymbol } from '../../utils/currencyUtils';

// Local food image assets for crisp rendering matching Figma
import pizzaImg from '../assets/pizza.png';
import burgerImg from '../assets/food.jpg';
import pastaImg from '../assets/food1.jpg';
import coffeeImg from '../assets/food2.jpg';

const EMPTY_DISPLAY = '—';

export default function ReportsSection() {
  const { t, i18n } = useTranslation('reports');
  const { data: restaurantData } = useRestaurant();
  const [selected, setSelected] = useState("Today");
  const [openPeriodDropdown, setOpenPeriodDropdown] = useState(false);
  const periodDropdownRef = useRef(null);

  // Filter dropdown states
  const [selectedBranch, setSelectedBranch] = useState("All Branches");
  const [selectedChannel, setSelectedChannel] = useState("All Channels");
  const [selectedService, setSelectedService] = useState("All Services");

  const [openBranch, setOpenBranch] = useState(false);
  const [openChannel, setOpenChannel] = useState(false);
  const [openService, setOpenService] = useState(false);

  const branchRef = useRef(null);
  const channelRef = useRef(null);
  const serviceRef = useRef(null);

  // Date range picker state (ISO strings or null)
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const dateRef = useRef(null);

  const options = [
    { value: "Today", label: t('periods.today', 'Today') },
    { value: "This Month", label: t('periods.thisMonth', 'This Month') },
    { value: "Six Month", label: t('periods.sixMonth', 'Six Month') },
    { value: "One Year", label: t('periods.oneYear', 'One Year') }
  ];

  // Helper to format an amount; returns EMPTY_DISPLAY when the value is not a finite number
  const formatReportPrice = (amount) => {
    const num = Number(amount);
    if (!Number.isFinite(num)) return EMPTY_DISPLAY;

    const isEn = i18n?.language?.startsWith('en');
    const sym = resolveCurrencySymbol(restaurantData?.currency);
    const isWhole = Number.isInteger(num);
    const formatted = isEn
      ? num.toLocaleString('en-US', {
          minimumFractionDigits: isWhole ? 0 : 2,
          maximumFractionDigits: 2
        })
      : num.toLocaleString('fr-FR', {
          minimumFractionDigits: isWhole ? 0 : 2,
          maximumFractionDigits: 2
        }).replace(/\u202f/g, ' ');

    if (sym === '$') {
      return `$${formatted}`;
    }
    return `${formatted} ${sym}`;
  };

  // Plain number formatter (no currency) with safe empty state
  const formatPlainNumber = (value, opts = {}) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return EMPTY_DISPLAY;
    const isEn = i18n?.language?.startsWith('en');
    return num.toLocaleString(isEn ? 'en-US' : 'fr-FR', opts);
  };

  // TanStack Query — refetches when period OR custom date range changes
  const { data: reportData, isLoading, isError, error } = useQuery({
    queryKey: ['reports', selected, dateRange.start, dateRange.end],
    queryFn: async () => {
      const response = await reportsService.getReportByPeriod(
        selected,
        null,
        dateRange.start,
        dateRange.end
      );
      if (!response || typeof response !== 'object') {
        throw new Error('Failed to fetch report');
      }
      return response;
    }
  });

  // Handle errors
  useEffect(() => {
    if (isError && error) {
      toast.error(error.message || t('messages.fetchError', 'Failed to fetch report data'));
      console.error('Report fetch error:', error);
    }
  }, [isError, error, t]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (periodDropdownRef.current && !periodDropdownRef.current.contains(event.target)) {
        setOpenPeriodDropdown(false);
      }
      if (branchRef.current && !branchRef.current.contains(event.target)) {
        setOpenBranch(false);
      }
      if (channelRef.current && !channelRef.current.contains(event.target)) {
        setOpenChannel(false);
      }
      if (serviceRef.current && !serviceRef.current.contains(event.target)) {
        setOpenService(false);
      }
      if (dateRef.current && !dateRef.current.contains(event.target)) {
        setOpenDatePicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Top Sellers — only real data. No fabricated fallbacks.
  const topSellersList = useMemo(() => {
    const rawSellers = (reportData?.TopSellers || reportData?.topSellers || []).filter(
      item =>
        item?.item_name &&
        item.item_name !== 'Unknown' &&
        Number(item.total_quantity_sold) > 0
    );

    if (rawSellers.length === 0) return [];

    const foodImages = [pizzaImg, burgerImg, pastaImg, coffeeImg];
    const badges = [
      { label: "Pizza", color: "bg-[#F5EBFF] text-[#6A1B9A]" },
      { label: "Burgers", color: "bg-[#E6F4EA] text-[#137333]" },
      { label: "Pasta", color: "bg-[#FEF7E0] text-[#B06000]" },
      { label: "Beverages", color: "bg-[#E8F0FE] text-[#1967D2]" }
    ];

    const totalQty =
      rawSellers.reduce((sum, it) => sum + Number(it.total_quantity_sold || 0), 0) || 1;

    return rawSellers.slice(0, 4).map((item, idx) => {
      const plates = Number(item.total_quantity_sold || 0);
      const prog = Number(((plates / totalQty) * 100).toFixed(1));
      const badgeInfo = badges[idx % badges.length];

      return {
        name: item.item_name,
        desc: item.item_code || 'Best seller',
        badge: badgeInfo.label,
        badgeColor: badgeInfo.color,
        image: foodImages[idx % foodImages.length],
        plates,
        revXOF: item.item_price,
        revPct: prog,
        prog
      };
    });
  }, [reportData?.TopSellers, reportData?.topSellers]);

  // Payment data — respect real zero-value data
  const { paymentData, hasPaymentData } = useMemo(() => {
    const paymentMap = reportData?.payment || {};
    const entries = Object.entries(paymentMap);

    if (entries.length === 0) {
      return { paymentData: [], hasPaymentData: false };
    }

    const colorConfig = {
      card: { color: "#CBA3D8", textColor: "#3B1E48", labelKey: "paymentMethods.card", defaultName: "Card" },
      cash: { color: "#F6E9EB", textColor: "#1F2937", labelKey: "paymentMethods.cash", defaultName: "Cash" },
      "apple pay": { color: "#D5869D", textColor: "#FFFFFF", labelKey: "paymentMethods.applePay", defaultName: "Apple pay" },
      "g pay": { color: "#B93856", textColor: "#FFFFFF", labelKey: "paymentMethods.gPay", defaultName: "G pay" },
      "gift coupon": { color: "#6A1B9A", textColor: "#FFFFFF", labelKey: "paymentMethods.giftCoupon", defaultName: "Gift Coupons" },
      "gift coupons": { color: "#6A1B9A", textColor: "#FFFFFF", labelKey: "paymentMethods.giftCoupons", defaultName: "Gift Coupons" }
    };

    const mapped = entries.map(([rawKey, val]) => {
      const lower = rawKey.toLowerCase().trim();
      const conf = colorConfig[lower] || {
        color: "#999999",
        textColor: "#FFFFFF",
        labelKey: null,
        defaultName: rawKey
      };
      const displayName = conf.labelKey ? t(conf.labelKey, conf.defaultName) : conf.defaultName;
      return {
        name: displayName,
        value: Number(val) || 0,
        color: conf.color,
        textColor: conf.textColor
      };
    });

    const withValues = mapped.filter(i => i.value > 0);

    return {
      paymentData: withValues.length > 0 ? withValues : mapped,
      hasPaymentData: mapped.some(i => i.value > 0)
    };
  }, [reportData?.payment, t]);

  // Legend items on the right of Payments
  const legendItems = [
    { name: t('paymentMethods.card', 'Card'), color: "#CBA3D8" },
    { name: t('paymentMethods.cash', 'Cash'), color: "#F6E9EB" },
    { name: t('paymentMethods.applePay', 'Apple Pay'), color: "#D5869D" },
    { name: t('paymentMethods.gPay', 'G Pay'), color: "#B93856" },
    { name: t('paymentMethods.giftCoupon', 'Gift Coupon'), color: "#6A1B9A" },
  ];

  // Custom inside-slice label
  const renderCustomizedPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value, textColor }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.58;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill={textColor || "#FFFFFF"}
        textAnchor="middle"
        dominantBaseline="central"
        className="pointer-events-none select-none"
      >
        <tspan x={x} dy="-0.45em" fontSize="11" fontWeight="700">
          {name}
        </tspan>
        <tspan x={x} dy="1.25em" fontSize="10" fontWeight="500">
          {typeof value === 'number' ? value.toFixed(2) : value}
        </tspan>
      </text>
    );
  };

  // Stat cards — no fabricated values
  const metrics = [
    {
      label: t('metrics.totalOrders', 'Total Orders'),
      value: formatPlainNumber(reportData?.totalOrders ?? reportData?.TotalOrders)
    },
    {
      label: t('metrics.avgOrderValue', 'Avg Order Value'),
      value: formatReportPrice(reportData?.avgOrderValue ?? reportData?.AvgOrderValue)
    },
    {
      label: t('metrics.voids', 'Voids'),
      value: formatReportPrice(reportData?.voids ?? reportData?.Voids)
    },
    {
      label: t('metrics.refunds', 'Refunds'),
      value: formatReportPrice(reportData?.refunds ?? reportData?.Refunds)
    },
    {
      label: t('metrics.totalCustomer', 'Total Customer'),
      value: formatPlainNumber(
        reportData?.totalCustomers ??
          (Number(reportData?.newCustomers || 0) + Number(reportData?.repeatCustomers || 0) || undefined)
      )
    },
    {
      label: t('metrics.newCustomer', 'New Customer'),
      value: formatPlainNumber(reportData?.newCustomers ?? reportData?.NewCustomers)
    },
    {
      label: t('metrics.repeatCustomer', 'Repeat Customer'),
      value: formatPlainNumber(reportData?.repeatCustomers ?? reportData?.RepeatCustomers)
    },
    {
      label: t('metrics.totalCustomer', 'Total Customer'),
      value: formatPlainNumber(reportData?.totalCustomerOverall ?? reportData?.TotalCustomerOverall)
    },
    {
      label: t('metrics.netSales', 'Net Sales'),
      value: formatReportPrice(reportData?.netSales ?? reportData?.TotalSales)
    },
    {
      label: t('metrics.grossSales', 'Gross Sales'),
      value: formatReportPrice(reportData?.grossSales ?? reportData?.GrossSales)
    },
    {
      label: t('metrics.tax', 'Tax'),
      value: formatReportPrice(reportData?.tax ?? reportData?.Tax)
    }
  ];

  // CSV Export
  const handleExport = () => {
    try {
      const itemsToExport = topSellersList;
      if (itemsToExport.length === 0) {
        toast.info(t('messages.nothingToExport', 'No data available to export'));
        return;
      }
      const csvHeader = "Item,Category,Plates Sold,Revenue,Share\n";
      const csvRows = itemsToExport
        .map(i => `"${i.name}","${i.badge}",${i.plates},"${i.revXOF ?? ''}","${i.prog}%"`)
        .join("\n");
      const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `top_sellers_${selected.toLowerCase().replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(t('messages.exportSuccess', 'Report exported successfully'));
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export report');
    }
  };

  // Shared Stat Card Component with gradient border
  const StatCard = ({ label, value }) => (
    <div className="p-[1.5px] rounded-[20px] bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] h-[105px]">
      <div className="bg-white rounded-[19px] p-5 h-full shadow-xs flex flex-col justify-center">
        <h3 className="text-[17px] sm:text-[19px] font-bold text-black leading-snug">
          {label}
        </h3>
        <p className="text-[20px] sm:text-[22px] font-semibold text-gray-900 mt-2">
          {value}
        </p>
      </div>
    </div>
  );

  // Date range display: user selection takes precedence over backend range
  const dateRangeDisplay = useMemo(() => {
    const src = dateRange.start && dateRange.end
      ? { start: dateRange.start, end: dateRange.end }
      : reportData?.dateRange;

    if (!src?.start || !src?.end) return EMPTY_DISPLAY;

    try {
      const s = new Date(src.start);
      const e = new Date(src.end);
      const loc = i18n?.language?.startsWith('fr') ? 'fr-FR' : 'en-US';
      const startStr = s.toLocaleDateString(loc, { month: 'short', day: 'numeric' });
      const endStr = e.toLocaleDateString(loc, { month: 'short', day: 'numeric', year: 'numeric' });
      return `${startStr} - ${endStr}`;
    } catch (err) {
      return EMPTY_DISPLAY;
    }
  }, [dateRange, reportData?.dateRange, i18n?.language]);

  // Skeleton Loader
  const ReportsSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
      <div className="lg:col-span-7 flex flex-col gap-6 min-w-0">
        <div className="p-[1.5px] rounded-[24px] bg-gray-200">
          <div className="bg-white rounded-[23px] p-6 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="h-7 bg-gray-200 rounded w-40 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-56"></div>
              </div>
              <div className="h-9 w-24 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-[1.5px] rounded-[24px] bg-gray-200">
          <div className="bg-white rounded-[23px] p-6 shadow-sm flex items-center justify-between min-h-[260px]">
            <div className="w-48 h-48 bg-gray-200 rounded-full mx-auto"></div>
            <div className="flex flex-col gap-3 w-40">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-5 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-5 grid grid-cols-2 gap-4 h-fit">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => (
          <div key={i} className="p-[1.5px] rounded-[20px] bg-gray-200 h-[105px]">
            <div className="bg-white rounded-[19px] p-5 h-full flex flex-col justify-center gap-3">
              <div className="h-5 bg-gray-200 rounded w-2/3"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-8 font-sans bg-[#F9FAFB] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-black leading-tight tracking-tight">
            {t('title', 'Reports')}
          </h1>
          <p className="text-gray-500 text-[18px] mt-1">
            {t('showingData', 'Showing Data\'s of {{period}}', {
              period: options.find(o => o.value === selected)?.label || selected
            })}
          </p>
        </div>

        <div className="relative mt-4 sm:mt-0" ref={periodDropdownRef}>
          <button
            onClick={() => setOpenPeriodDropdown(!openPeriodDropdown)}
            disabled={isLoading}
            className="flex items-center gap-3 px-5 py-2.5 rounded-[10px] text-[16px] font-medium bg-[#DDD6DE] text-black hover:bg-[#D0C8D2] transition-colors shadow-xs"
          >
            <span>{options.find(o => o.value === selected)?.label}</span>
            <FiChevronDown size={18} className={`transition-transform duration-200 ${openPeriodDropdown ? 'rotate-180' : ''}`} />
          </button>

          {openPeriodDropdown && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.12)] border border-gray-100 p-2 z-50">
              <div className="flex flex-col">
                {options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSelected(option.value);
                      setOpenPeriodDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-[15px] transition-colors ${
                      selected === option.value
                        ? 'font-bold text-[#6A1B9A] bg-[#F5EBFF]'
                        : 'text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <ReportsSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 flex flex-col gap-6 min-w-0">
            {/* TOP SELLERS */}
            <div className="p-[1.5px] rounded-[24px] bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F]">
              <div className="bg-white rounded-[23px] p-5 sm:p-6 shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-[22px] sm:text-[24px] font-bold text-black tracking-tight mb-0.5">
                      {t('topSellers', 'Top Sellers')}
                    </h2>
                    <p className="text-[13px] sm:text-[14px] text-gray-500">
                      {t('topSellersSubtitle', 'Best performing items by quantity sold')}
                    </p>
                  </div>
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-[#F5EBFF] text-[#6A1B9A] hover:bg-[#ECE0F9] px-4 py-2 rounded-lg text-sm font-semibold transition-colors self-start sm:self-auto"
                  >
                    <FiDownload size={16} />
                    <span>{t('export', 'Export')}</span>
                  </button>
                </div>

                {/* Filter Row */}
                <div className="flex flex-wrap items-center gap-2 mb-6 text-[11.5px] text-gray-700">
                  {/* Interactive Date Range Picker */}
                  <div className="relative" ref={dateRef}>
                    <button
                      onClick={() => setOpenDatePicker(!openDatePicker)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white shadow-xs font-medium hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                      <FiCalendar size={13} className="text-gray-500 flex-shrink-0" />
                      <span>{dateRangeDisplay}</span>
                      <FiChevronDown size={13} className={`text-gray-400 transition-transform duration-200 ${openDatePicker ? 'rotate-180' : ''}`} />
                    </button>

                    {openDatePicker && (
                      <div className="absolute left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 p-3 z-40 w-64">
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                          {t('filters.startDate', 'Start date')}
                        </label>
                        <input
                          type="date"
                          value={dateRange.start ? dateRange.start.slice(0, 10) : ''}
                          onChange={(e) =>
                            setDateRange({
                              ...dateRange,
                              start: e.target.value ? `${e.target.value}T00:00:00.000Z` : null
                            })
                          }
                          className="w-full mb-3 px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#6A1B9A]"
                        />

                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                          {t('filters.endDate', 'End date')}
                        </label>
                        <input
                          type="date"
                          value={dateRange.end ? dateRange.end.slice(0, 10) : ''}
                          onChange={(e) =>
                            setDateRange({
                              ...dateRange,
                              end: e.target.value ? `${e.target.value}T23:59:59.999Z` : null
                            })
                          }
                          className="w-full mb-3 px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#6A1B9A]"
                        />

                        <div className="flex justify-between gap-2">
                          <button
                            onClick={() => {
                              setDateRange({ start: null, end: null });
                              setOpenDatePicker(false);
                            }}
                            className="text-[11px] px-2 py-1 text-gray-600 hover:bg-gray-50 rounded"
                          >
                            {t('filters.clear', 'Clear')}
                          </button>
                          <button
                            onClick={() => setOpenDatePicker(false)}
                            className="text-[11px] px-3 py-1 bg-[#6A1B9A] text-white rounded font-semibold hover:bg-[#5A1786]"
                          >
                            {t('filters.apply', 'Apply')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Branch */}
                  <div className="relative" ref={branchRef}>
                    <button
                      onClick={() => setOpenBranch(!openBranch)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white shadow-xs font-medium hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                      <FiMapPin size={13} className="text-gray-500 flex-shrink-0" />
                      <span>{selectedBranch === "All Branches" ? t('filters.allBranches', 'All Branches') : selectedBranch}</span>
                      <FiChevronDown size={13} className="text-gray-400" />
                    </button>
                    {openBranch && (
                      <div className="absolute left-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-30">
                        {["All Branches", "Main Branch", "Downtown"].map(b => (
                          <div
                            key={b}
                            onClick={() => { setSelectedBranch(b); setOpenBranch(false); }}
                            className="px-3 py-2 text-xs hover:bg-gray-100 cursor-pointer"
                          >
                            {b === "All Branches" ? t('filters.allBranches', 'All Branches') : b}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Channel */}
                  <div className="relative" ref={channelRef}>
                    <button
                      onClick={() => setOpenChannel(!openChannel)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white shadow-xs font-medium hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                      <FiShoppingCart size={13} className="text-gray-500 flex-shrink-0" />
                      <span>{selectedChannel === "All Channels" ? t('filters.allChannels', 'All Channels') : selectedChannel}</span>
                      <FiChevronDown size={13} className="text-gray-400" />
                    </button>
                    {openChannel && (
                      <div className="absolute left-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-30">
                        {["All Channels", "POS", "Online", "Takeaway"].map(c => (
                          <div
                            key={c}
                            onClick={() => { setSelectedChannel(c); setOpenChannel(false); }}
                            className="px-3 py-2 text-xs hover:bg-gray-100 cursor-pointer"
                          >
                            {c === "All Channels" ? t('filters.allChannels', 'All Channels') : c}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Service */}
                  <div className="relative" ref={serviceRef}>
                    <button
                      onClick={() => setOpenService(!openService)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white shadow-xs font-medium hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                      <UtensilsCrossed size={13} className="text-gray-500 flex-shrink-0" />
                      <span>{selectedService === "All Services" ? t('filters.allServices', 'All Services') : selectedService}</span>
                      <FiChevronDown size={13} className="text-gray-400" />
                    </button>
                    {openService && (
                      <div className="absolute left-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-30">
                        {["All Services", "Dine-in", "Delivery", "Pickup"].map(s => (
                          <div
                            key={s}
                            onClick={() => { setSelectedService(s); setOpenService(false); }}
                            className="px-3 py-2 text-xs hover:bg-gray-100 cursor-pointer"
                          >
                            {s === "All Services" ? t('filters.allServices', 'All Services') : s}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Top Sellers List */}
                {topSellersList.length === 0 ? (
                  <div className="py-12 text-center text-gray-500 text-sm">
                    {t('messages.noTopSellers', 'No top sellers available for this period')}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {topSellersList.map((item, idx) => (
                      <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center justify-between py-3.5 gap-4">
                        <div className="flex items-center gap-3.5 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 shadow-2xs">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = pizzaImg;
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-[15px] font-bold text-black leading-tight truncate">
                              {item.name}
                            </h4>
                            <p className="text-[12px] text-gray-500 leading-tight mt-1 truncate">
                              {item.desc}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0 flex-wrap sm:flex-nowrap w-full sm:w-auto justify-between sm:justify-end">
                          <div className="w-20 flex-shrink-0">
                            <span className={`px-2.5 py-1 rounded-[6px] text-[11px] font-bold tracking-wide ${item.badgeColor}`}>
                              {item.badge}
                            </span>
                          </div>

                          <div className="text-right w-16 flex-shrink-0">
                            <div className="text-[14px] font-bold text-black">
                              {formatPlainNumber(item.plates)}
                            </div>
                            <div className="text-[11px] text-gray-500">
                              {t('summary.plated', 'plated')}
                            </div>
                          </div>

                          <div className="text-right w-24 flex-shrink-0">
                            <div className="text-[14px] font-bold text-black">
                              {formatReportPrice(item.revXOF)}
                            </div>
                            <div className="text-[11px] text-gray-500 whitespace-nowrap">
                              {item.revPct}% {t('summary.ofTotal', 'of total')}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 w-20 sm:w-24 flex-shrink-0">
                            <span className="text-[12px] font-bold text-black leading-none">
                              {item.prog}%
                            </span>
                            <div className="w-full h-[6px] bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F]"
                                style={{ width: `${Math.min(item.prog, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer summary — computed from real data only */}
                <div className="mt-6 flex flex-wrap items-center justify-between bg-[#FBF9FD] rounded-2xl p-4 border border-[#F0EBF5] gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#EFE8F9] rounded-xl flex items-center justify-center text-[#6A1B9A] flex-shrink-0">
                      <FiBarChart2 size={22} />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-black leading-tight">
                        {t('summary.totalSummary', 'Total Summary')}
                      </h4>
                      <p className="text-[12px] text-gray-500">
                        {t('summary.itemsCount', '{{count}} items', { count: topSellersList.length })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 sm:gap-8 flex-wrap">
                    <div>
                      <div className="text-[11px] text-gray-500 mb-0.5">
                        {t('summary.totalQuantity', 'Total Quantity')}
                      </div>
                      <div className="text-[15px] font-bold text-black">
                        {formatPlainNumber(
                          topSellersList.reduce((s, i) => s + (Number(i.plates) || 0), 0)
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {t('summary.platesGlasses', 'Plates / Glasses')}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] text-gray-500 mb-0.5">
                        {t('summary.totalRevenue', 'Total Revenue')}
                      </div>
                      <div className="text-[15px] font-bold text-black">
                        {formatReportPrice(reportData?.netSales ?? reportData?.TotalSales)}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {t('summary.hundredPct', '100% of total')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PAYMENTS */}
            <div className="p-[1.5px] rounded-[24px] bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F]">
              <div className="bg-white rounded-[23px] p-6 shadow-sm">
                <h2 className="text-[22px] font-bold text-black mb-4">
                  {t('payments', 'Payments')}
                </h2>

                <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
                  <div className="w-[230px] h-[230px] relative flex items-center justify-center">
                    {hasPaymentData ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={paymentData}
                            cx="50%"
                            cy="50%"
                            innerRadius={0}
                            outerRadius={105}
                            dataKey="value"
                            stroke="#FFFFFF"
                            strokeWidth={1.5}
                            labelLine={false}
                            label={renderCustomizedPieLabel}
                            isAnimationActive={false}
                          >
                            {paymentData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(val, name) => [`${val}`, name]}
                            contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="w-48 h-48 rounded-full border-8 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm text-center px-6">
                        {t('messages.noPaymentData', 'No payment data for this period')}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3.5 min-w-[150px]">
                    {legendItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span
                          className="w-6 h-4 rounded-[4px] shadow-2xs flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-[15px] font-bold text-black tracking-tight">
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — stat cards */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4 h-fit">
            {metrics.map((m, idx) => (
              <StatCard key={idx} label={m.label} value={m.value} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}