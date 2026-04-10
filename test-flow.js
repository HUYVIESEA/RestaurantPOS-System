const API_URL = 'http://localhost:5000/api';

async function testFlow() {
  try {
    console.log('--- Bắt đầu Test Flow Hệ thống POS ---');

    // 1. Đăng nhập
    console.log('\n1. Đang đăng nhập (admin/Admin@123)...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'Admin@123' })
    });
    
    if (!loginRes.ok) {
      const errText = await loginRes.text();
      throw new Error(`Đăng nhập thất bại: ${loginRes.status} - ${errText}`);
    }
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('✅ Đăng nhập thành công! Token:', token.substring(0, 20) + '...');

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // Lấy danh sách sản phẩm để chọn
    console.log('\n- Lấy danh sách sản phẩm...');
    const productsRes = await fetch(`${API_URL}/products`, { headers });
    const products = await productsRes.json();
    if (!products.length) throw new Error('Không có sản phẩm nào trong hệ thống!');
    const product1 = products[0];
    const product2 = products.length > 1 ? products[1] : products[0];
    console.log(`✅ Đã lấy sản phẩm: ${product1.name}, ${product2.name}`);

    // Lấy danh sách bàn
    console.log('\n- Lấy danh sách bàn trống...');
    const tablesRes = await fetch(`${API_URL}/tables`, { headers });
    const tables = await tablesRes.json();
    const availableTable = tables.find(t => t.isAvailable);
    if (!availableTable) throw new Error('Không còn bàn trống!');
    console.log(`✅ Chọn bàn: Bàn ${availableTable.tableNumber}`);

    // 2. Tạo đơn hàng (Order)
    console.log('\n2. Tạo đơn hàng mới...');
    const orderItems = [
      { productId: product1.id, quantity: 2, unitPrice: product1.price, notes: "Không cay" },
      { productId: product2.id, quantity: 1, unitPrice: product2.price, notes: "" }
    ];
    
    const newOrder = {
      tableId: availableTable.id,
      notes: "Khách VIP",
      items: orderItems
    };

    const orderRes = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(newOrder)
    });
    
    if (!orderRes.ok) {
      const errText = await orderRes.text();
      throw new Error(`Tạo đơn thất bại: ${orderRes.status} - ${errText}`);
    }
    
    const orderData = await orderRes.json();
    const orderId = orderData.id;
    console.log(`✅ Tạo đơn hàng thành công! Order ID: ${orderId}`);

    // 3. Chuyển trạng thái sang Preparing (Báo Bếp)
    console.log('\n3. Chuyển đơn hàng sang bếp (Trạng thái: Preparing)...');
    const prepRes = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify('Preparing')
    });
    
    if (!prepRes.ok) {
      const errText = await prepRes.text();
      throw new Error(`Cập nhật trạng thái bếp thất bại: ${prepRes.status} - ${errText}`);
    }
    console.log('✅ Đã báo bếp thành công!');

    // Giả lập bếp làm xong
    console.log('\n- Bếp hoàn thành món (Trạng thái: Served)...');
    const servedRes = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify('Served')
    });
    if (!servedRes.ok) throw new Error(`Cập nhật trạng thái Served thất bại`);
    console.log('✅ Món đã được phục vụ lên bàn!');

    // 4. Thanh toán (Payment)
    console.log('\n4. Thanh toán đơn hàng...');
    const paymentData = {
      receivedAmount: orderData.totalAmount,
      paymentMethod: 'Cash'
    };

    const payRes = await fetch(`${API_URL}/orders/${orderId}/complete`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(paymentData)
    });
    
    if (!payRes.ok) {
      const errText = await payRes.text();
      throw new Error(`Thanh toán thất bại: ${payRes.status} - ${errText}`);
    }
    
    const payResult = await payRes.json();
    console.log(`✅ Thanh toán thành công! Trạng thái: ${payResult.paymentStatus}, Số tiền: ${payResult.totalAmount}`);

    console.log('\n🎉 TEST LUỒNG HỆ THỐNG THÀNH CÔNG! 🎉');

  } catch (error) {
    console.error('\n❌ TEST THẤT BẠI:', error.message);
  }
}

testFlow();
