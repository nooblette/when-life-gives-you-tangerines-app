export const isValidOrderData = (data) => {
    if (!data) return false;
    if (!Array.isArray(data.items) || data.items.length === 0) return false;
  
    const requiredFields = ['name', 'phone', 'address'];
    if (
      !data.customer ||
      requiredFields.some((field) => !data.customer[field] || typeof data.customer[field] !== 'string')
    ) {
      return false;
    }
  
    if (!data.totalAmount || typeof data.totalAmount !== 'number') {
      return false;
    }
  
    if (!data.orderId || typeof data.orderId !== 'string' && typeof data.orderId !== 'number') {
      return false;
    }
  
    return true;
  };
  