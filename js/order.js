async function getCurrentOrderData() {
  try {
    const customerProductOrderData = await formatSheetData(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${TABLE_CUSTOMER_PRODUCT}?key=${API_KEY}`
    );

    const customers = await formatSheetData(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${TABLE_CUSTOMER}?key=${API_KEY}`
    );

    const userId = localStorage.getItem("userId");

    const filteredData = customerProductOrderData.filter(
      (item) => Number(item.customer_id) === Number(userId)
    );

    const customerInfo = customers.find(
      (customer) => Number(customer.id) === Number(userId)
    );

    return {
      customerInfo,
      orderData: filteredData,
    };
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error.message);
    return [];
  }
}

async function getOrderDataWithProducts() {
  const orders = await getCurrentOrderData();
  const products = await getAllData();

  const ordersWithProducts = orders.orderData.map((order) => {
    const product = products.find((p) => p.id === order.product_id);
    return { ...order, product };
  });

  return ordersWithProducts;
}

async function showOrderPage() {
  const data = await getOrderDataWithProducts();
  const ordersListElement = document.getElementById("orders");
  const userInfoElement = document.getElementById("user");

  userInfoElement.innerHTML = "";
  ordersListElement.innerHTML = "";

  if (data.length === 0) {
    const noOrdersMessage = document.createElement("li");
    noOrdersMessage.textContent = "Bạn chưa đặt sản phẩm nào.";
    ordersListElement.appendChild(noOrdersMessage);
  } else {
    data.forEach((order) => {
      const orderItem = document.createElement("li");
      const selectedColor =
        order.product.color && Array.isArray(order.product.color)
          ? order.product.color.find(
              (color) => Number(color.id) === Number(order.color_id)
            )
          : null;
      const selectedSize =
        order.product.size && Array.isArray(order.product.size)
          ? order.product.size.find(
              (size) => Number(size.id) === Number(order.size_id)
            )
          : null;

      orderItem.innerHTML = `
          <strong>Mã đơn hàng:</strong> AMEE${order.id}<br>
          <strong>Tên sản phẩm:</strong> ${order.product.name} (Color: ${selectedColor.name}) (Size: ${selectedSize?.name})<br>
          <strong>Số lượng:</strong> ${order.quantity}<br>
          <strong>Tổng tiền:</strong> ${order.total_price}<br>
          <strong>Trạng thái:</strong> ${order.status}
        `;
      ordersListElement.appendChild(orderItem);
    });

    const orderData = await getCurrentOrderData();
    const customerInfo = orderData.customerInfo;

    if (customerInfo) {
      userInfoElement.innerHTML = `
        <li><strong>Tên:</strong> ${customerInfo.name}</li>
        <li><strong>Email:</strong> ${customerInfo.email}</li>
        <li><strong>Số điện thoại:</strong> ${customerInfo.phone}</li>
        <li><strong>Địa chỉ:</strong> ${customerInfo.address}</li>
      `;
    } else {
      userInfoElement.innerHTML =
        "<li>Không tìm thấy thông tin người dùng.</li>";
    }
  }
}
showOrderPage();

document.getElementById("logout").addEventListener("click", function () {
  localStorage.removeItem("userId");
  window.location.href = "/";
});
