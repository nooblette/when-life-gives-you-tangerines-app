import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_CONFIG } from "../config/api";

const MAX_LENGTH = 80;

const OrderForm = () => {
  const navigate = useNavigate();
  const privacyCheckboxRef = useRef(null);

  // 상품 목록 Mock 데이터
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState({});
  const [form, setForm] = useState({
    name: "",
    recipient: "",
    sameAsOrderer: false,
    phone: "",
    address: "",
    detailAddress: "",
    zipCode: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  // Daum 우편번호 스크립트 로드
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // 우편번호 검색 팝업 열기
  const openAddressPopup = () => {
    if (window.daum && window.daum.Postcode) {
      new window.daum.Postcode({
        oncomplete: function (data) {
          setForm((prev) => ({
            ...prev,
            zipCode: data.zonecode,
            address: data.address,
          }));

          // 주소 관련 에러 제거
          if (errors.address) {
            setErrors((prev) => ({
              ...prev,
              address: null,
            }));
          }
        },
      }).open();
    } else {
      alert("주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
    }
  };

  useEffect(() => {
    const abortController = new AbortController();

    // 세션 활성화
    const activateSession = async () => {
      try {
        await fetch(API_CONFIG.SESSIONS, {
          method: "POST",
          credentials: "include",
          signal: abortController.signal,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("세션 활성화 실패:", error);
        }
      }
    };

    // 상품 목록 세팅
    const fetchProducts = async () => {
      try {
        const response = await fetch(API_CONFIG.ITEMS_LIST, {
          signal: abortController.signal,
        });
        if (!response.ok) {
          throw new Error("상품 목록을 불러오는 데 실패했습니다.");
        }
        const data = await response.json();
        setProducts(data.items);

        const initialOrderItems = {};
        data.items.forEach((item) => {
          initialOrderItems[item.id] = 0;
        });

        setOrderItems(initialOrderItems);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("상품 목록 가져오기 오류:", error);
          alert(
            "상품 목록을 가져오는 데 실패했습니다. 나중에 다시 시도해주세요."
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    activateSession();
    fetchProducts();

    return () => {
      abortController.abort();
    };
  }, []);

  // 로딩 스피너
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-300 border-t-orange-500 mb-4"></div>
    </div>
  );

  // 수량 변경 핸들러
  const handleQuantityChange = (id, value) => {
    if (isNaN(value)) return;

    const product = products.find(p => p.id === id);
    if (!product) return;

    if (value > product.stock) {
      alert(`주문 가능한 수량을 확인해 주세요\n(최대 주문 가능: ${product.stock}개)`);
      return;
    }

    setOrderItems((prev) => ({
      ...prev,
      [id]: value < 0 ? 0 : value,
    }));
  };

  // 입력 폼 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === "phone" ? formatPhoneNumber(value) : value;

    // 81자부터는 입력 막기
    const textFields = ['name', 'recipient', 'address', 'detailAddress'];
    if (textFields.includes(name) && newValue.length > MAX_LENGTH) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // 80자 초과 체크 및 에러 처리
    if (textFields.includes(name)) {
      if (newValue.length >= MAX_LENGTH) {
        setErrors((prev) => ({
          ...prev,
          [name]: "글자수가 너무 길어요",
        }));
      } else {
        // 에러 상태 초기화
        if (errors[name]) {
          setErrors((prev) => ({
            ...prev,
            [name]: null,
          }));
        }
      }
    } else {
      // 에러 상태 초기화 (전화번호 등 다른 필드)
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: null,
        }));
      }
    }
  };

  // 전화번호 자동 하이픈 포맷
  const formatPhoneNumber = (value) => {
    // 숫자만 남기기
    const numbersOnly = value.replace(/\D/g, "");

    // 010-1234-5678 패턴 적용
    return numbersOnly.replace(/^(\d{3})(\d{4})(\d{0,4})$/, (_, p1, p2, p3) => {
      return p3 ? `${p1}-${p2}-${p3}` : `${p1}-${p2}`;
    });
  };

  // 주문자=받는사람 체크박스 핸들러
  const handleSameAsOrderer = (e) => {
    const checked = e.target.checked;
    setForm((prev) => ({
      ...prev,
      sameAsOrderer: checked,
      recipient: checked ? prev.name : "",
    }));
  };

  // 폼 유효성 검사
  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "주문자 이름을 입력해주세요";
    } else if (form.name.length >= MAX_LENGTH) {
      newErrors.name = "글자수가 너무 길어요";
    }

    if (!form.recipient.trim()) {
      newErrors.recipient = "받는 사람 이름을 입력해주세요";
    } else if (form.recipient.length >= MAX_LENGTH) {
      newErrors.recipient = "글자수가 너무 길어요";
    }

    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(form.phone)) {
      newErrors.phone = "연락처를 010-XXXX-XXXX 형식으로 입력해주세요";
    }

    if (!form.address.trim()) {
      newErrors.address = "주소를 입력해주세요";
    } else if (form.address.length >= MAX_LENGTH) {
      newErrors.address = "글자수가 너무 길어요";
    }

    if (form.detailAddress.length >= MAX_LENGTH) {
      newErrors.detailAddress = "글자수가 너무 길어요";
    }

    if (!form.zipCode.trim()) {
      newErrors.zipCode = "우편번호를 입력해주세요";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 주문 처리
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 개인정보 동의 체크 확인
    if (!privacyAgreed) {
      // 체크박스로 스크롤
      privacyCheckboxRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      // 체크박스에 포커스
      privacyCheckboxRef.current?.focus();
      return;
    }

    if (!validateForm()) {
      return;
    }

    // 주문할 상품 필터링 (수량 > 0)
    const orderedItems = Object.entries(orderItems)
      .filter(([_, quantity]) => quantity > 0)
      .map(([id, quantity]) => {
        const product = products.find((p) => p.id === parseInt(id));
        return {
          id: parseInt(id),
          name: product.name,
          quantity,
          price: product.price,
        };
      });

    if (orderedItems.length === 0) {
      alert("주문할 상품을 선택해주세요");
      return;
    }

    // 서버에 전송할 주문 데이터
    const orderData = {
      customer: {
        name: form.name,
        recipient: form.recipient,
        phone: form.phone,
        zipCode: form.zipCode,
        address: form.address,
        detailAddress: form.detailAddress,
      },
      items: orderedItems,
      totalAmount: orderedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
      orderName: (() => {
        return `${orderedItems[0].name} ${orderedItems[0].quantity}개${
          orderedItems.length > 1 ? ` 외 ${orderedItems.length - 1}건` : ""
        }`;
      })(),
    };

    // 주문 생성 API 호출
    try {
      const response = await fetch(API_CONFIG.ORDERS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
        credentials: "include",
      });

      if (!response.ok) {
        // 서버가 내려준 message가 있으면 사용, 없으면 기본 메시지 사용
        const error = await response.json();
        throw new Error(JSON.stringify(
          { 
            message: error.message || "주문 생성에 실패했습니다.", 
            code: error.code || "INVALID_ORDER_DATA" 
          }
        ));
      }

      const { orderId } = await response.json();

      // orderId를 전달하며 결제 페이지로 이동
      navigate(`/payment?orderId=${orderId}`);
    } catch (error) {
      // 에러 객체에서 message와 code 파싱
      let message = "주문 요청 중 문제가 발생했습니다.";
      let code = "INVALID_ORDER_DATA";

      try {
        const parsed = JSON.parse(error.message);
        message = parsed.message || message;
        code = parsed.code || code;
      } catch (e) {
      }

      navigate(`/fail?message=${encodeURIComponent(message)}&code=${encodeURIComponent(code)}`);
    }
  };

  // 총 주문 금액 계산
  const calculateTotal = () => {
    return products.reduce((total, product) => {
      return total + product.price * (orderItems[product.id] || 0);
    }, 0);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <header className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <h1 className="text-lg font-bold text-center text-gray-800">
          래아농원
        </h1>
      </header>

      <div className="max-w-md mx-auto p-4">
        {/* 상품 목록 섹션 */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4 text-gray-800">상품 목록</h2>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {products.map((product) => (
              <div
                key={product.id}
                className="p-4 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      product.stock === 0 ? "text-gray-400" : "text-gray-800"
                    }`}>
                      {product.name}
                    </h3>
                    <div className="text-sm text-gray-500 mt-1">
                      <span>{product.weight}</span>
                      <span className={`ml-2 font-medium ${
                        product.stock === 0 ? "text-gray-400" : "text-gray-700"
                      }`}>
                        {product.price.toLocaleString()}원
                      </span>
                      {product.stock === 0 ? (
                        <span className="ml-2 text-red-500 font-medium">
                          다 팔렸어요
                        </span>
                      ) : product.stock <= 5 && (
                        <span className="ml-2 text-red-500 font-medium">
                          {product.stock}개 남았어요!
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      className={`w-8 h-8 flex items-center justify-center rounded-full ${
                        product.stock === 0
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-gray-100 text-gray-600"
                      }`}
                      onClick={() =>
                        product.stock > 0 &&
                        handleQuantityChange(
                          product.id,
                          orderItems[product.id] - 1
                        )
                      }
                      disabled={product.stock === 0}
                    >
                      -
                    </button>
                    <input
                      type="text"
                      value={orderItems[product.id]}
                      onChange={(e) =>
                        product.stock > 0 &&
                        handleQuantityChange(
                          product.id,
                          parseInt(e.target.value) || 0
                        )
                      }
                      className={`w-10 text-center border-0 bg-transparent ${
                        product.stock === 0 ? "text-gray-400" : ""
                      }`}
                      disabled={product.stock === 0}
                    />
                    <button
                      className={`w-8 h-8 flex items-center justify-center rounded-full ${
                        product.stock === 0
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-orange-400 text-white"
                      }`}
                      onClick={() => {
                        if (product.stock > 0) {
                          const newQuantity = orderItems[product.id] + 1;
                          if (newQuantity <= product.stock) {
                            handleQuantityChange(product.id, newQuantity);
                          } else {
                            alert(`주문 가능한 수량을 확인해 주세요\n(최대 주문 가능: ${product.stock}개)`);
                          }
                        }
                      }}
                      disabled={product.stock === 0}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-orange-100 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">총 주문금액</span>
              <span className="font-bold text-lg text-orange-600">
                {calculateTotal().toLocaleString()}원
              </span>
            </div>
          </div>
        </section>

        {/* 주문 정보 입력 폼 */}
        <form onSubmit={handleSubmit}>
          <section className="mb-8">
            <h2 className="text-lg font-bold mb-4 text-gray-800">주문 정보</h2>
            <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  주문자 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  className={`w-full p-3 border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  placeholder="이름을 입력해주세요"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    받는 사람 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sameAsOrderer"
                      checked={form.sameAsOrderer}
                      onChange={handleSameAsOrderer}
                      className="mr-1"
                    />
                    <label
                      htmlFor="sameAsOrderer"
                      className="text-sm text-gray-600"
                    >
                      주문자와 동일
                    </label>
                  </div>
                </div>
                <input
                  type="text"
                  name="recipient"
                  value={form.recipient}
                  onChange={handleInputChange}
                  className={`w-full p-3 border ${
                    errors.recipient ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  placeholder="받는 분 이름을 입력해주세요"
                />
                {errors.recipient && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.recipient}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  연락처 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                  className={`w-full p-3 border ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  placeholder="010-0000-0000"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              {/* 우편번호 검색 추가 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  우편번호 <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="zipCode"
                    value={form.zipCode}
                    onChange={handleInputChange}
                    className={`flex-1 p-3 border ${
                      errors.zipCode ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
                    placeholder="우편번호"
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={openAddressPopup}
                    className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    검색
                  </button>
                </div>
                {errors.zipCode && (
                  <p className="mt-1 text-sm text-red-500">{errors.zipCode}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  주소 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleInputChange}
                  className={`w-full p-3 border ${
                    errors.address ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  placeholder="주소를 입력해주세요"
                  readOnly
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-red-500">{errors.address}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  상세 주소
                </label>
                <input
                  type="text"
                  name="detailAddress"
                  value={form.detailAddress}
                  onChange={handleInputChange}
                  className={`w-full p-3 border ${
                    errors.detailAddress ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  placeholder="상세 주소를 입력해주세요"
                />
                {errors.detailAddress && (
                  <p className="mt-1 text-xs text-red-500">{errors.detailAddress}</p>
                )}
              </div>
            </div>
          </section>

          {/* 개인정보 동의 섹션 */}
          <section className="mb-8">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-start">
                <input
                  ref={privacyCheckboxRef}
                  type="checkbox"
                  id="privacyAgreement"
                  checked={privacyAgreed}
                  onChange={(e) => setPrivacyAgreed(e.target.checked)}
                  className="mt-1 mr-2 w-4 h-4 text-orange-500 focus:outline-none"
                />
                <label htmlFor="privacyAgreement" className="text-sm font-medium text-gray-700">
                  <span className="text-red-500">[필수]</span> 개인정보 수집 및 이용에 동의합니다.
                  <div className="mt-2 text-xs text-gray-600 font-normal leading-relaxed">
                    - 수집 항목: 이름, 휴대폰번호, 주소, 우편번호<br />
                    - 수집 목적: 주문 처리, 배송, 고객 상담<br />
                    - 보유 기간: 전자상거래법에 따른 의무 보관기간 준수
                  </div>
                </label>
              </div>
            </div>
          </section>

          {/* 필수 안내사항 섹션 */}
          <section className="mb-24">
            <div className="text-xs text-gray-500 leading-relaxed space-y-3">
              <div>
                <div className="font-semibold mb-1">[안내사항]</div>
                <div className="space-y-0.5">
                  <div>• 원산지: 제주산(국산)</div>
                  <div>• 배송방법: 택배 / 배송예정일: 주문 후 2~4일 이내 발송</div>
                  <div>• 배송비: 무료</div>
                  <div>• 반품 및 환불 문의: 010-7343-0850 / min9hyuk@gmail.com</div>
                </div>
              </div>
              
              <div>
                <div className="font-semibold mb-1">[사업자 정보]</div>
                <div className="space-y-0.5">
                  <div>상호: 래아팜 | 대표: 홍길동 | 사업자등록번호: 123-45-67890</div>
                  <div>통신판매업 신고번호: 제 2025-제주-0000호</div>
                  <div>주소: 제주특별자치도 ○○ | 호스팅사: Vercel</div>
                </div>
              </div>

              <div className="pt-1">
                <div>주문 시 개인정보는 주문처리 및 배송을 위해 이용되며,</div>
                <div>전자상거래법에 따른 의무 보관기간 후 파기됩니다.</div>
              </div>
            </div>
          </section>

          {/* 주문하기 버튼 */}
          <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg">
            <button
              type="submit"
              disabled={!privacyAgreed}
              className={`w-full p-4 font-bold rounded-lg shadow-sm transition ${
                privacyAgreed
                  ? "bg-orange-400 text-white hover:bg-orange-300"
                  : "bg-orange-300 text-white cursor-not-allowed opacity-60"
              }`}
            >
              주문하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;