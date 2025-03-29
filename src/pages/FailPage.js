import { useSearchParams } from "react-router-dom";
import { FrownIcon } from "lucide-react";

function FailPage() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <header className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <h1 className="text-lg font-bold text-center text-gray-800">제주 감귤</h1>
      </header>

      <div className="max-w-md mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <FrownIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />

          <h2 className="text-xl font-bold text-red-600 mb-2">결제에 실패했어요</h2>
          <p className="text-sm text-gray-600 mb-4">
            죄송합니다. 주문서에서 결제를 다시 진행해주세요.
          </p>

          {/* 에러 코드만 노출 */}
          <p className="text-xs text-gray-400 mb-6">에러 코드: {code}</p>

          <a
            href="/"
            className="inline-block bg-orange-400 text-white px-6 py-3 rounded-lg font-semibold text-sm shadow-sm hover:bg-orange-300 transition"
          >
            다시 주문하기
          </a>
        </div>
      </div>
    </div>
  );
}

export default FailPage;