// lay link web
const pathName = window.location.pathname;
const fullUrl = window.location.href;

// lay data product
const API_KEY = "AIzaSyC0xEZjHni3DaJ-M2zOQRMCSYaMlj52z6k";
const SHEET_ID = "1Y6mItoJuv6vRqi70oltmGod-5FKSYFmlCIlhQirlW5E";
const TABLE_PRODUCT = "table_product!A1:F200";
const TABLE_CUSTOMER_PRODUCT = "table_customer_product!A1:I200";
const TABLE_PRODUCT_IMAGE = "table_product_image!A1:C200";
const TABLE_PRODUCT_SIZE = "table_product_size!A1:C200";
const TABLE_PRODUCT_COLOR = "table_product_color!A1:C200";
const TABLE_COLOR = "table_color!A1:C200";
const TABLE_SIZE = "table_size!A1:B200";

// lay du lieu trong localStorage
function getCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  return cart;
}

async function formatSheetData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    const [columns, ...rows] = data.values;
    const mapData = rows.map((row) => {
      return columns.reduce((acc, column, index) => {
        acc[column] = row[index] !== undefined ? row[index] : null;
        return acc;
      }, {});
    });
    return mapData;
  } catch (error) {}
}

async function getAllData() {
  try {
    // Gọi tất cả API song song bằng Promise.all
    const [
      productData,
      productImageData,
      productSizeData,
      productColorData,
      sizeData,
      colorData,
    ] = await Promise.all([
      formatSheetData(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${TABLE_PRODUCT}?key=${API_KEY}`
      ),
      formatSheetData(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${TABLE_PRODUCT_IMAGE}?key=${API_KEY}`
      ),
      formatSheetData(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${TABLE_PRODUCT_SIZE}?key=${API_KEY}`
      ),
      formatSheetData(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${TABLE_PRODUCT_COLOR}?key=${API_KEY}`
      ),
      formatSheetData(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${TABLE_SIZE}?key=${API_KEY}`
      ),
      formatSheetData(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${TABLE_COLOR}?key=${API_KEY}`
      ),
      formatSheetData(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${TABLE_CUSTOMER_PRODUCT}?key=${API_KEY}`
      ),
    ]);

    // Kiểm tra xem dữ liệu có hợp lệ trước khi xử lý
    if (
      !productData ||
      !productColorData ||
      !colorData ||
      !productSizeData ||
      !sizeData ||
      !productImageData
    ) {
      throw new Error("Dữ liệu trả về từ API bị lỗi hoặc rỗng");
    }

    // Kết hợp màu sắc với dữ liệu productColor và color
    const joinColors = (productColorData, colorData) => {
      return productColorData.map((productColor) => {
        const color = colorData.find((c) => c.id === productColor.color_id);
        return { ...productColor, ...color };
      });
    };

    // Kết hợp size với dữ liệu productSize và size
    const joinSizes = (productSizeData, sizeData) => {
      return productSizeData.map((productSize) => {
        const size = sizeData.find((c) => c.id === productSize.size_id);
        return { ...productSize, ...size };
      });
    };

    // Kết hợp dữ liệu product với màu sắc, size và hình ảnh
    const mixProducts = productData.map((product) => {
      const color = joinColors(productColorData, colorData).filter(
        (c) => c.product_id === product.id
      );
      const size = joinSizes(productSizeData, sizeData).filter(
        (c) => c.product_id === product.id
      );
      const image = productImageData.filter((c) => c.product_id === product.id);
      return { ...product, color, size, image };
    });

    return mixProducts;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error.message);
    return []; // Trả về một mảng trống trong trường hợp lỗi
  }
}

// cập nhật đườn dẫn url
function updateQueryString(key, value) {
  const url = new URL(window.location);
  if (value) {
    url.searchParams.set(key, value);
  } else {
    url.searchParams.delete(key);
  }
  window.history.pushState({}, "", url);
}

// Thuanfix
function showSkeleton(container, count, type) {
  for (let i = 0; i < count; i++) {
    const parentItemSkeleton = document.createElement("div");

    if (type === "sort") {
      parentItemSkeleton.className = "parent-item-sort";

      const skeletonInput = document.createElement("div");
      skeletonInput.className = "skeleton skeleton-input";
      parentItemSkeleton.appendChild(skeletonInput);

      const skeletonText = document.createElement("div");
      skeletonText.className = "skeleton skeleton-text";
      parentItemSkeleton.appendChild(skeletonText);
    } else if (type === "card") {
      parentItemSkeleton.className = "skeleton-card";

      const skeletonImage = document.createElement("div");
      skeletonImage.className = "skeleton skeleton-card-image";
      parentItemSkeleton.appendChild(skeletonImage);

      const skeletonTitle = document.createElement("div");
      skeletonTitle.className = "skeleton skeleton-card-title";
      parentItemSkeleton.appendChild(skeletonTitle);

      const skeletonPrice = document.createElement("div");
      skeletonPrice.className = "skeleton skeleton-card-price";
      parentItemSkeleton.appendChild(skeletonPrice);

      const skeletonDescription = document.createElement("div");
      skeletonDescription.className = "skeleton skeleton-card-description";
      parentItemSkeleton.appendChild(skeletonDescription);
    }

    container.appendChild(parentItemSkeleton);
  }
}

// tao sort by - Thuanfix
async function creatSortByProduct(pathName) {
  const validPaths = [
    "/pages/women.html",
    "/pages/men.html",
    "/pages/baby.html",
  ];
  if (!validPaths.includes(pathName)) return;
  const sizeSortElement = document.querySelector("#size-sort");
  const colorSortElement = document.querySelector("#color-sort");

  showSkeleton(sizeSortElement, 5, "sort");
  showSkeleton(colorSortElement, 5, "sort");

  const sizeData = await formatSheetData(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${TABLE_SIZE}?key=${API_KEY}`
  );
  const colorData = await formatSheetData(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${TABLE_COLOR}?key=${API_KEY}`
  );

  sizeSortElement.innerHTML = "";
  colorSortElement.innerHTML = "";

  sizeData.forEach((size) => {
    const parentItemSize = document.createElement("div");
    parentItemSize.className = "parent-item-sort";
    const inputElement = document.createElement("input");
    inputElement.type = "radio";
    inputElement.name = "size";
    inputElement.id = size.id;
    inputElement.value = size.name;
    inputElement.addEventListener("change", () => {
      updateQueryString("size", size.id);
      location.reload();
    }),
      parentItemSize.appendChild(inputElement);

    const pElement = document.createElement("p");
    pElement.textContent = size.name;
    parentItemSize.appendChild(pElement);

    sizeSortElement.appendChild(parentItemSize);
  });

  colorData.forEach((color) => {
    const parentItemColor = document.createElement("div");
    parentItemColor.className = "parent-item-sort";
    const inputElement = document.createElement("input");
    inputElement.type = "radio";
    inputElement.name = "color";
    inputElement.id = color.id;
    inputElement.value = color.name;
    inputElement.addEventListener("change", () => {
      updateQueryString("color", color.id);
      location.reload();
    }),
      parentItemColor.appendChild(inputElement);

    const pElement = document.createElement("p");
    pElement.textContent = color.name;
    parentItemColor.appendChild(pElement);

    colorSortElement.appendChild(parentItemColor);
  });

  const urlParams = new URLSearchParams(window.location.search);
  const selectedSize = urlParams.get("size");
  const selectedColor = urlParams.get("color");

  if (selectedSize) {
    const selectedSizeInput = document.querySelector(
      `input[name="size"][id="${selectedSize}"]`
    );
    if (selectedSizeInput) {
      selectedSizeInput.checked = true;
    }
  }
  if (selectedColor) {
    const selectedColorInput = document.querySelector(
      `input[name="color"][id="${selectedColor}"]`
    );
    if (selectedColorInput) {
      selectedColorInput.checked = true;
    }
  }
}

//Thuanfix
async function getCurrentDataForPage(url) {
  const listProductElement = document.querySelector(".list-product");
  const urlParams = new URLSearchParams(window.location.search);
  const selectedSize = urlParams.get("size");
  const selectedColor = urlParams.get("color");

  showSkeleton(listProductElement, 5, "card");
  const data = await getAllData();
  listProductElement.innerHTML = "";

  if (!data) {
    console.error("Loi khi lấy dữ liệu");
    return;
  }

  let filterData;

  const userResponses = JSON.parse(localStorage.getItem("userResponses"));

  if (url === "/pages/men.html") {
    filterData = data.filter((c) => c.type === "men");
  } else if (url === "/pages/women.html") {
    filterData = data.filter((c) => c.type === "women");
  } else if (url === "/pages/baby.html") {
    filterData = data.filter((c) => c.type === "baby");
  }
  if (userResponses) {
    let matchedProducts = [];
    let otherProducts = [];
    const matchedProductIds = new Set();

    Object.entries(userResponses).forEach(([key, value]) => {
      if (value) {
        filterData.forEach((product) => {
          let shouldAdd = false;

          if (key === "color" && product.color.some((c) => c.id === value)) {
            shouldAdd = true;
          } else if (key === "gender" && product.gender === value) {
            shouldAdd = true;
          } else if (key === "age" && product.ageGroup === value) {
            shouldAdd = true;
          }

          if (shouldAdd && !matchedProductIds.has(product.id)) {
            matchedProducts.push(product);
            matchedProductIds.add(product.id);
          }
        });
      }
    });

    filterData.forEach((product) => {
      if (!matchedProductIds.has(product.id)) {
        otherProducts.push(product);
      }
    });

    filterData = [...matchedProducts, ...otherProducts];
  }

  if (selectedColor) {
    filterData = filterData.filter((c) =>
      c.color.some((color) => color.id === selectedColor)
    );
  }
  if (selectedSize) {
    filterData = filterData.filter((c) =>
      c.size.some((size) => size.id === selectedSize)
    );
  }

  if (filterData.length === 0) {
    const noProductElement = document.createElement("div");
    noProductElement.className = "no-product";
    noProductElement.textContent = "Không tồn tại sản phẩm nào";
    listProductElement.appendChild(noProductElement);
    return;
  }

  filterData.forEach((product) => {
    const cardElement = document.createElement("div");
    cardElement.className = "card";
    const imageElement = document.createElement("img");
    imageElement.src = product.image[0].image_url;
    const h3Element = document.createElement("h3");
    //Thuanfix
    if (product.name.length > 30)
      h3Element.textContent = product.name.substring(0, 30) + "...";
    else h3Element.textContent = product.name;
    const pElement = document.createElement("p");
    pElement.textContent = product.price + " VND";
    const aElement = document.createElement("a");
    aElement.href = "/product/info.html?name=" + textToSlug(product.name);
    aElement.textContent = "Mua ngay";
    cardElement.appendChild(imageElement);
    cardElement.appendChild(h3Element);
    cardElement.appendChild(pElement);
    cardElement.appendChild(aElement);
    listProductElement.appendChild(cardElement);
  });
}

creatSortByProduct(pathName);
getCurrentDataForPage(pathName);

//Thuanfix(tach)
function addToCart(id, name, image, price, color_id, size_id, number) {
  const cart = getCart();
  const indexProductCart = cart.findIndex(
    (product) =>
      product.id === id &&
      product.color_id === color_id &&
      product.size_id === size_id
  );
  if (indexProductCart !== -1) {
    cart[indexProductCart].number =
      Number(cart[indexProductCart].number) + Number(number);
  } else {
    cart.push({ id, name, image, price, color_id, size_id, number });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  console.log(cart);
  alert("Đã thêm vào giỏ hàng");
}

// trang infor product
async function getInfoProductPage(fullUrl, pathName) {
  if (pathName !== "/product/info.html") return;
  const data = await getAllData();
  const urlObj = new URL(fullUrl);
  const nameParam = urlObj.searchParams.get("name");
  const product = data.find((c) => textToSlug(c.name) === nameParam);

  const nameProductElement = document.querySelector(".name-product");
  nameProductElement.textContent = product.name;

  const priceProductElement = document.querySelector(".price-product");
  priceProductElement.textContent = product.price + " VND";

  const contentDescriptionElement = document.querySelector(
    ".content-description"
  );
  contentDescriptionElement.textContent = product.description;

  const swiperWrapperElement = document.querySelector(".swiper-wrapper");
  product.image.forEach((image) => {
    const swiperSlideElement = document.createElement("div");
    swiperSlideElement.className = "swiper-slide slide-info";
    const imgElement = document.createElement("img");
    imgElement.src = image.image_url;
    swiperSlideElement.appendChild(imgElement);
    swiperWrapperElement.appendChild(swiperSlideElement);
  });

  const infoProductColorElement = document.querySelector("#info-product-color");
  const colorSelectElement = document.createElement("select");
  colorSelectElement.name = "color";
  colorSelectElement.id = "color-select";

  product.color.forEach((color) => {
    const optionElement = document.createElement("option");
    optionElement.value = color.id;
    optionElement.textContent = color.name;
    colorSelectElement.appendChild(optionElement);
  });
  infoProductColorElement.appendChild(colorSelectElement);

  const infoProductSizeElement = document.querySelector("#info-product-size");
  const sizeSelectElement = document.createElement("select");
  sizeSelectElement.name = "size";
  sizeSelectElement.id = "size-select";

  product.size.forEach((size) => {
    const optionElement = document.createElement("option");
    optionElement.value = size.id;
    optionElement.textContent = size.name;
    sizeSelectElement.appendChild(optionElement);
  });

  infoProductSizeElement.appendChild(sizeSelectElement);

  const buttonElement = document.querySelector(".button-cart");
  buttonElement.addEventListener("click", () => {
    const colorSelected = document.querySelector("#color-select");
    const sizeSelected = document.querySelector("#size-select");
    const numberSelected = document.querySelector("#number-select");

    if (!colorSelected || !sizeSelected || !numberSelected) {
      alert("Vui lòng chọn màu, size và số lượng");
      return;
    }
    const productCart = {
      id: product.id,
      name: product.name,
      image: product.image[0].image_url,
      price: product.price,
      color_id: colorSelected.value,
      size_id: sizeSelected.value,
      number: numberSelected.value,
    };

    addToCart(
      productCart.id,
      productCart.name,
      productCart.image,
      productCart.price,
      productCart.color_id,
      productCart.size_id,
      productCart.number
    );
  });
}
getInfoProductPage(fullUrl, pathName);
