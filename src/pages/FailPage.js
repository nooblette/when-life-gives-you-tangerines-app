import { useSearchParams } from "react-router-dom";
import { FrownIcon } from "lucide-react";

function FailPage() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const errorMessage =
    searchParams.get("message") || "알 수 없는 이유로 결제에 실패했어요.";

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-white py-12 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(10)].map((_, index) => (
            <FrownIcon
              key={index}
              className="absolute text-red-100/50"
              style={{
                width: "60px",
                height: "60px",
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: "rotate(-20deg)",
                opacity: 0.15,
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <FrownIcon
            className="mx-auto mb-4 text-red-400"
            size={64}
            strokeWidth={1.5}
          />
          <h1 className="text-2xl font-bold text-gray-800">결제 실패</h1>
          <p className="text-gray-600 mt-2">{errorMessage}</p>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 text-center">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-500 mb-2">
            실패 코드: {code || "알 수 없음"}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            계속 실패하면 {" "}
            <a
              href="sms:+821073430850?"
              className="text-orange-500 underline"
            >
              010-7343-0850
            </a>
            으로 연락주세요.
          </p>
        </div>
      </div>

      {/* 고정 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg">
        <button
          onClick={handleGoHome}
          className="w-full p-4 bg-orange-400 text-white font-bold rounded-lg shadow-sm hover:bg-orange-300 transition"
        >
          다시 주문하기
        </button>
      </div>
    </div>
  );
}

export default FailPage;
