// src/pages/PaymentPage.js
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PaymentWidget from "../components/PaymentWidget";

const API_BASE_URL = "https://21aacb63-5643-4e3d-89e0-dda8ed5d6cf0.mock.pstmn.io";
const ORDER_API_URL = `${API_BASE_URL}/order`;

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate(); 
  const [orderData, setOrderData] = useState(null);
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (!orderId) return;

    // orderId로 주문 정보를 받아온다.
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${ORDER_API_URL}/${orderId}`);
        const data = await res.json();
        setOrderData(data);
      } catch (err) {
        navigate(`/fail?message=${encodeURIComponent("유효하지 않은 주문 정보")}&code=${encodeURIComponent("INVALID_ORDER_DATA")}`);
        console.error(err);
      }
    };

    fetchOrder();
  }, [orderId]);

  // 로딩 스피너
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-300 border-t-orange-500 mb-4"></div>
    </div>
  );
    
  if (!orderData) {
    return (
      <LoadingSpinner />
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">결제 페이지</h1>
      <PaymentWidget orderData={orderData} />
    </div>
  );
};

export default PaymentPage;
