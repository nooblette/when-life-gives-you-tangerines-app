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
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

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
      setLoading(true);
      // TODO 서버에 API 호출하여 결제 금액 재확인, 주문 상태 업데이트
      try {
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

        // 결제 확인 성공
        setConfirmed(true);

        // 결제 성공 비즈니스 로직
        // orderId로 주문 정보를 받아온다.
        try {
          const orderResponse = await fetch(`${ORDER_API_URL}/${requestData.orderId}`);
          const orderData = await orderResponse.json();

          // 주문 정보 상태 저장
          setOrderData(orderData);
        } catch (err) {
          console.error(err);
          navigate(`/fail?message=${json.message}&code=${json.code}`);
        }
      } catch (error) {
        console.error(error);
        navigate(`/fail?message=결제 처리 중 오류가 발생했습니다&code=UNKNOWN_ERROR`);
      } finally {
        setLoading(false);
      }
    }

    confirm();
  }, [navigate, searchParams]);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {loading ? (
        // 로딩 중 화면
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-4 border-orange-300 border-t-orange-500 rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-medium text-gray-700">결제 확인 중...</h2>
          <p className="text-gray-500 mt-2">잠시만 기다려 주세요</p>
        </div>
      ) : (
        <>
          {/* 주문 완료 상단 섹션 - 결제 확인 후에만 표시 */}
          {confirmed && (
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
          )}

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
            ) : confirmed ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-300 border-t-orange-500 mb-4"></div>
                <p className="text-gray-600">주문 정보를 불러오는 중입니다...</p>
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-red-500">결제 정보를 확인하는 데 실패했습니다.</p>
                <button
                  onClick={handleComplete}
                  className="mt-4 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg"
                >
                  홈으로 돌아가기
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default SuccessPage;