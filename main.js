const searchResults = document.getElementById("searchResults");

//Thuanfix3
function storeUserIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.has("user")) {
    const userId = urlParams.get("user");

    localStorage.setItem("userId", userId);
    urlParams.delete("user");
    const newUrl =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      urlParams.toString();
    window.history.replaceState({ path: newUrl }, "", newUrl);
  } else {
    console.log("Không có query parameter 'user' trong URL.");
  }
}
window.onload = storeUserIdFromUrl;
// ***

// Thuanfix2
async function getSearchData(inputValue) {
  const url = `https://script.google.com/macros/s/AKfycbwqKvYW7ZTpKR-Jat1vHLI7FkJmeaVY2LyBwDyJtVzfjUMuyQPatLycJSEs6lS_JWk/exec?name=${encodeURIComponent(
    inputValue
  )}`;

  const requestOptions = {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  };

  displaySearchResults([], true);
  searchResults.innerHTML += "<p>Loading...</p>";

  try {
    let response = await fetch(url, requestOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    let data = await response.json();
    displaySearchResults(data, false);
  } catch (error) {
    console.error("Error:", error);
  }
}

function displaySearchResults(results, isLoading) {
  searchResults.innerHTML = "";
  if (results.length === 0 && isLoading == false) {
    searchResults.innerHTML = "<p>No results found</p>";
    searchResults.classList.remove("show");
    return;
  }

  searchResults.classList.add("show");

  results.forEach((result) => {
    const resultItem = document.createElement("div");
    resultItem.classList.add("result-item");
    resultItem.innerHTML = `
        <a href="/product/info.html?name=${textToSlug(result.name)}">
          <h3>${result.name}</h3>
          <p>Price: ${result.price.toLocaleString()} VND</p>
        </a>
      `;
    searchResults.appendChild(resultItem);
  });
}
// ---

function textToSlug(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// xử lý trượt ảnh cop từ tài liệu
const swiper = new Swiper(".swiper", {
  spaceBetween: 30,
  effect: "fade",
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
});

// xử lý menu
const menu = [
  {
    label: "AMEE",
    href: "/index",
  },
  {
    label: "",
    href: "https://script.google.com/macros/s/AKfycbwqKvYW7ZTpKR-Jat1vHLI7FkJmeaVY2LyBwDyJtVzfjUMuyQPatLycJSEs6lS_JWk/exec",
  },
  {
    label: "",
    href: "/pages/cart",
  },
  {
    label: "",
    href: "/pages/search",
  },
  {
    label: "MEN",
    href: "/pages/men",
  },
  {
    label: "WOMEN",
    href: "/pages/women",
  },
  {
    label: "BABY",
    href: "/pages/baby",
  },
  {
    label: "ABOUT US",
    href: "/pages/about-us",
  },
];

// Hiển thị menu
const menuElement = document.getElementById("navbar-component");

function getMenu() {
  const navElement = document.createElement("nav");
  //Thuanfix
  navElement.classList.add("nav-list");
  navElement.style.transition = "all 1s ease-out";
  const ulElement = document.createElement("ul");
  // xử lý, lặp qua các phần tử từ trong mảng từ đầu đến cuối
  menu.forEach((item) => {
    // tạo thành phần li, thêm class primary-nav hoặc secondary-nav
    const liElement = document.createElement("li");
    const aElement = document.createElement("a");

    // nếu href của item là AMEE thì thêm class primary-nav, ngược lại thêm secondary-nav
    if (item.href === "/index") {
      liElement.classList.add("primary-nav");

      const logoElement = document.createElement("img");
      logoElement.src = "../images/icon/icon_shop.png";
      logoElement.alt = "logo";

      liElement.appendChild(logoElement);
    } else {
      liElement.classList.add("secondary-nav");
      if (item.href === "/pages/search") {
        const iconSearchElement = document.createElement("i");
        iconSearchElement.classList.add("fas", "fa-search");
        liElement.appendChild(iconSearchElement);
        // xu ly search
        const modalElement = document.getElementById("modal-search");
        const searchInput = document.getElementById("searchInput");
        const searchButton = document.getElementById("searchButton");
        iconSearchElement.onclick = function () {
          modalElement.style.display = "flex";
        };
        window.onclick = function (event) {
          if (event.target === modalElement) {
            modalElement.style.display = "none";
          }
        };
        searchButton.addEventListener("click", function () {
          const inputValue = searchInput.value;
          if (inputValue) {
            getSearchData(inputValue);
          } else {
            alert("Please enter a search term");
          }
        });
        // Thuanfix2
        searchInput.addEventListener("keydown", function (event) {
          if (event.key === "Enter") {
            event.preventDefault();
            const inputValue = searchInput.value.trim();
            if (inputValue) {
              getSearchData(inputValue);
            } else {
              alert("Please enter a search term");
            }
          }
        });
      } else if (item.href === "/pages/cart") {
        const carts = JSON.parse(localStorage.getItem("cart")) || [];
        const iconCartElement = document.createElement("i");
        iconCartElement.classList.add("fas", "fa-shopping-cart");
        iconCartElement.style.cursor = "pointer";

        const quantityElement = document.createElement("span");
        quantityElement.classList.add("cart-quantity");
        quantityElement.textContent = carts.length;

        iconCartElement.addEventListener("click", () => {
          window.open(item.href + ".html");
        });

        liElement.appendChild(iconCartElement);
        liElement.appendChild(quantityElement);
      } else if (item.href.includes("https")) {
        //Thuanfix3
        const iconUserElement = document.createElement("i");
        iconUserElement.classList.add("fas", "fa-user");
        iconUserElement.style.cursor = "pointer";
        liElement.appendChild(iconUserElement);
        const userId = localStorage.getItem("userId");
        if (userId) {
          iconUserElement.addEventListener("click", () => {
            window.location.href = "/pages/order.html";
          });
        } else {
          iconUserElement.addEventListener("click", () => {
            window.open(item.href);
          });
        }
        // ***
      }
    }

    if (item.href !== "/pages/search" && !item.href.includes("https"))
      aElement.href = item.href + ".html";
    if (item.href.includes("https")) aElement.href = item.href;
    //---
    aElement.textContent = item.label;

    liElement.appendChild(aElement);
    ulElement.appendChild(liElement);
    navElement.appendChild(ulElement);
    menuElement.appendChild(navElement);
  });
}
getMenu();

//hien thi menu mobile
function getMenuMobile() {
  const containerMenuMobileElement = document.querySelector(".container-icon");
  const iconMenuMobileElement = document.querySelector(".parent-icon");
  const iconMenuOpenElement = document.querySelector(".icon-menu-open");
  const iconMenuCloseElement = document.querySelector(".icon-menu-close");

  // Show menu
  const navElement = document.createElement("nav");
  navElement.classList.add("nav-list-menu-mobile");
  const ulElement = document.createElement("ul");
  ulElement.classList.add("list-menu-mobile");

  //Thuanfix2
  // xử lý, lặp qua các phần tử từ trong mảng từ đầu đến cuối
  menu.forEach((item) => {
    if (item.href === "/index") {
      const liElement = document.createElement("li");
      liElement.classList.add("primary-nav");
      const logoElement = document.createElement("img");
      logoElement.src = "../images/icon/icon_shop.png";
      logoElement.alt = "logo";
      liElement.appendChild(logoElement);
      ulElement.appendChild(liElement);
    } else if (
      item.label !== "" &&
      item.href !== "/pages/cart" &&
      item.href !== "/pages/search"
    ) {
      const liElement = document.createElement("li");
      const aElement = document.createElement("a");
      liElement.classList.add("primary-nav");
      liElement.classList.add("secondary-nav");
      aElement.href = item.href + ".html";
      aElement.textContent = item.label;
      liElement.appendChild(aElement);
      ulElement.appendChild(liElement);
    }
  });

  const searchLiElement = document.createElement("li");
  const iconSearchElement = document.createElement("i");
  iconSearchElement.classList.add("fas", "fa-search");
  searchLiElement.appendChild(iconSearchElement);
  ulElement.appendChild(searchLiElement);

  const cartLiElement = document.createElement("li");
  const iconCartElement = document.createElement("i");
  iconCartElement.classList.add("fas", "fa-shopping-cart");
  cartLiElement.appendChild(iconCartElement);
  ulElement.appendChild(cartLiElement);

  iconSearchElement.onclick = function () {
    const modalElement = document.getElementById("modal-search");
    modalElement.style.display = "flex";
  };

  iconCartElement.onclick = function () {
    window.location.href = "/pages/cart.html";
  };

  navElement.appendChild(ulElement);
  containerMenuMobileElement.appendChild(navElement);
  //  ---
  function toggleMenuMobile() {
    const navElement = document.querySelector(".nav-list-menu-mobile");
    if (containerMenuMobileElement.classList.contains("showMenu")) {
      containerMenuMobileElement.style.backgroundColor = "transparent";
      containerMenuMobileElement.style.height = "0";
      iconMenuOpenElement.style.display = "block";
      iconMenuCloseElement.style.display = "none";
      containerMenuMobileElement.classList.remove("showMenu");
    } else {
      containerMenuMobileElement.style.backgroundColor = "white";
      containerMenuMobileElement.style.height = "100%";
      iconMenuOpenElement.style.display = "none";
      iconMenuCloseElement.style.display = "block";
      containerMenuMobileElement.classList.add("showMenu");
      navElement.style.height = "100%";
    }
  }
  iconMenuMobileElement.addEventListener("click", toggleMenuMobile);
}
getMenuMobile();

// Nếu kéo xuống 0.01 trên trục y thì đổi màu nền menu - Thuanfix
document.body.addEventListener("scroll", () => {
  const navListElement = document.querySelector(".nav-list");
  const scrollPosition =
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0;

  if (scrollPosition > 100) {
    navListElement.style.backgroundColor = "white";
  } else {
    navListElement.style.backgroundColor = "";
  }
});

//Back button - Thuanfix - Thuanfix2
const backButton = document.querySelector(".icon-back");
backButton &&
  backButton.addEventListener("click", () => {
    window.location.href = "/index.html";
  });
// ---

// hien thi footer
const footer = {
  amee: [
    {
      label: "Official Thông tin Partner",
      href: "https://www.nike.com/xf/en_gb/",
    },
    {
      label: "Cơ hội nghề nghiệp",
      href: "https://www.nike.com/xf/en_gb",
    },
  ],
  links: [
    {
      label: "Catalog",
      href: "/pages/baby",
    },
    {
      label: "Contact us",
      href: "/pages/about-us",
    },
    {
      label: "Take a survey",
      href: "/pages/men",
    },
    {
      label: "Refund Policy",
      href: "/pages/women",
    },
  ],
  socialMedia: [
    {
      label: "Twitter",
      href: "https://www.facebook.com/nike",
      icon: "fab fa-twitter fa-3x",
    },
    {
      label: "Facebook",
      href: "https://www.facebook.com/nike",
      icon: "fab fa-facebook-square",
    },
    {
      label: "Github",
      href: "https://github.com/Jeetg57",
      icon: "fab fa-github fa-3x",
    },
  ],
  copyright: {
    label: "© 2024 AMEE. All rights reserved.",
    href: "https://www.codepen.io/jeetg57",
  },
};

const footerElement = document.getElementById("footer");
function getFooter() {
  const itemContainerElement = document.createElement("div");
  itemContainerElement.classList.add("row");

  Array.from([1, 2, 3, 4], (num) => {
    const itemCoverElement = document.createElement("div");
    itemCoverElement.classList.add("col");

    const itemTitleElement = document.createElement("h2");
    if (num === 1) {
      itemTitleElement.textContent = "Về AMEE";
      itemCoverElement.appendChild(itemTitleElement);

      footer.amee.forEach((child) => {
        const pElement = document.createElement("p");
        pElement.textContent = child.label;

        const aElement = document.createElement("a");
        aElement.href = child.href;

        pElement.appendChild(aElement);
        itemCoverElement.appendChild(pElement);
      });
    } else if (num === 2) {
      itemTitleElement.textContent = "Links";
      itemCoverElement.appendChild(itemTitleElement);

      footer.links.forEach((child) => {
        const pElement = document.createElement("p");
        pElement.textContent = child.label;

        const aElement = document.createElement("a");
        aElement.href = child.href;

        pElement.appendChild(aElement);
        itemCoverElement.appendChild(pElement);
      });
    } else if (num === 3) {
      itemTitleElement.textContent = "Social Media";
      itemCoverElement.appendChild(itemTitleElement);
      footer.socialMedia.forEach((child) => {
        const pElement = document.createElement("p");
        pElement.textContent = child.label;

        const aElement = document.createElement("a");
        aElement.href = child.href;

        pElement.appendChild(aElement);
        itemCoverElement.appendChild(pElement);
      });
    } else {
      itemTitleElement.textContent = "Copyright";
      itemCoverElement.appendChild(itemTitleElement);
      itemCoverElement.style.flexGrow = "1";
      itemCoverElement.style.display = "flex";
      itemCoverElement.style.justifyContent = "center";
      itemCoverElement.style.alignItems = "center";

      const pElement = document.createElement("p");
      pElement.textContent = footer.copyright.label;
      const aElement = document.createElement("a");
      aElement.href = footer.copyright.href;

      pElement.appendChild(aElement);
      itemCoverElement.appendChild(pElement);
    }

    itemContainerElement.appendChild(itemCoverElement);
  });

  footerElement.appendChild(itemContainerElement);
}
getFooter();

//Thuanfix2
// hien thi best seller
const API_KEY = "AIzaSyBdvPyy8WwVZvcR2XBl7PFREd-wAyw63b4";
const SHEET_ID = "1NDejtz1rjirw41xGUqOHda8cpKTZFLZYFhcywE6spb4";
const TABLE_PRODUCT = "table_product!A1:H200";
//Thuanfix3
const TABLE_CUSTOMER_PRODUCT = "table_customer_product_order!A1:I200";
//*** */
const TABLE_PRODUCT_IMAGE = "table_product_image!A1:C200";
const TABLE_PRODUCT_SIZE = "table_product_size!A1:C200";
const TABLE_PRODUCT_COLOR = "table_product_color!A1:C200";
const TABLE_COLOR = "table_color!A1:C200";
const TABLE_SIZE = "table_size!A1:B200";

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

async function getBestSellerData() {
  try {
    const [productData, productImageData] = await Promise.all([
      formatSheetData(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${TABLE_PRODUCT}?key=${API_KEY}`
      ),
      formatSheetData(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${TABLE_PRODUCT_IMAGE}?key=${API_KEY}`
      ),
    ]);
    if (!productData || !productImageData) {
      throw new Error("Dữ liệu trả về từ API bị lỗi hoặc rỗng");
    }

    const mixProducts = productData
      .map((product) => {
        const image = productImageData.filter(
          (c) => c.product_id === product.id
        );
        return { ...product, image };
      })
      .filter((product) => product.is_best_seller === "TRUE");

    return mixProducts;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error.message);
    return [];
  }
}

function getRandomProducts(products, count = 4) {
  const shuffled = products.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function displayBestSellers() {
  const bestSellerContainer = document.querySelector(".row-bestsale");
  const bestSellerProducts = await getBestSellerData();

  const randomProducts = getRandomProducts(bestSellerProducts, 4);

  bestSellerContainer.innerHTML = "";

  randomProducts.forEach((product) => {
    const imageUrl = product.image[0].image_url;
    const productHTML = `
        <figure class="item">
          <a href="./product/info.html?product_id=${product.id}">
            <img src="${imageUrl}" alt="${product.name}" width="100%" />
            <figcaption>${product.name}</figcaption>
          </a>
        </figure>
      `;
    bestSellerContainer.innerHTML += productHTML;
  });
}

displayBestSellers();

// ---
