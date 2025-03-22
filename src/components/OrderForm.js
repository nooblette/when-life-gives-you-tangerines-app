import React, { useState, useEffect } from 'react';

const OrderForm = () => {
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

  // Mock API 호출
  useEffect(() => {
    // API 호출 시뮬레이션
    setTimeout(() => {
      const mockProducts = [
        { id: 1, name: '제주 노지 감귤 (10~15개입)', weight: '10kg', price: 12000 },
        { id: 2, name: '제주 노지 감귤 (20~25개입)', weight: '15kg', price: 20000 },
        { id: 3, name: '자연 방목 계란', weight: '10개입', price: 6000 },
        { id: 4, name: '친환경 샐러드', weight: '200g', price: 4500 },
        { id: 5, name: '프리미엄 소고기', weight: '500g', price: 25000 },
        { id: 6, name: '통밀 식빵', weight: '400g', price: 5800 }
      ];
      
      setProducts(mockProducts);
      
      // 초기 주문 상태 설정
      const initialOrderItems = {};
      mockProducts.forEach(product => {
        initialOrderItems[product.id] = 0;
      });
      
      setOrderItems(initialOrderItems);
      setIsLoading(false);
    }, 1000);
  }, []);

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
  const handleSubmit = (e) => {
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
    
    // API 호출 시뮬레이션
    console.log('주문 데이터:', orderData);
    alert('주문이 완료되었습니다!');
  };

  // 총 주문 금액 계산
  const calculateTotal = () => {
    return products.reduce((total, product) => {
      return total + (product.price * (orderItems[product.id] || 0));
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-600">로딩 중...</div>
      </div>
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
                  type="text"
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