import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from "@vercel/analytics";
import './styles/tailwind.css';
import OrderPage from './pages/OrderPage';
import PaymentPage from './pages/PaymentPage';
import SuccessPage from './pages/SuccessPage';
import FailPage from './pages/FailPage';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<OrderPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/fail" element={<FailPage />} />
        </Routes>
      </BrowserRouter>
      <Analytics />
    </>
  );
}

export default App;