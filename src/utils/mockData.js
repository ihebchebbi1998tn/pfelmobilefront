// Import mock data from JSON files
import mockUsersData from '../data/mockUsers.json'
import mockDevicesData from '../data/mockDevices.json'
import mockOrdersData from '../data/mockOrders.json'
import mockServiceRequestsData from '../data/mockServiceRequests.json'
import mockSparePartsData from '../data/mockSpareParts.json'
import mockInstallationRequestsData from '../data/mockInstallationRequests.json'
import mockAddressesData from '../data/mockAddresses.json'
import mockInvoicesData from '../data/mockInvoices.json'
import mockNotificationsData from '../data/mockNotifications.json'
import mockRolesData from '../data/mockRoles.json'
import mockChatSessionsData from '../data/mockChatSessions.json'
import mockCustomerDevicesData from '../data/mockCustomerDevices.json'

// Mock data structure for localStorage-only application
export const initializeMockData = () => {
  console.log('Initializing mock data...')
  
  // Force clear and reinitialize all mock data every time
  localStorage.clear()
  console.log('Cleared all localStorage data for fresh initialization')
  
  // Force clear and reinitialize all mock data
  const mockDataSets = [
    { key: 'mockUsers', data: mockUsersData },
    { key: 'mockDevices', data: mockDevicesData },
    { key: 'mockOrders', data: mockOrdersData },
    { key: 'mockServiceRequests', data: mockServiceRequestsData },
    { key: 'mockInstallationRequests', data: mockInstallationRequestsData },
    { key: 'mockSpareParts', data: mockSparePartsData },
    { key: 'mockInvoices', data: mockInvoicesData },
    { key: 'mockRoles', data: mockRolesData },
    { key: 'mockAddresses', data: mockAddressesData },
    { key: 'mockCustomerDevices', data: mockCustomerDevicesData },
    { key: 'mockChatSessions', data: mockChatSessionsData },
    { key: 'mockNotifications', data: mockNotificationsData }
  ]

  // Initialize each dataset
  mockDataSets.forEach(({ key, data }) => {
    console.log(`Initializing ${key} with ${data.length} items`)
    localStorage.setItem(key, JSON.stringify(data))
  })
  
  // Initialize organizations
  const mockOrgs = [
    {
      id: '1',
      name: 'L-Mobile',
      description: 'Main organization',
      isActive: true,
      isDeleted: false,
      address: null,
      phoneNumber: '+1234567890',
      email: 'contact@lmobile.com',
      primaryColor: '#1976d2'
    }
  ]
  console.log('Initializing mockOrganizations with', mockOrgs.length, 'items')
  localStorage.setItem('mockOrganizations', JSON.stringify(mockOrgs))
  
  // Initialize AI service requests
  const mockAiRequests = [
    {
      id: 'ai-sr-001',
      ticketNumber: 'AI-SR-2024-001',
      userId: '1',
      customerId: '1',
      customerName: 'Admin User',
      title: 'AI-Powered Predictive Maintenance',
      description: 'AI system detected potential HVAC system anomalies requiring preventive maintenance.',
      category: 'Predictive Maintenance',
      priority: 'Medium',
      status: 'Pending',
      aiConfidence: 0.87,
      predictedIssue: 'Filter replacement needed in next 30 days',
      recommendedAction: 'Schedule filter replacement and system inspection',
      deviceId: 'dev-001',
      estimatedCost: 120.00,
      companyId: '1',
      organizationId: '1',
      isPaid: false,
      paymentMethod: null,
      createdAt: '2024-12-15T10:30:00Z',
      updatedAt: '2024-12-15T10:30:00Z'
    },
    {
      id: 'ai-sr-002',
      ticketNumber: 'AI-SR-2024-002',
      userId: '1',
      customerId: '1',
      customerName: 'Admin User',
      title: 'Security System Optimization',
      description: 'AI analysis suggests camera positioning adjustments for improved coverage.',
      category: 'Security',
      priority: 'Low',
      status: 'InProgress',
      aiConfidence: 0.92,
      predictedIssue: 'Blind spots detected in camera coverage',
      recommendedAction: 'Reposition cameras and add supplementary units',
      deviceId: 'dev-002',
      estimatedCost: 300.00,
      companyId: '1',
      organizationId: '1',
      isPaid: true,
      paymentMethod: 'Credit Card',
      createdAt: '2024-12-10T14:20:00Z',
      updatedAt: '2024-12-12T09:15:00Z'
    },
    {
      id: 'ai-sr-003',
      ticketNumber: 'AI-SR-2024-003',
      userId: '1',
      customerId: '1',
      customerName: 'Admin User',
      title: 'Access Control Performance Enhancement',
      description: 'AI detected patterns suggesting lock optimization opportunities.',
      category: 'Access Control',
      priority: 'High',
      status: 'Completed',
      aiConfidence: 0.95,
      predictedIssue: 'Sensor calibration degradation detected',
      recommendedAction: 'Recalibrate fingerprint sensors and update firmware',
      deviceId: 'dev-003',
      estimatedCost: 180.00,
      companyId: '1',
      organizationId: '1',
      isPaid: true,
      paymentMethod: 'Cash',
      createdAt: '2024-12-05T11:45:00Z',
      updatedAt: '2024-12-08T16:30:00Z'
    }
  ]
  console.log('Initializing mockServiceRequestsAi with', mockAiRequests.length, 'items')
  localStorage.setItem('mockServiceRequestsAi', JSON.stringify(mockAiRequests))
  
  // Initialize user-to-user sessions
  const mockUserToUserSessions = [
    {
      id: 'utu-001',
      participants: ['1', '2'],
      lastMessage: 'Installation scheduled for next week',
      lastMessageTime: '2024-12-19T16:30:00Z',
      unreadCount: 0,
      status: 'Active',
      createdAt: '2024-12-18T09:00:00Z',
      messages: [
        {
          id: 'utu-msg-001',
          userId: '1',
          content: 'Hi John, can you check the thermostat installation status?',
          timestamp: '2024-12-18T09:00:00Z',
          status: true,
          sessionId: 'utu-001'
        },
        {
          id: 'utu-msg-002',
          userId: '2',
          content: 'Installation scheduled for next week',
          timestamp: '2024-12-19T16:30:00Z',
          status: true,
          sessionId: 'utu-001'
        }
      ]
    }
  ]
  console.log('Initializing mockUserToUserSessions with', mockUserToUserSessions.length, 'items')
  localStorage.setItem('mockUserToUserSessions', JSON.stringify(mockUserToUserSessions))
  
  // Initialize feedback
  const mockFeedback = [
    {
      id: 'fb-001',
      userId: '1',
      rating: 5,
      message: 'Excellent service and quick response time!',
      category: 'Service Quality',
      relatedId: 'sr-002',
      relatedType: 'ServiceRequest',
      createdAt: '2024-12-16T12:00:00Z'
    }
  ]
  console.log('Initializing mockFeedback with', mockFeedback.length, 'items')
  localStorage.setItem('mockFeedback', JSON.stringify(mockFeedback))
  
  console.log('Mock data initialization complete!')
}

export const getMockData = (key) => {
  const data = localStorage.getItem(key)
  const parsedData = data ? JSON.parse(data) : []
  console.log(`Getting mock data for ${key}:`, parsedData.length, 'items')
  return parsedData
}

export const setMockData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data))
}

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}