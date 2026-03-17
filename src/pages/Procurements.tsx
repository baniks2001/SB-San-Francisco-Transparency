import React, { useState, useEffect } from 'react';
import { Procurement, Budget } from '../types';
import api from '../services/api';
import NotificationModal from '../components/NotificationModal';
import ConfirmationModal from '../components/ConfirmationModal';

const Procurements: React.FC = () => {
  const [procurements, setProcurements] = useState<Procurement[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'procurements' | 'budgets'>('procurements');

  // Modal states
  const [notificationModal, setNotificationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'error' | 'warning' | 'info'
  });
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'info' as 'danger' | 'warning' | 'info',
    isLoading: false
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [procurementsResponse, budgetsResponse] = await Promise.all([
          api.get('/procurements'),
          api.get('/budgets')
        ]);
        setProcurements(procurementsResponse.data);
        setBudgets(budgetsResponse.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Fallback to mock data if API fails
        const mockProcurements: Procurement[] = [
          {
            _id: '1',
            procurementNumber: 'PR-2025-001',
            title: 'Office Supplies Procurement',
            description: 'Procurement of office supplies for municipal offices',
            amount: 500000,
            status: 'Approved',
            isPublic: true,
            documentFile: 'procurement001.pdf',
            datePosted: '2025-01-15',
            dateApproved: '2025-01-20',
            procurementType: 'Office Supplies',
            supplier: 'ABC Computer Supplies',
            createdBy: 'admin',
            createdAt: '2025-01-15T00:00:00Z',
            updatedAt: '2025-01-20T00:00:00Z'
          }
        ];

        const mockBudgets: Budget[] = [
          {
            _id: '1',
            budgetNumber: 'BG-2025-001',
            title: 'Annual General Fund Budget 2025',
            description: 'Comprehensive budget for municipal operations for fiscal year 2025',
            totalAmount: 50000000,
            allocatedAmount: 45000000,
            status: 'Approved',
            isPublic: true,
            documentFile: 'budget2025.pdf',
            fiscalYear: '2025',
            department: 'General Fund',
            datePosted: '2025-01-01',
            dateApproved: '2025-01-10',
            createdBy: 'admin',
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-10T00:00:00Z'
          }
        ];
        setProcurements(mockProcurements);
        setBudgets(mockBudgets);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Modal helper functions
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const showNotification = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setNotificationModal({
      isOpen: true,
      title,
      message,
      type
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const showConfirmation = (title: string, message: string, onConfirm: () => void, type: 'danger' | 'warning' | 'info' = 'info') => {
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      type,
      isLoading: false
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-600 text-white';
      case 'Pending':
        return 'bg-yellow-600 text-white';
      case 'Draft':
        return 'bg-gray-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Procurements & Budget</h1>
        <p className="text-black">
          View procurement notices and budget information of the municipality
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('procurements')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'procurements'
                ? 'border-yellow-500 text-black'
                : 'border-transparent text-black hover:text-black hover:border-gray-300'
            }`}
          >
            Procurements
          </button>
          <button
            onClick={() => setActiveTab('budgets')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'budgets'
                ? 'border-yellow-500 text-black'
                : 'border-transparent text-black hover:text-black hover:border-gray-300'
            }`}
          >
            Budgets
          </button>
        </nav>
      </div>

      {activeTab === 'procurements' && (
        <div className="bg-white shadow overflow-hidden rounded-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Procurement No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {procurements.map((procurement) => (
                  <tr key={procurement._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                      {procurement.procurementNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-black">
                      <div className="max-w-xs truncate" title={procurement.title}>
                        {procurement.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      ₱{procurement.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(procurement.status)}`}>
                        {procurement.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-yellow-600 hover:text-yellow-900">View</button>
                        {procurement.documentFile && (
                          <button className="text-green-600 hover:text-green-900">Download</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'budgets' && (
        <div className="bg-white shadow overflow-hidden rounded-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Budget No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Allocated Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Fiscal Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {budgets.map((budget) => (
                  <tr key={budget._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                      {budget.budgetNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-black">
                      <div className="max-w-xs truncate" title={budget.title}>
                        {budget.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      ₱{budget.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      ₱{budget.allocatedAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {budget.fiscalYear}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-yellow-600 hover:text-yellow-900">View</button>
                        {budget.documentFile && (
                          <button className="text-green-600 hover:text-green-900">Download</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modern Modals */}
      <NotificationModal
        isOpen={notificationModal.isOpen}
        onClose={() => setNotificationModal(prev => ({ ...prev, isOpen: false }))}
        title={notificationModal.title}
        message={notificationModal.message}
        type={notificationModal.type}
      />

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
        isLoading={confirmationModal.isLoading}
      />
    </div>
  );
};

export default Procurements;
