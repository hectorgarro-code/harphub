import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './hooks/useAuth'
import { MusicProvider } from './hooks/useMusic'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <GoogleOAuthProvider clientId="940006018474-8365o1nnpovtbt3g13d8koa6c1e9sl9k.apps.googleusercontent.com">
                <AuthProvider>
                    <MusicProvider>
                        <App />
                    </MusicProvider>
                </AuthProvider>
            </GoogleOAuthProvider>
        </BrowserRouter>
    </StrictMode>,
)
