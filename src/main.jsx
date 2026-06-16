import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeProvider'
import './index.css'
import App from './App.jsx'

let PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key. Set VITE_CLERK_PUBLISHABLE_KEY in your .env file.")
}

// Clean key from whitespace/quotes and extract the first key if multiple are concatenated
PUBLISHABLE_KEY = PUBLISHABLE_KEY.trim().replace(/^["']|["']$/g, "");
const secondPkIndex = PUBLISHABLE_KEY.indexOf("pk_", 2);
if (secondPkIndex > 0) {
  console.warn("Multiple Clerk Publishable Keys detected. Using the first key.");
  PUBLISHABLE_KEY = PUBLISHABLE_KEY.substring(0, secondPkIndex);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      afterSignOutFallbackRedirectUrl="/"
    >
      <ThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </ClerkProvider>
  </StrictMode>,
)
