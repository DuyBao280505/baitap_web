document.addEventListener("DOMContentLoaded", function () {
    // Tải navbar và footer
    Promise.all([
        fetch("navbar.html").then(res => res.text()),
        fetch("footer.html").then(res => res.text())
    ])
    .then(([navbarData, footerData]) => {
        if (document.getElementById("navbar-container")) {
            document.getElementById("navbar-container").innerHTML = navbarData;
            updateUserInfo();
            updateCartCount();
        }
        
        if (document.getElementById("footer-container")) {
            document.getElementById("footer-container").innerHTML = footerData;
        }
    })
    .catch(error => console.error("Lỗi tải trang:", error));

    // Xử lý theo trang cụ thể
    if (document.getElementById("product-list")) {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get("category") || "giay";
        showProducts(category);
    }
    
    if (document.getElementById("cart-items")) {
        displayCart();
    }
});
function changeQuantity(index, delta) {
    const cart = getCart();
    cart[index].quantity += delta;
    
    if (cart[index].quantity < 1) {
        cart[index].quantity = 1;
    }
    
    setCart(cart);
    displayCart();
    updateCartCount();
}

// HÀM TIỆN ÍCH
function updateCartCount() {
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById("cart-count");
    
    if (cartCountElement) {
        cartCountElement.textContent = total > 0 ? total : "";
    }
}

function showNotification(productName, quantity) {
    const notification = document.createElement("div");
    notification.className = "cart-notification alert alert-success";
    notification.innerHTML = `✅ Đã thêm ${quantity} ${productName} vào giỏ hàng`;
    notification.style.position = "fixed";
    notification.style.bottom = "20px";
    notification.style.right = "20px";
    notification.style.zIndex = "1000";
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Xử lý trang sản phẩm chi tiết
if (document.getElementById("product-detail")) {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    
    if (productId) {
        // Load product details...
    }
}
