import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import useLanguageStore from './store/languageStore';
import useAuthStore from './store/authStore';

import Register from './components/Register'
import Signin from './components/Signin'
import LandingPage from './components/LandingPage'
import Forget from './components/Forget/Forget'
import VerifyOtp from './components/Forget/VerifyOtp'
import AdminLayout from './components/AdminLayout/AdminLayout'
import Dashboard from './components/AdminLayout/Dashboard'
import Pos from './components/POS/Pos'
import BarManagement from './components/Bar/BarManagement';
import BarTabsView from './components/Bar/BarTabsView';
import Orders from './components/Orders/Orders';
import Kitchen from './components/Kitchen/Kitchen'
import FloorPlan from './components/FloorPlan/FloorPlan'
import EditTables from './components/FloorPlan/EditTables';
import Floor1 from './components/FloorPlan/Floor1'
import Generate from './components/FloorPlan/Generate'
import CreatePlan from './components/FloorPlan/CreatePlan'
import Reservations from './components/Reservations/Reservations';
import Customers from './components/Customers/Customers';
import CustomerDetails from './components/Customers/CustomerDetails'
import Invoice from './components/Invoice/Invoice'
import Invoice2 from './components/Invoice/Invoice2'
import FeedbackDashboard from './components/Feedback/FeedbackDashboard'
import Employee from './components/Employee/Employee'
import CreateEmployee from './components/Employee/CreateEmployee'
import Manager from './components/Employee/Manager';
import Performance from './components/Employee/Performance';
import Reports from './components/Reports/Reports'
import Settings from './components/Settings/Settings'
import TablesTab from './components/Settings/TablesTab'
import MenuItemsTab from './components/Settings/MenuItemsTab'
import RecipeManagementTab from './components/Settings/Recipe/RecipeManagementTab'
import InventoryManagementTab from './components/Settings/Inventory/InventoryManagementTab'
import Promotions from './components/CouponManagement/Promotions'
import LoyaltyPrograms from './components/CouponManagement/LoyaltyPrograms'
import ContactSupport from './components/Support/ContactSupport'
import CreateSupportTicket from './components/Support/CreateSupportTicket'
import SupportTickets from './components/Support/SupportTickets'
import SupportTicketDetail from './components/Support/SupportTicketDetail'
import NotificationList from './components/Notifications/Notifications'
import MyDevices from './components/MyDevices/MyDevices'
import MyProfile from './components/Profile/MyProfile'
import Language from './components/Language/Language'
import CreateMenuItem from './components/Menu/CreateMenuItem'
import EmployeeLayout from './components/EmployeeLayout/EmployeeLayout'
import EmployeeQuickOrder from './components/EmployeeDashboard/EmployeeQuickOrder'
import EmployeeTable from './components/EmployeeDashboard/EmployeeTable'
import EmployeeOrderHistory from './components/EmployeeDashboard/EmployeeOrderHistory'
import EmployeeReservations from './components/EmployeeDashboard/EmployeeReservations'
import EmployeeTeamChats from './components/EmployeeDashboard/EmployeeTeamChats'
import EmployeeAttendance from './components/EmployeeDashboard/EmployeeAttendance'
import EmployeeSalesPerformance from './components/EmployeeDashboard/EmployeeSalesPerformance'
import EmployeeWorkShifts from './components/EmployeeDashboard/EmployeeWorkShifts'
import EmployeeSettings from './components/EmployeeDashboard/EmployeeSettings'
import StripePaymentReturn from './components/Payment/StripePaymentReturn';
import SubscriptionPaymentResult from './components/Payment/SubscriptionPaymentResult';

