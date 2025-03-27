import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API_BASE_URL = "https://21aacb63-5643-4e3d-89e0-dda8ed5d6cf0.mock.pstmn.io";
const CONFIRM_API_URL = `${API_BASE_URL}/confirm`;

function SuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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

      // 결제 성공 비즈니스 로직을 구현하세요.
      navigate(`/success?orderId=${requestData.orderId}&amount=${requestData.amount}&paymentKey=${requestData.paymentKey}`);
    }

    confirm();
  }, []);

  return (
    <div className="result wrapper">
      <div className="box_section">
        <h2>
          결제 성공
        </h2>
        <p>{`주문번호: ${searchParams.get("orderId")}`}</p>
        <p>{`결제 금액: ${Number(
          searchParams.get("amount")
        ).toLocaleString()}원`}</p>
        <p>{`paymentKey: ${searchParams.get("paymentKey")}`}</p>
      </div>
    </div>
  );
}

export default SuccessPage;