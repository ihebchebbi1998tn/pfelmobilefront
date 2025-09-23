import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './hooks/AuthContext.jsx'
import { LanguageProvider } from './hooks/LanguageContext.jsx'
import { ChatProvider } from './hooks/ChatContext.jsx'
import { ChatUserToUserProvider } from './hooks/ChatUserToUserContext.jsx'
import { NotificationProvider } from './hooks/NotificationContext.jsx'
import { ColorModeProvider } from './hooks/ThemeContext.jsx'
import { OrganisationProvider } from './hooks/OrganisationContext.jsx'
import { initializeMockData } from './utils/mockData.js'
import 'leaflet/dist/leaflet.css'
import App from './App.jsx'

// Force initialize mock data on every app load to ensure consistency
console.log('App starting - force initializing mock data...')
initializeMockData()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <ColorModeProvider>
          <AuthProvider>
            <ChatProvider>
              <NotificationProvider>
                <ChatUserToUserProvider>
                  <OrganisationProvider>
                    <App />
                  </OrganisationProvider>
                </ChatUserToUserProvider>
              </NotificationProvider>
            </ChatProvider>
          </AuthProvider>
        </ColorModeProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>
)
