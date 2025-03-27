// src/pages/PaymentPage.js
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PaymentWidget from "../components/PaymentWidget";

const API_BASE_URL = "https://21aacb63-5643-4e3d-89e0-dda8ed5d6cf0.mock.pstmn.io";
const ORDER_API_URL = `${API_BASE_URL}/order`;

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
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
        alert("주문 정보를 불러오지 못했습니다.");
        console.error(err);
      }
    };

    fetchOrder();
  }, [orderId]);

  // 로딩 스피너
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-orange-400"></div>
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
