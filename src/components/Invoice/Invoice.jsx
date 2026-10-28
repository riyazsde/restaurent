import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FiFilter } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import { FiDownload, FiArrowLeft } from "react-icons/fi";
import { toast } from "react-toastify";
import print from "../assets/print.svg";
import { formatCurrency } from "../../utils/currencyUtils";
import { usePayments } from "../../hooks/queries/useInvoice";
import invoiceService from "../../services/invoiceService";

const ReservationsHeader = () => {
  const { t } = useTranslation("invoice");
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const receiptRef = useRef(null);

  // TanStack React Query
  const { data: invoices = [], isLoading, refetch: fetchInvoices } = usePayments();

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const blob = await invoiceService.exportInvoices();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoices_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(t('exportSuccess', 'Invoices exported successfully!'));
    } catch (err) {
      toast.error(err.message || t('exportFailed', 'Failed to export invoices'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleViewReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowReceiptModal(true);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 sm:p-6 font-[Poppins] space-y-4">
        {/* Top Row: Title and New Button */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          {/* Left: Title */}
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => navigate('/dashboard/home')} 
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors self-start"
            >
              <FiArrowLeft /> Back to Dashboard
            </button>
            <h2 className="text-2xl sm:text-3xl font-bold">
              {t("title")}
            </h2>
          </div>

          {/* Right: Search / Export section */}
          <div className="flex items-center justify-end gap-2">
            {/* <div className="flex items-center border border-gray-300 rounded-md px-2 py-2 bg-white w-full sm:w-48">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm w-full outline-none bg-transparent"
              />
              <FiSearch className="text-gray-500" />
            </div> */}

            {/* <button
              onClick={fetchInvoices}
              className="px-4 py-1.5 text-sm sm:text-lg text-white rounded-md bg-gradient-to-b from-purple-700 to-red-600"
            >
              {t('search')}
            </button> */}

            {/* <button onClick={() => setShowModal(true)} className="p-2">
              <FiFilter className="text-gray-600" />
            </button> */}

            {showModal && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 bg-black bg-opacity-40 z-40"
                  onClick={() => setShowModal(false)}
                />

                {/* Modal Content */}
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                  <div className="bg-white w-full max-w-md p-4 sm:p-6 rounded-2xl shadow-md">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4 sm:mb-6">
                      <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                        <FiFilter /> {t("filter.title")}
                      </h2>
                      <button onClick={() => setShowModal(false)}>
                        <IoClose className="text-lg sm:text-xl" />
                      </button>
                    </div>

                    {/* Form */}
                    <div className="space-y-4">
                      {/* Sort by Day */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          {t("filter.sortByDay")}
                        </label>
                        <select className="w-full border border-purple-300 text-sm rounded-md px-3 py-2 outline-none bg-gradient-to-r from-white to-white">
                          <option>{t("filter.today")}</option>
                          <option>{t("filter.yesterday")}</option>
                          <option>{t("filter.thisWeek")}</option>
                          <option>{t("filter.thisMonth")}</option>
                        </select>
                      </div>

                      {/* From and To Dates */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-1/2">
                          <label className="block text-sm mb-1">
                            {t("filter.from")}
                          </label>
                          <input
                            type="date"
                            className="w-full border border-purple-300 text-sm rounded-md px-3 py-2 outline-none bg-gradient-to-r from-purple-50 to-red-50"
                          />
                        </div>
                        <div className="w-full sm:w-1/2">
                          <label className="block text-sm mb-1">
                            {t("filter.to")}
                          </label>
                          <input
                            type="date"
                            className="w-full border border-purple-300 text-sm rounded-md px-3 py-2 outline-none bg-gradient-to-r from-purple-50 to-red-50"
                          />
                        </div>
                      </div>

                      {/* Save Button */}
                      <div className="pt-4">
                        <button
                          onClick={() => navigate("invoicefilter")}
                          className="w-full py-2 text-white rounded-md font-medium bg-gradient-to-b from-purple-700 to-red-600"
                        >
                          {t("filter.save")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between">
            {/* Left side: Text */}
            <p className="text-lg sm:text-xl text-gray-500 mb-2 sm:mb-0">
              {t("showing", { count: invoices.length })}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 font-[Poppins]">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-auto rounded-lg border border-gray-300">
          <table className="min-w-full border-collapse text-sm text-left">
            <thead>
              <tr className="bg-gradient-to-b from-purple-100 to-red-100 text-gray-700 border-b border-gray-300">
                <th className="px-4 py-2 text-xs border border-gray-300 whitespace-nowrap">
                  {t("table.paymentId")}
                </th>
                <th className="px-4 py-2 text-xs border border-gray-300 whitespace-nowrap">
                  {t("table.orderId")}
                </th>
                <th className="px-4 py-2 text-xs border border-gray-300 whitespace-nowrap">
                  {t("table.date")}
                </th>
                <th className="px-4 py-2 text-xs border border-gray-300 whitespace-nowrap">
                  {t("table.total")}
                </th>
                <th className="px-4 py-2 text-xs border border-gray-300 whitespace-nowrap">
                  {t("table.subtotal")}
                </th>
                <th className="px-4 py-2 text-xs border border-gray-300 whitespace-nowrap">
                  {t("table.tax")}
                </th>
                <th className="px-4 py-2 text-xs border border-gray-300 whitespace-nowrap">
                  {t("table.diningOption")}
                </th>
                <th className="px-4 py-2 text-xs border border-gray-300 whitespace-nowrap">
                  {t("table.tableId")}
                </th>
                <th className="px-4 py-2 text-xs border border-gray-300 whitespace-nowrap">
                  {t("table.paymentMethod")}
                </th>
                <th className="px-4 py-2 text-xs border border-gray-300 whitespace-nowrap">
                  {t("table.paymentStatus")}
                </th>
                <th className="px-4 py-2 text-xs border border-gray-300 whitespace-nowrap">
                  {t("table.action")}
                </th>
              </tr>
            </thead>
            <tbody>
              {invoices.length > 0 ? (
                invoices.map((payment, index) => (
                  <tr
                    key={payment.PaymentByRestaurant_id}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-purple-50"
                    } border-b border-gray-300`}
                  >
                    <td className="px-4 py-2 border border-gray-300">
                      {payment.Invoices_id || payment.invoice_id || payment.PaymentByRestaurant_id || "N/A"}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {payment.POS_Order_id || payment.Order_id?.POS_Order_id || "N/A"}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {formatDate(payment.Date || payment.CreateAt)}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {formatCurrency(payment.Total ?? payment.total_price ?? payment.Order_id?.Total)}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {formatCurrency(payment.SubTotal ?? payment.Order_id?.SubTotal)}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {formatCurrency(payment.Tax ?? payment.Order_id?.Tax)}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {payment.Delivery_Type || payment.Order_id?.Dining_Option || "N/A"}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {payment.Table_name || payment.Order_id?.Table_id || "N/A"}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {payment.Payment_Options_id?.PaymentOption?.[0]?.option ||
                        "N/A"}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          payment.paymentStatus === "Success"
                            ? "bg-green-100 text-green-800"
                            : payment.paymentStatus === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : payment.paymentStatus === "Failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {payment.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleViewReceipt(payment)}
                          className="p-2 rounded-lg bg-gradient-to-b from-purple-100 to-red-100 hover:from-purple-200 hover:to-red-200 transition-colors"
                          title="View Receipt"
                        >
                          <img src={print} alt="print" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="11"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    {t("noInvoices")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="block lg:hidden space-y-4">
          {invoices.map((payment) => (
            <div
              key={payment.PaymentByRestaurant_id}
              className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm"
            >
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Payment ID:</span>{" "}
                  {payment.PaymentByRestaurant_id || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Order ID:</span>{" "}
                  {payment.Order_id?.POS_Order_id || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Date:</span>{" "}
                  {formatDate(payment.CreateAt)}
                </div>
                <div>
                  <span className="font-medium">{t("table.total")}:</span>{" "}
                  {formatCurrency(payment.Order_id?.Total)}
                </div>
                <div>
                  <span className="font-medium">{t("table.subtotal")}:</span>{" "}
                  {formatCurrency(payment.Order_id?.SubTotal)}
                </div>
                <div>
                  <span className="font-medium">{t("table.tax")}:</span>{" "}
                  {formatCurrency(payment.Order_id?.Tax)}
                </div>
                <div>
                  <span className="font-medium">
                    {t("table.diningOption")}:
                  </span>{" "}
                  {payment.Order_id?.Dining_Option || "N/A"}
                </div>
                <div>
                  <span className="font-medium">{t("table.tableId")}:</span>{" "}
                  {payment.Order_id?.Table_id || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Payment Method:</span>{" "}
                  {payment.Payment_Options_id?.PaymentOption?.[0]?.option ||
                    "N/A"}
                </div>
                <div>
                  <span className="font-medium">Payment Status:</span>
                  <span
                    className={`ml-1 px-2 py-1 rounded text-xs ${
                      payment.paymentStatus === "Success"
                        ? "bg-green-100 text-green-800"
                        : payment.paymentStatus === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : payment.paymentStatus === "Failed"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {payment.paymentStatus}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Order Status:</span>
                  <span
                    className={`ml-1 px-2 py-1 rounded text-xs ${
                      payment.Order_id?.Order_Status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : payment.Order_id?.Order_Status === "Preparing"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {payment.Order_id?.Order_Status || "N/A"}
                  </span>
                </div>
                <div className="col-span-2 flex justify-center mt-2">
                  <button
                    onClick={() => handleViewReceipt(payment)}
                    className="p-2 rounded-lg bg-gradient-to-b from-purple-100 to-red-100 hover:from-purple-200 hover:to-red-200 transition-colors"
                    title="View Receipt"
                  >
                    <svg
                      className="w-5 h-5 text-purple-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && selectedPayment && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowReceiptModal(false)}
          />

          {/* Modal Content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto">
              {/* Receipt Content */}
              <div ref={receiptRef} className="p-4 print:p-8">
                {/* Header */}
                <div className="text-center mb-3">
                  <h1 className="text-2xl font-bold mb-2">Order Receipt</h1>
                  <div className="bg-gradient-to-r from-pink-100 to-pink-200 py-1.5 px-3 rounded-lg">
                    <p className="text-xs text-gray-600">Order Number</p>
                    <p className="text-xl font-bold text-gray-800">
                      #{selectedPayment.Order_id?.POS_Order_id || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Success Icon */}
                <div className="flex flex-col items-center mb-3">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-green-200 flex items-center justify-center">
                        <svg
                          className="w-10 h-10 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold mt-3 mb-1">
                    Payment Success!
                  </h2>
                  <p className="text-gray-500 text-sm text-center">
                    Your payment has been successfully done.
                  </p>
                </div>

                {/* Total Payment */}
                <div className="text-center mb-3 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 text-xs mb-1">Total Payment</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {formatCurrency(selectedPayment.Order_id?.Total)}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-gray-50 p-2.5 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Order Number</p>
                    <p className="font-semibold text-xs">
                      {selectedPayment.Order_id?.POS_Order_id || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Date & Time</p>
                    <p className="font-semibold text-xs">
                      {formatDate(selectedPayment.CreateAt)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Payment Type</p>
                    <p className="font-semibold text-xs">
                      {selectedPayment.Payment_Options_id?.PaymentOption?.[0]
                        ?.option || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Customer Name</p>
                    <p className="font-semibold text-xs">
                      {selectedPayment.Order_id?.Customer_id?.name || "Guest"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">
                      {t("table.diningOption")}
                    </p>
                    <p className="font-semibold text-xs">
                      {selectedPayment.Order_id?.Dining_Option || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">
                      {t("table.tableId")}
                    </p>
                    <p className="font-semibold text-xs">
                      {selectedPayment.Order_id?.Table_id || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">
                      {t("table.subtotal")}
                    </p>
                    <p className="font-semibold text-xs">
                      {formatCurrency(selectedPayment.Order_id?.SubTotal)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">
                      {t("table.tax")}
                    </p>
                    <p className="font-semibold text-xs">
                      {formatCurrency(selectedPayment.Order_id?.Tax)}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t-2 border-dashed border-gray-300 my-3"></div>

                {/* Print Button */}
                <button
                  onClick={handlePrintReceipt}
                  className="w-full py-2.5 bg-white border-2 border-gray-300 rounded-lg font-semibold text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 mb-2"
                >
                  <FiDownload className="text-lg" />
                  Print Receipt
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-red-600 text-white rounded-lg font-semibold text-sm hover:from-purple-700 hover:to-red-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed.inset-0.z-50 * {
            visibility: visible;
          }
          .fixed.inset-0.z-50 {
            position: absolute;
            left: 0;
            top: 0;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default ReservationsHeader;
