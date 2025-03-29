import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircleIcon } from 'lucide-react';

const API_BASE_URL = "https://21aacb63-5643-4e3d-89e0-dda8ed5d6cf0.mock.pstmn.io";
const CONFIRM_API_URL = `${API_BASE_URL}/confirm`;
const ORDER_API_URL = `${API_BASE_URL}/order`;

function SuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 주문 정보 상태 변수
  const [orderData, setOrderData] = useState(null);

  const handleComplete = () => {
    navigate("/", { replace: true }); // 루트로 이동하되 히스토리는 덮어쓰기
  };
  
  useEffect(() => {
    // 쿼리 파라미터 값이 결제 요청할 때 보낸 데이터와 동일한지 반드시 확인하세요.
    // 클라이언트에서 결제 금액을 조작하는 행위를 방지할 수 있습니다.
    const requestData = {
      orderId: searchParams.get("orderId"),
      amount: searchParams.get("amount"),
      paymentKey: searchParams.get("paymentKey"),
    };

    async function confirm() {
      // TODO 서버에 API 호출하여 결제 금액 재확인, 주문 상태 업데이트
      const response = await fetch(CONFIRM_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const json = await response.json();

      if (!response.ok) {
        // 결제 실패 비즈니스 로직을 구현하세요.
        navigate(`/fail?message=${json.message}&code=${json.code}`);
        return;
      }

      // 결제 성공 비즈니스 로직
      // orderId로 주문 정보를 받아온다.
      const fetchOrder = async () => {
        try {
          const response = await fetch(`${ORDER_API_URL}/${requestData.orderId}`);
          const data = await response.json();

          // 주문 정보 상태 저장
          setOrderData(data);
        } catch (err) {
          console.error(err);
          navigate(`/fail?message=${json.message}&code=${json.code}`);
        }
      };

      fetchOrder()
    }

    confirm();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* 주문 완료 상단 섹션 */}
      <div className="bg-white py-12 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(10)].map((_, index) => (
            <CheckCircleIcon 
              key={index} 
              className="absolute text-orange-100/50"
              style={{
                width: '60px',
                height: '60px',
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: 'rotate(45deg)',
                opacity: 0.2
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10">
          <CheckCircleIcon 
            className="mx-auto mb-4 text-green-400" 
            size={64} 
            strokeWidth={1.5}
          />
          <h1 className="text-2xl font-bold text-gray-800">주문 완료</h1>
          <p className="text-gray-600 mt-2">감사합니다</p>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {orderData ? (
          <>
            {/* 주문 정보 섹션 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold mb-4 text-gray-800">주문 정보</h2>
              <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">주문자명</span>
                  <span className="text-gray-800">{orderData.customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">받는 사람</span>
                  <span className="text-gray-800">{orderData.customer.recipient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">연락처</span>
                  <span className="text-gray-800">{orderData.customer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">주소</span>
                  <span className="text-gray-800 text-right">
                    {orderData.customer.address}
                    <br />
                    {orderData.customer.detailAddress}
                  </span>
                </div>
              </div>
            </section>

            {/* 상품 목록 섹션 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold mb-4 text-gray-800">상품 목록</h2>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {orderData.items.map(product => (
                  <div 
                    key={product.id} 
                    className="p-4 border-b border-gray-100 last:border-0 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{product.name}</h3>
                      <div className="text-sm text-gray-500 mt-1">
                        <span>{product.quantity}개</span>
                        <span className="ml-2 font-medium text-gray-700">
                          {(product.price * product.quantity).toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* 총 주문금액 */}
              <div className="mt-4 p-4 bg-orange-100 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">총 주문금액</span>
                  <span className="font-bold text-lg text-orange-600">
                    {orderData.totalAmount.toLocaleString()}원
                  </span>
                </div>
              </div>
            </section>

            {/* 고정된 하단 버튼 */}
            <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg">
              <button
                type="button"
                onClick={handleComplete}
                className="w-full p-4 bg-orange-400 text-white font-bold rounded-lg shadow-sm hover:bg-orange-300 transition"
              >
                확인
              </button>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 mt-20">
            결제 정보를 불러오는 중입니다...
          </div>
        )}
      </div>
    </div>
  );
}

export default SuccessPage;