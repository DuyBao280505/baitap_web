// ================ CONSTANTS ================
const CURRENT_USER_KEY = 'currentUser';
const CARTS_KEY = 'carts';
const TEMP_CART_KEY = 'tempCart';
const ORDERS_KEY = 'orders';
const CHECKOUT_ITEMS_KEY = 'checkoutItems'; 
// ================ UTILITY FUNCTIONS ================
function convertPriceToNumber(price) {
    if (typeof price === 'number') return price;
    return parseInt(price.toString().replace(/\./g, '').replace('đ', '').trim()) || 0;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `✅ ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// ================ CART MANAGEMENT ================
function getCurrentCart() {
    const user = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    let cart;
    if (user) {
        const carts = JSON.parse(localStorage.getItem(CARTS_KEY)) || {};
        cart = carts[user.id] || [];
    } else {
        cart = JSON.parse(localStorage.getItem(TEMP_CART_KEY)) || [];
    }
    console.log('Current cart:', cart);
    return cart;
}

function saveCurrentCart(items) {
    const user = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    
    if (user) {
        // Đã đăng nhập: lưu vào carts[userId]
        const carts = JSON.parse(localStorage.getItem(CARTS_KEY)) || {};
        carts[user.id] = items;
        localStorage.setItem(CARTS_KEY, JSON.stringify(carts));
    } else {
        // Chưa đăng nhập: lưu vào giỏ hàng tạm
        localStorage.setItem(TEMP_CART_KEY, JSON.stringify(items));
    }
    
    updateCartCount();
}

function updateCartCount() {
    const cart = getCurrentCart();
    const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    const cartCountElements = document.querySelectorAll('.cart-count');
    
    cartCountElements.forEach(el => {
        el.textContent = count > 0 ? count : '';
        el.style.display = count > 0 ? 'inline-block' : 'none';
    });
}

function addToCart(product) {
    const cart = getCurrentCart();
    
    // Kiểm tra nếu sản phẩm đã có trong giỏ hàng
    const existingItem = cart.find(item => 
        item.name === product.name && (!item.size || item.size === product.size));
    
    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCurrentCart(cart);
    showNotification('Đã thêm vào giỏ hàng!');
}

function displayCart() {
    const cart = getCurrentCart();
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');
    const emptyCartMessage = document.getElementById('empty-cart-message');

    if (!cart || cart.length === 0) {
        if (cartItemsContainer) cartItemsContainer.innerHTML = '';
        if (emptyCartMessage) emptyCartMessage.style.display = 'block';
        if (totalPriceElement) totalPriceElement.textContent = '0đ';
        return;
    }

    if (emptyCartMessage) emptyCartMessage.style.display = 'none';

    let html = '';
    let total = 0;

    cart.forEach((item, index) => {
        const price = convertPriceToNumber(item.price);
        const itemTotal = price * (item.quantity || 1);
        total += itemTotal;

        html += `
            <tr>
                <td><img src="${item.image || 'placeholder.jpg'}" width="50" alt="${item.name}"></td>
                <td>
                    ${item.name}
                    ${item.size ? `<br><small>Size: ${item.size}</small>` : ''}
                </td>
                <td>
                    ${price.toLocaleString('vi-VN')}đ x ${item.quantity || 1} 
                    = <strong>${itemTotal.toLocaleString('vi-VN')}đ</strong>
                </td>
                <td>
                    <div class="quantity-control">
                        <button class="btn btn-sm btn-outline-secondary" 
                                onclick="updateQuantity(${index}, -1)">
                            -
                        </button>
                        <span>${item.quantity || 1}</span>
                        <button class="btn btn-sm btn-outline-secondary" 
                                onclick="updateQuantity(${index}, 1)">
                            +
                        </button>
                    </div>
                </td>
                <td>
                    <button class="btn btn-sm btn-danger" 
                            onclick="removeFromCart(${index})">
                        ❌ Xóa
                    </button>
                </td>
            </tr>
        `;
    });

    if (cartItemsContainer) cartItemsContainer.innerHTML = html;
    if (totalPriceElement) {
        totalPriceElement.textContent = total.toLocaleString('vi-VN') + 'đ';
    }
}

function updateQuantity(index, change) {
    const cart = getCurrentCart();
    if (index >= 0 && index < cart.length) {
        cart[index].quantity = (cart[index].quantity || 1) + change;
        
        if (cart[index].quantity < 1) cart[index].quantity = 1;
        
        saveCurrentCart(cart);
        displayCart();
        updateCartCount();
    }
}

function removeFromCart(index) {
    const cart = getCurrentCart();
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        saveCurrentCart(cart);
        displayCart();
        updateCartCount();
        showNotification('Đã xóa sản phẩm khỏi giỏ hàng');
    }
}

function clearCart() {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) {
        const user = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
        
        if (user) {
            const carts = JSON.parse(localStorage.getItem(CARTS_KEY)) || {};
            delete carts[user.id];
            localStorage.setItem(CARTS_KEY, JSON.stringify(carts));
        } else {
            localStorage.removeItem(TEMP_CART_KEY);
        }
        
        displayCart();
        updateCartCount();
        showNotification('Đã xóa toàn bộ giỏ hàng');
    }
}

// ================ USER MANAGEMENT ================
function checkLoginStatus() {
    const user = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    const userDropdown = document.getElementById('user-dropdown');
    const loginIcon = document.getElementById('login-icon');

    if (user) {
        // Đã đăng nhập
        userDropdown.style.display = 'block';
        loginIcon.style.display = 'none';
        document.getElementById('user-name-display').textContent = user.name;
        
        // Chuyển giỏ hàng tạm sang giỏ hàng user nếu có
        const tempCart = JSON.parse(localStorage.getItem(TEMP_CART_KEY)) || [];
        if (tempCart.length > 0) {
            const carts = JSON.parse(localStorage.getItem(CARTS_KEY)) || {};
            carts[user.id] = [...(carts[user.id] || []), ...tempCart];
            localStorage.setItem(CARTS_KEY, JSON.stringify(carts));
            localStorage.removeItem(TEMP_CART_KEY);
        }
    } else {
        // Chưa đăng nhập
        userDropdown.style.display = 'none';
        loginIcon.style.display = 'block';
    }
    
    updateCartCount();
}

function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    checkLoginStatus();
    window.location.href = 'index.html';
}

// Khởi tạo khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    updateCartCount();
    displayCart();
});

// ================ CHECKOUT FUNCTIONS ================
function prepareCheckout() {
    const cart = getCurrentCart();
    console.log('Cart to save:', cart);
    if (cart.length === 0) {
        showNotification('Giỏ hàng của bạn đang trống!');
        return false;
    }
    localStorage.setItem(CHECKOUT_ITEMS_KEY, JSON.stringify(cart));
    console.log('Saved to checkoutItems:', JSON.parse(localStorage.getItem(CHECKOUT_ITEMS_KEY)));
    return true;
}
function displayCheckout() {
    let checkoutItems;
    try {
        checkoutItems = JSON.parse(localStorage.getItem(CHECKOUT_ITEMS_KEY)) || getCurrentCart();
    } catch (e) {
        console.error('Error reading checkout items:', e);
        checkoutItems = getCurrentCart();
    }

    const checkoutItemsContainer = document.getElementById('checkout-items');
    const totalPriceElement = document.getElementById('checkout-total-price');
    const emptyCheckoutMessage = document.getElementById('empty-checkout-message');

    if (!checkoutItems || checkoutItems.length === 0) {
        if (checkoutItemsContainer) checkoutItemsContainer.innerHTML = '';
        if (emptyCheckoutMessage) emptyCheckoutMessage.style.display = 'block';
        if (totalPriceElement) totalPriceElement.textContent = '0đ';
        return;
    }

    if (emptyCheckoutMessage) emptyCheckoutMessage.style.display = 'none';

    let html = '';
    let total = 0;

    checkoutItems.forEach((item, index) => {
        const price = convertPriceToNumber(item.price);
        const itemTotal = price * (item.quantity || 1);
        total += itemTotal;

        html += `
            <tr>
                <td><img src="${item.image || 'placeholder.jpg'}" alt="${item.name}" class="img-fluid" style="max-width: 100px;"></td>
                <td>${item.name}</td>
                <td>${item.size || 'N/A'}</td>
                <td>${item.quantity || 1}</td>
                <td>${price.toLocaleString('vi-VN')}đ</td>
                <td>${itemTotal.toLocaleString('vi-VN')}đ</td>
            </tr>
        `;
    });

    if (checkoutItemsContainer) {
        checkoutItemsContainer.innerHTML = html;
        console.log('Checkout items HTML:', html); // Debug
    }
    if (totalPriceElement) {
        totalPriceElement.textContent = total.toLocaleString('vi-VN') + 'đ';
    }
}
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    displayCheckout();
    updateOrderSummary(); // Gọi hàm này để cập nhật tóm tắt
    
    const checkoutItems = JSON.parse(localStorage.getItem(CHECKOUT_ITEMS_KEY)) || getCurrentCart();
    console.log('Checkout items on load:', checkoutItems); // Debug
    if (checkoutItems.length === 0) {
        showNotification('Giỏ hàng trống, đang chuyển hướng...');
        setTimeout(() => window.location.href = 'cart.html', 1500);
    }
});

// ================ ORDER PROCESSING ================
function saveOrderToHistory(order) {
    try {
        const orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
        orders.push(order);
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch (e) {
        console.error('Error saving order:', e);
    }
}

function processCheckout(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const customer = {
        name: formData.get('name').trim(),
        phone: formData.get('phone').trim(),
        address: formData.get('address').trim(),
        paymentMethod: formData.get('payment-method'),
        note: formData.get('note') || ''
    };

    // Simple validation
    if (!customer.name || !customer.phone || !customer.address) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
        return;
    }
    
    if (customer.name.trim().split(' ').length < 2) {
        alert('Vui lòng nhập đầy đủ họ và tên');
        return;
    }
    
    if (!/^\d{10,11}$/.test(customer.phone)) {
        alert('Số điện thoại phải có 10-11 chữ số');
        return;
    }

    let items;
    try {
        items = JSON.parse(localStorage.getItem(CHECKOUT_ITEMS_KEY)) || getCurrentCart();
    } catch (e) {
        console.error('Error reading checkout items:', e);
        items = getCurrentCart();
    }
    
    if (items.length === 0) {
        alert('Không có sản phẩm nào để thanh toán!');
        return;
    }

    const order = {
        id: Date.now().toString(),
        date: new Date().toLocaleString('vi-VN'),
        customer,
        items,
        total: items.reduce((sum, item) => sum + (convertPriceToNumber(item.price) * item.quantity), 0),
        status: 'pending'
    };

    saveOrderToHistory(order);
    localStorage.removeItem(CHECKOUT_ITEMS_KEY);
    // Xóa giỏ hàng sau khi đặt hàng
    saveCurrentCart([]);
    
    window.location.href = "invoice.html?id=" + order.id;
}

// ================ INITIALIZATION ================
document.addEventListener('DOMContentLoaded', function () {
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', processCheckout);
    }

    if (document.getElementById('cart-items')) {
        displayCart();
    }
    
    if (document.getElementById('checkout-items')) {
        displayCheckout();
    }

    updateCartCount();
    updateOrderSummary();
});

function updateOrderSummary() {
    const items = JSON.parse(localStorage.getItem(CHECKOUT_ITEMS_KEY)) || getCart();
    const summaryContainer = document.getElementById('summary-items');
    const totalPriceElement = document.getElementById('summary-total-price');
    
    if (!items || items.length === 0) {
        if (summaryContainer) summaryContainer.innerHTML = '<p>Không có sản phẩm nào</p>';
        if (totalPriceElement) totalPriceElement.textContent = '0đ';
        return;
    }

    let html = '';
    let total = 0;

    items.forEach(item => {
        const price = convertPriceToNumber(item.price);
        const itemTotal = price * item.quantity;
        total += itemTotal;

        html += `
            <div class="summary-item">
                <span class="item-name">${item.name} (x${item.quantity})</span>
                <span class="item-price">${itemTotal.toLocaleString('vi-VN')}đ</span>
            </div>
        `;
    });

    if (summaryContainer) summaryContainer.innerHTML = html;
    if (totalPriceElement) {
        totalPriceElement.textContent = total.toLocaleString('vi-VN') + 'đ';
    }
}
function onCartChange() {
    displayCart();
    updateOrderSummary();
    updateCartCount();
}
