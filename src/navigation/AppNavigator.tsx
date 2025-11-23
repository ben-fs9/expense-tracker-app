import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import DashboardScreen from '../screens/DashboardScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import TransactionListScreen from '../screens/TransactionListScreen';
import ReviewTransactionScreen from '../screens/ReviewTransactionScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={{
                    tabBarActiveTintColor: '#6200ee',
                    tabBarInactiveTintColor: 'gray',
                }}
            >
                <Tab.Screen name="Dashboard" component={DashboardScreen} />
                <Tab.Screen name="Review" component={ReviewTransactionScreen} />
                <Tab.Screen name="Add" component={AddTransactionScreen} />
                <Tab.Screen name="Transactions" component={TransactionListScreen} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}
