import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import "../src/assets/style.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    {/* <GoogleOAuthProvider clientId="25503459485-ujh01d85nff9svsahg6hv8ahif1pnoej.apps.googleusercontent.com"> */}
    <GoogleOAuthProvider clientId="290688775370-a38pei8rsila6pij39svvmmkkd77pe65.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);
