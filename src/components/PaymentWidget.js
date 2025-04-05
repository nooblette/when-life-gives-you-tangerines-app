import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isValidOrderData } from '../utils/validateOrderData';

const CLIENT_KEY = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

const PaymentWidget = ({ orderData }) => {
  const navigate = useNavigate();

  // TODO 테스트용 콘솔 출력, 지울 것
  console.log(orderData)
  const [myState, setMyState] = useState(null);
  const [widgets, setWidgets] = useState(null);
  const [ready, setReady] = useState(false);
  const [amount] = useState({
    currency: "KRW",
    value: orderData.totalAmount,
  });

  useEffect(() => {
    if (!isValidOrderData(orderData)) {
      navigate(`/fail?message=${encodeURIComponent("유효하지 않은 주문 정보")}&code=${encodeURIComponent("INVALID_ORDER_DATA")}`);
    }
  }, [orderData, navigate]);

  useEffect(() => {
    const init = async () => {
      // 결제 위젯 객체 초기화
      const tossPayments = await loadTossPayments(CLIENT_KEY);

      // 비회원 결제
      const instance = tossPayments.widgets({
        customerKey: ANONYMOUS
      });
      setWidgets(instance);
    };

    init();
  }, []);

  // iOS Safari의 shapshot으로 인한 위젯 중복 오류 방지
  useEffect(() => {
    const resetMyState = (event) => {
      if(event?.persisted) {
        setMyState("initState");
      }
    };
  
    // 전체 페이지 새로고침 없이 React 내부 상태만 초기화
    window.addEventListener("pageshow", resetMyState);

    return () => {
      window.removeEventListener("pageshow", resetMyState);
    };
  }, []);

  useEffect(() => {
    const renderPaymentWidgets = async () => {
      if (!widgets) return;

      // 주문의 결제 금액 세팅
      await widgets.setAmount(amount);

      await Promise.all([
        // 결제 UI 렌더링
        widgets.renderPaymentMethods({
          selector: "#payment-method",
          variantKey: "DEFAULT",
        }),
        // 이용약관 UI 렌더링
        widgets.renderAgreement({
          selector: "#agreement",
          variantKey: "AGREEMENT",
        }),
      ]);
      setReady(true);
    };

    renderPaymentWidgets();
  }, [widgets]);

  if (!isValidOrderData(orderData)) {
    return;
  }

  return (
    <div className="wrapper">
      <div className="box_section">
        {/* 결제 UI */}
        <div id="payment-method" />
        {/* 이용약관 UI */}
        <div id="agreement" />
      </div>

      {/* 결제하기 */}
      <button
        className="button w-full p-4 bg-orange-400 text-white font-bold rounded-lg shadow-sm hover:bg-orange-300 transition"
        disabled={!ready}
        onClick={async () => {
          if (!isValidOrderData(orderData)) {
            alert("결제에 필요한 정보가 누락되었습니다.");
            return;
          }
          
          try {
            await widgets.requestPayment({
              orderId: orderData.orderId,
              orderName: orderData.items.map((i) => i.name).join(", "),
              successUrl: `${window.location.origin}/success`,
              failUrl: `${window.location.origin}/fail`,
              customerEmail: "customer@example.com",
              customerName: orderData.customer.name,
              customerMobilePhone: orderData.customer.phone.replace(/\D/g, ""),
            }); 
          } catch (error) {
            console.log(error);
          }
        }}
      >
        결제하기
      </button>
    </div>
  );
};

export default PaymentWidget;
