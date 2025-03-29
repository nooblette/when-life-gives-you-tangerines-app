import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "https://21aacb63-5643-4e3d-89e0-dda8ed5d6cf0.mock.pstmn.io";
const ITEMS_API_URL = `${API_BASE_URL}/items`;
const ORDER_API_URL = `${API_BASE_URL}/order`;

const OrderForm = () => {
  const navigate = useNavigate();
  
  // 상품 목록 Mock 데이터
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState({});
  const [form, setForm] = useState({
    name: '',
    recipient: '',
    sameAsOrderer: false,
    phone: '',
    address: '',
    detailAddress: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // 상품 목록 세팅 (API 호출)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(ITEMS_API_URL);
        if (!response.ok) {
          throw new Error('상품 목록을 불러오는 데 실패했습니다.');
        }
        const data = await response.json();
        setProducts(data.items);

        const initialOrderItems = {};
        data.items.forEach(item => {
          initialOrderItems[item.id] = 0;
        });
        
        setOrderItems(initialOrderItems);
      } catch (error) {
        console.error('상품 목록 가져오기 오류:', error);
        alert('상품 목록을 가져오는 데 실패했습니다. 나중에 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    };

    // 함수 정의 후 호출
    fetchProducts();
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
    
    setOrderItems(prev => ({
      ...prev,
      [id]: value < 0 ? 0 : value
    }));
  };

  // 입력 폼 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'phone' ? formatPhoneNumber(value) : value;

    setForm(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // 에러 상태 초기화
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // 전화번호 자동 하이픈 포맷
  const formatPhoneNumber = (value) => {
    // 숫자만 남기기
    const numbersOnly = value.replace(/\D/g, '');
  
    // 010-1234-5678 패턴 적용
    return numbersOnly
      .replace(/^(\d{3})(\d{4})(\d{0,4})$/, (_, p1, p2, p3) => {
        return p3 ? `${p1}-${p2}-${p3}` : `${p1}-${p2}`;
      });
  };

  // 주문자=받는사람 체크박스 핸들러
  const handleSameAsOrderer = (e) => {
    const checked = e.target.checked;
    setForm(prev => ({
      ...prev,
      sameAsOrderer: checked,
      recipient: checked ? prev.name : ''
    }));
  };

  // 폼 유효성 검사
  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name.trim()) {
      newErrors.name = '주문자 이름을 입력해주세요';
    }
    
    if (!form.recipient.trim()) {
      newErrors.recipient = '받는 사람 이름을 입력해주세요';
    }
    
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(form.phone)) {
      newErrors.phone = '연락처를 010-XXXX-XXXX 형식으로 입력해주세요';
    }
    
    if (!form.address.trim()) {
      newErrors.address = '주소를 입력해주세요';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 주문 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // 주문할 상품 필터링 (수량 > 0)
    const orderedItems = Object.entries(orderItems)
      .filter(([_, quantity]) => quantity > 0)
      .map(([id, quantity]) => {
        const product = products.find(p => p.id === parseInt(id));
        return {
          productId: parseInt(id),
          name: product.name,
          quantity,
          price: product.price
        };
      });
    
    if (orderedItems.length === 0) {
      alert('주문할 상품을 선택해주세요');
      return;
    }
    
    // 서버에 전송할 주문 데이터
    const orderData = {
      customer: {
        name: form.name,
        recipient: form.recipient,
        phone: form.phone,
        address: form.address,
        detailAddress: form.detailAddress
      },
      items: orderedItems,
      totalAmount: orderedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
    
    // 주문 생성 API 호출
    try {
      const response = await fetch(ORDER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if(!response.ok) {
        throw new Error('주문 생성에 실패했습니다.')
      }

      const {orderId} = await response.json();

      // orderId를 전달하며 결제 페이지로 이동
      
      // TODO 테스트용 콘솔 출력, 지울 것
      console.log(orderId) 
      navigate(`/payment?orderId=${orderId}`);
    } catch (error) {
      console.log('주문 요청 중 오류 발생: ', error);
      alert('주문 요청 중 문제가 발생했습니다. 다시 시도해주세요.')
    }

    // TODO 테스트용 콘솔 출력, 지울 것
    console.log('주문 데이터:', orderData);
  };

  // 총 주문 금액 계산
  const calculateTotal = () => {
    return products.reduce((total, product) => {
      return total + (product.price * (orderItems[product.id] || 0));
    }, 0);
  };

  if (isLoading) {
    return (
      <LoadingSpinner />
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <header className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <h1 className="text-lg font-bold text-center text-gray-800">제주 감귤</h1>
      </header>
      
      <div className="max-w-md mx-auto p-4">
        {/* 상품 목록 섹션 */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4 text-gray-800">상품 목록</h2>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {products.map(product => (
              <div key={product.id} className="p-4 border-b border-gray-100 last:border-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{product.name}</h3>
                    <div className="text-sm text-gray-500 mt-1">
                      <span>{product.weight}</span>
                      <span className="ml-2 font-medium text-gray-700">{product.price.toLocaleString()}원</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button 
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600"
                      onClick={() => handleQuantityChange(product.id, orderItems[product.id] - 1)}
                    >
                      -
                    </button>
                    <input
                      type="text"
                      value={orderItems[product.id]}
                      onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 0)}
                      className="w-10 text-center border-0 bg-transparent"
                    />
                    <button 
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-400 text-white"
                      onClick={() => handleQuantityChange(product.id, orderItems[product.id] + 1)}
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
              <span className="font-bold text-lg text-orange-600">{calculateTotal().toLocaleString()}원</span>
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
                  className={`w-full p-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  placeholder="이름을 입력해주세요"
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
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
                    <label htmlFor="sameAsOrderer" className="text-sm text-gray-600">
                      주문자와 동일
                    </label>
                  </div>
                </div>
                <input
                  type="text"
                  name="recipient"
                  value={form.recipient}
                  onChange={handleInputChange}
                  className={`w-full p-3 border ${errors.recipient ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  placeholder="받는 분 이름을 입력해주세요"
                />
                {errors.recipient && <p className="mt-1 text-sm text-red-500">{errors.recipient}</p>}
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
                  className={`w-full p-3 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  placeholder="010-0000-0000"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
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
                  className={`w-full p-3 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  placeholder="주소를 입력해주세요"
                />
                {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="상세 주소를 입력해주세요"
                />
              </div>
            </div>
          </section>
          
          {/* 주문하기 버튼 */}
          <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg">
            <button
              type="submit"
              className="w-full p-4 bg-orange-400 text-white font-bold rounded-lg shadow-sm hover:bg-orange-300 transition"
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