const App = () => {
  const { initLanguage } = useLanguageStore();
  const { initAuth } = useAuthStore();

  // Initialize auth and language on app mount
  useEffect(() => {
    initAuth();
    initLanguage();
  }, [initAuth, initLanguage]);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/signin" element={<PublicRoute><Signin /></PublicRoute>} />
        <Route path="/forget" element={<PublicRoute><Forget /></PublicRoute>} />
        <Route path="/verifyotp" element={<PublicRoute><VerifyOtp /></PublicRoute>} />
        <Route path="/payment/success" element={<StripePaymentReturn />} />
        <Route path="/payment/cancel" element={<StripePaymentReturn />} />
        <Route path="/signup/payment-result" element={<SubscriptionPaymentResult />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['Restaurant', 'Admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="home" replace />} />

          <Route path="home" element={<Dashboard />} />
          <Route path="pos" element={<Pos />} />
          <Route path="bar" element={<BarManagement />} />
          <Route path="bar-tabs" element={<BarTabsView />} />
          <Route path="orders" element={<Orders />} />
          <Route path="kitchen" element={<Kitchen />} />
          <Route path="floorplan" element={<FloorPlan />} />
          <Route path="floorplan/edit" element={<EditTables />} />
          <Route path="floorplan/edit/floor1" element={<Floor1 />} />
          <Route path="floorplan/edit/floor1/generate" element={<Generate />} />
          <Route path="floorplan/create" element={<CreatePlan />} />
          <Route path="floorplan/edit/floor1/generate/createplan" element={<CreatePlan />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/customerdetails" element={<CustomerDetails />} />
          <Route path="invoice" element={<Invoice2 />} />
          <Route path="feedback" element={<FeedbackDashboard />} />
          <Route path="employee" element={<Employee />} />
          <Route path="employee/create" element={<CreateEmployee />} />
          <Route path="employee/list" element={<Manager />} />
          <Route path="employee/:id" element={<Performance />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="tables" element={<TablesTab />} />
          <Route path="table" element={<EmployeeTable />} />
          <Route path="menuitems" element={<MenuItemsTab />} />
          <Route path="menuitems/create" element={<CreateMenuItem />} />
          <Route path="recipe" element={<RecipeManagementTab />} />
          <Route path="inventory" element={<InventoryManagementTab />} />
          <Route path="promotions" element={<Promotions />} />
          <Route path="loyalty" element={<LoyaltyPrograms />} />
          <Route path="profile" element={<MyProfile />} />
          <Route path="my-devices" element={<MyDevices />} />
          <Route path="language" element={<Language />} />
        </Route>

        {/* Support Routes */}
        <Route path="/support" element={<ProtectedRoute allowedRoles={['Restaurant', 'Admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<ContactSupport />} />
          <Route path="create-ticket" element={<CreateSupportTicket />} />
          <Route path="tickets" element={<SupportTickets />} />
          <Route path="tickets/:id" element={<SupportTicketDetail />} />
        </Route>

        {/* Notifications Route */}
        <Route path="/notifications" element={<ProtectedRoute allowedRoles={['Restaurant', 'Admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<NotificationList />} />
        </Route>

        {/* My Devices Route */}
        <Route path="/my-devices" element={<ProtectedRoute allowedRoles={['Restaurant', 'Admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<MyDevices />} />
        </Route>

        {/* Profile Route */}
        <Route path="/profile" element={<ProtectedRoute allowedRoles={['Restaurant', 'Admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<MyProfile />} />
        </Route>

        {/* Language Route */}
        <Route path="/language" element={<ProtectedRoute allowedRoles={['Restaurant', 'Admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Language />} />
        </Route>

        {/* Menu Routes */}
        <Route path="/menu" element={<ProtectedRoute allowedRoles={['Restaurant', 'Admin']}><AdminLayout /></ProtectedRoute>}>
          <Route path="create" element={<Navigate to="/dashboard/menuitems/create" replace />} />
        </Route>

        {/* Employee Dashboard Routes */}
        <Route path="/employee" element={<ProtectedRoute allowedRoles={['Employee']}><EmployeeLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="quick-order" replace />} />
          <Route path="quick-order" element={<EmployeeQuickOrder />} />
          <Route path="table" element={<EmployeeTable />} />
          <Route path="order-history" element={<EmployeeOrderHistory />} />
          <Route path="reservations" element={<EmployeeReservations />} />
          <Route path="team-chats" element={<EmployeeTeamChats />} />
          <Route path="attendance" element={<EmployeeAttendance />} />
          <Route path="sales-performance" element={<EmployeeSalesPerformance />} />
          <Route path="work-shifts" element={<EmployeeWorkShifts />} />
          <Route path="settings" element={<EmployeeSettings />} />
          {/* Add more employee routes here as they are built */}
        </Route>

        {/* Shortcut redirects */}
        <Route path="/promotions" element={<Navigate to="/dashboard/promotions" replace />} />
        <Route path="/loyalty" element={<Navigate to="/dashboard/loyalty" replace />} />
      </Routes>
    </>
  )
}

export default App