import { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ColorModeProvider } from './hooks/ThemeContext'
import MainLayout from './components/layout/MainLayout'
import Users from './components/pages/User/Users'
import Roles from './components/pages/Role/Roles'
import Address from './components/pages/Address/Address'
import Profile from './components/pages/Profile'
import UserConfirmConnectedDevice from './components/pages/UserConfirmConnectedDevice'
import UserCancelConnectedDevice from './components/pages/UserCancelConnectedDevice'
import PaymentCancel from './components/pages/PaymentCancel'
import PaymentSuccess from './components/pages/PaymentSuccess'
import Settings from './components/pages/Settings'
import Organisation from './components/pages/Organisation/Organisation'
import Devices from './components/pages/Device/Devices'
import CustomerDevices from './components/pages/CustomerDevice/customerDevices'
import InstallationRequests from './components/pages/installationRequest/InstallationRequests'
import ClientInstallationRequests from './components/pages/installationRequest/ClientInstallationRequests'
import ServiceRequests from './components/pages/ServiceRequest/ServiceRequests'
import ClientServiceRequest from './components/pages/ServiceRequest/ClientServiceRequest'
import AiClientServiceRequest from './components/pages/ServiceRequestAi/AiClientServiceRequest'
import AiServiceRequests from './components/pages/ServiceRequestAi/AiServiceRequests'
import ClientOrders from './components/pages/Orders/ClientOrders'
import Orders from './components/pages/Orders/Orders'
import Invoices from './components/pages/Invoices/Invoices'
import SpareParts from './components/pages/SparePart/SpareParts'
import LandingPage from './components/pages/LandingPage'
import NotFoundPage from './components/pages/NotFoundPage'
import ForgetPassword from './components/pages/ForgetPassword'
import LoginPage from './components/pages/LoginPage'
import VerifyAccount from './components/pages/VerifyAccount'
import Resetpassword from './components/pages/Resetpassword'
import LoaderApp from './components/ui/LoaderApp'
import ProtectedRoute from './components/routes/ProtectedRoute'
import PermissionRoute from './components/routes/PermissionRoute'
import './styles/global.scss'

function App() {
  return (
    <ColorModeProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgetPassword" element={<ForgetPassword />} />
        <Route path="/verify-account" element={<VerifyAccount />} />
        <Route path="/reset-password" element={<Resetpassword />} />
        <Route path="/device-confirm" element={<UserConfirmConnectedDevice />} />
        <Route path="/device-denied" element={<UserCancelConnectedDevice />} />

        {/* Routes protégées */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={
              <Suspense fallback={<LoaderApp loading={true} />}>
                <MainLayout />
              </Suspense>
            }
          >
            <Route index element={<LandingPage />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="organisation" element={<Organisation />} />
            <Route path="devices" element={<Devices />} />
            <Route path="customerDevices" element={<CustomerDevices />} />
            <Route path="spareParts" element={<SpareParts />} />
            <Route path="payment-cancel" element={<PaymentCancel />} />
            <Route path="payment-success" element={<PaymentSuccess />} />
           
            <Route
              path="users"
              element={
                <PermissionRoute
                  requiredPermissions={[
                    'Permissions.AllowAll',
                    'Permissions.Users.Read',
                    'Permissions.Users.Manage'
                  ]}
                >
                  <Users />
                </PermissionRoute>
              }
            />

            <Route
              path="invoices"
              element={
                <PermissionRoute
                  requiredPermissions={[
                    'Permissions.Devices.ManageMine',
                    'Permissions.Services.ManageMine'
                  ]}
                >
                  <Invoices />
                </PermissionRoute>
              }
            /> 

            <Route
              path="orders"
              element={
                <PermissionRoute
                  requiredPermissions={[
                    'Permissions.AllowAll',
                    'Permissions.Services.Manage'
                  ]}
                >
                  <Orders />
                </PermissionRoute>
              }
            /> 

             <Route
              path="Client-orders"
              element={
                <PermissionRoute
                  requiredPermissions={[
                    'Permissions.Services.ManageMine'
                  ]}
                >
                  <ClientOrders />
                </PermissionRoute>
              }
            /> 

             <Route
              path="Client-installations"
              element={
                <PermissionRoute
                  requiredPermissions={[
                    'Permissions.Devices.ManageMine'
                  ]}
                >
                  <ClientInstallationRequests />
                </PermissionRoute>
              }
            /> 

             <Route
              path="Ai-ServiceRequest"
              element={
                <PermissionRoute
                  requiredPermissions={[
                    'Permissions.AllowAll',
                    'Permissions.Services.Manage',
                  ]}
                >
                  <AiServiceRequests />
                </PermissionRoute>
              }
            />

             <Route
              path="Ai-Client-ServiceRequest"
              element={
                <PermissionRoute
                  requiredPermissions={[
                    'Permissions.Services.ManageMine'
                  ]}
                >
                  <AiClientServiceRequest />
                </PermissionRoute>
              }
            />

             <Route
              path="Client-ServiceRequest"
              element={
                <PermissionRoute
                  requiredPermissions={[
                    'Permissions.Services.ManageMine'
                  ]}
                >
                  <ClientServiceRequest />
                </PermissionRoute>
              }
            />

            <Route
              path="serviceRequests"
              element={
                <PermissionRoute
                  requiredPermissions={[
                    'Permissions.AllowAll',
                    'Permissions.Services.Manage',
                  ]}
                >
                  <ServiceRequests />
                </PermissionRoute>
              }
            />

            <Route
              path="installations"
              element={
                <PermissionRoute
                  requiredPermissions={[
                    'Permissions.AllowAll',
                    'Permissions.Request.InstallationRequest',
                  ]}
                >
                  <InstallationRequests />
                </PermissionRoute>
              }
            />

            <Route
              path="roles"
              element={
                <PermissionRoute
                  requiredPermissions={[
                    'Permissions.AllowAll',
                    'Permissions.Roles.Read',
                    'Permissions.Roles.Manage'
                  ]}
                >
                  <Roles />
                </PermissionRoute>
              }
            />
            <Route
              path="address"
              element={
                <PermissionRoute
                  requiredPermissions={[
                    'Permissions.AllowAll',
                    'Permissions.Addresses.ReadAll',
                  ]}
                >
                  <Address />
                </PermissionRoute>
              }
            />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ColorModeProvider>
  )
}

export default App
