// lay link web
const pathName = window.location.pathname;

// lay du lieu trong localStorage
function getCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  return cart;
}

// xoa du lieu trong localStorage
function removeCart() {
  localStorage.removeItem("cart");
}

// lay du lieu ra trang cart.html
function getCartPage(pathName) {
  if (pathName !== "/pages/cart.html") return;
  //Thuanfix2
  const selectedCarts = [];
  //---

  const cart = getCart();
  const listCartElement = document.querySelector(".list-cart");
  listCartElement.innerHTML = "";
  cart.forEach((item) => {
    const selectedCheckBox = document.createElement("input");
    selectedCheckBox.type = "checkbox";
    selectedCheckBox.checked = false;
    selectedCheckBox.addEventListener("change", (event) => {
      if (event.target.checked) {
        selectedCarts.push(item);
      } else {
        selectedCarts = selectedCarts.filter(
          (product) => product.id !== item.id
        );
      }
      localStorage.setItem("checkout", JSON.stringify(selectedCarts));
    });
    const cartItemElement = document.createElement("div");
    cartItemElement.className = "cart-item";
    const imageElement = document.createElement("img");
    imageElement.src = item.image;
    const nameCartProductElement = document.createElement("p");
    nameCartProductElement.textContent = item.name;
    const priceCartProductElement = document.createElement("p");

    // Thuanfix
    const formattedPrice = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(
      Number(item.price.replace(/\./g, "").replace(",", ".")) * item.number
    );

    priceCartProductElement.textContent = formattedPrice;

    const inputElement = document.createElement("input");
    inputElement.type = "number";
    inputElement.name = "number";
    inputElement.value = item.number;
    inputElement.min = "1";
    inputElement.max = "5";
    inputElement.step = "1";
    inputElement.addEventListener("input", () => {
      const quantity = parseInt(inputElement.value, 10);
      const index = cart.findIndex(
        (product) =>
          product.id === item.id &&
          product.color_id === item.color_id &&
          product.size_id === item.size_id
      );

      if (index !== -1) {
        cart[index].number = quantity;
        const formattedPrice = new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(
          Number(item.price.replace(/\./g, "").replace("₫", "").trim()) *
            cart[index].number
        );

        priceCartProductElement.textContent = formattedPrice;

        localStorage.setItem("cart", JSON.stringify(cart));
      }
    });

    const buttonElement = document.createElement("button");
    buttonElement.id = "remove";
    buttonElement.className = "remove";
    buttonElement.innerHTML = '<i class="fas fa-trash fa-2x"></i>';
    buttonElement.addEventListener("click", () => {
      const index = cart.findIndex(
        (product) =>
          product.id === item.id &&
          product.color_id === item.color_id &&
          product.size_id === item.size_id
      );
      cart.splice(index, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      location.reload();
    });
    cartItemElement.appendChild(selectedCheckBox);
    cartItemElement.appendChild(imageElement);
    cartItemElement.appendChild(nameCartProductElement);
    cartItemElement.appendChild(priceCartProductElement);
    cartItemElement.appendChild(inputElement);
    cartItemElement.appendChild(buttonElement);
    listCartElement.appendChild(cartItemElement);
  });
  const buttonCheckoutElement = document.querySelector(".button-checkout");
  buttonCheckoutElement.addEventListener("click", () => {
    if (selectedCarts.length > 0) {
      buttonCheckoutElement.href = "checkout.html";
    } else {
      alert("Vui lòng chọn sản phẩm");
    }
  });
  const checkBoxes = document.querySelectorAll(
    ".list-cart input[type='checkbox']"
  );
  window.addEventListener("popstate", () => {
    selectedCarts = [];
    checkBoxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
  });
}
getCartPage(pathName);

// lay du lieu gio hang cua form thanh toan dua len sheet
function getCheckOutPage(pathName) {
  if (pathName !== "/pages/checkout.html") return;

  const productCheckout = JSON.parse(localStorage.getItem("checkout")) || [];

  const totalAmountElement = document.querySelector("#total");
  const totalPrice = productCheckout.reduce((total, product) => {
    const price = Number(product.price.replace(/\./g, "").replace(",", "."));
    return total + price * Number(product.number);
  }, 0);
  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(totalPrice);
  totalAmountElement.value = formattedPrice;

  const listProductCheckoutElement = document.querySelector(".product-list");
  productCheckout.forEach((item) => {
    const ulElement = document.createElement("ul");
    const liElement = document.createElement("li");

    const formattedPrice = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(
      Number(item.price.replace(/\./g, "").replace(",", ".")) *
        Number(item.number)
    );

    liElement.textContent =
      "SL: " + item.number + " - " + item.name + " - " + formattedPrice;
    ulElement.appendChild(liElement);
    listProductCheckoutElement.appendChild(ulElement);
  });

  const checkOutFormElement = document.getElementById("checkoutForm");
  checkOutFormElement.addEventListener("submit", function (event) {
    event.preventDefault(); // Ngăn hành vi submit mặc định của form

    // Lấy dữ liệu từ form
    const name = document.getElementById("name").value;
    const address = document.getElementById("address").value;
    const phone = document.getElementById("phone").value;
    const paymentMethod = document.getElementById("payment-method").value;
    const total = document.getElementById("total").value;

    // Tạo object chứa dữ liệu
    const checkoutData = {
      name: name,
      address: address,
      phone: phone,
      payment_method: paymentMethod,
      status: 0,
      total_price: total,
      products: productCheckout.map((cartProduct) => {
        return {
          product_id: cartProduct.id,
          quantity: Number(cartProduct.number),
          total_price: Number(cartProduct.price),
        };
      }),
    };

    fetch(
      "https://script.google.com/macros/s/AKfycbzyxFM1cPfSOW9KAJVsvvZl8X_B002w29Aahf0WZlMgyneASMW9S4mjeiuXABrrEw4/exec",
      {
        redirect: "follow",
        mode: "no-cors",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkoutData),
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("HTTP error!");
        }
        return response.json();
      })
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    removeCart();
    localStorage.removeItem("checkout");
    checkOutFormElement.reset();
    alert("Đã đặt hàng thành công, vui lòng check email để xác nhận đơn hàng");
  });
}
getCheckOutPage(pathName);
