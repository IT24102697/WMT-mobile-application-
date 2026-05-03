import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { CurrencyProvider } from './context/CurrencyContext';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ProfileScreen from './screens/ProfileScreen';
import MenuScreen from './screens/MenuScreen';
import CartScreen from './screens/CartScreen';
import MyOrdersScreen from './screens/MyOrdersScreen';
import StaffOrdersScreen from './screens/StaffOrdersScreen';
import AdminMenuScreen from './screens/AdminMenuScreen';
import PaymentScreen from './screens/PaymentScreen';
import InvoiceScreen from './screens/InvoiceScreen';
import InventoryScreen from './screens/InventoryScreen';
import TrustScoreScreen from './screens/TrustScoreScreen';
import AdminDiscountScreen from './screens/AdminDiscountScreen';
import CustomerDashboard from './screens/CustomerDashboard';
import StaffDashboard from './screens/StaffDashboard';
import AdminDashboard from './screens/AdminDashboard';
import CurrencyScreen from './screens/CurrencyScreen';
import RefundScreen from './screens/RefundScreen';
import AdminRefundScreen from './screens/AdminRefundScreen';
import StaffApprovalScreen from './screens/StaffApprovalScreen';
import MenuAnalyticsScreen from './screens/MenuAnalyticsScreen';
import StockManagementScreen from './screens/StockManagementScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <CurrencyProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="CustomerDashboard" component={CustomerDashboard} />
          <Stack.Screen name="StaffDashboard" component={StaffDashboard} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Menu" component={MenuScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
          <Stack.Screen name="StaffOrders" component={StaffOrdersScreen} />
          <Stack.Screen name="AdminMenu" component={AdminMenuScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="InvoiceScreen" component={InvoiceScreen} />
          <Stack.Screen name="Inventory" component={InventoryScreen} />
          <Stack.Screen name="TrustScore" component={TrustScoreScreen} />
          <Stack.Screen name="AdminDiscount" component={AdminDiscountScreen} />
          <Stack.Screen name="Currency" component={CurrencyScreen} />
          <Stack.Screen name="Refund" component={RefundScreen} />
          <Stack.Screen name="AdminRefund" component={AdminRefundScreen} />
          <Stack.Screen name="StaffApproval" component={StaffApprovalScreen} />
          <Stack.Screen name="MenuAnalytics" component={MenuAnalyticsScreen} />
          <Stack.Screen name="StockManagement" component={StockManagementScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </CurrencyProvider>
  );
}