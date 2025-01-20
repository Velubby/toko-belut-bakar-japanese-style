// DOM Elements
const navbarNav = document.querySelector('.navbar-nav');
const shoppingCart = document.querySelector('.shopping-cart');
const itemDetailModal = document.querySelector('#item-detail-modal');
const hamburgerMenu = document.querySelector('#hamburger-menu');
const shoppingCartButton = document.querySelector('#shopping-cart-button');

// Cart State
let cartItems = [];

// Navbar Toggle
if (hamburgerMenu) {
    hamburgerMenu.onclick = () => {
        navbarNav.classList.toggle('active');
    };
}

// Shopping Cart Toggle
if (shoppingCartButton) {
    shoppingCartButton.onclick = (e) => {
        e.preventDefault();
        shoppingCart.classList.toggle('active');
    };
}

// Click Outside Elements
document.addEventListener('click', function(e) {
    if (!hamburgerMenu?.contains(e.target) && !navbarNav?.contains(e.target)) {
        navbarNav?.classList.remove('active');
    }

    if (!shoppingCartButton?.contains(e.target) && !shoppingCart?.contains(e.target)) {
        shoppingCart?.classList.remove('active');
    }
});

// Modal Functions
document.querySelectorAll('.item-detail-button').forEach((btn) => {
    btn.onclick = (e) => {
        e.preventDefault();
        itemDetailModal.style.display = 'flex';
    };
});

// Modal Functions
const closeModalButtons = document.querySelectorAll('.modal .close-icon');
if (closeModalButtons) {
    closeModalButtons.forEach(button => {
        button.onclick = (e) => {
            e.preventDefault();
            const modal = button.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        };
    });
}

// Perbaiki click outside untuk semua modal
window.onclick = (e) => {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
};

// Cart Functions
function addToCart(name, price) {
  const existingItem = cartItems.find(item => item.name === name);
  
  if (existingItem) {
      existingItem.quantity += 1;
  } else {
      cartItems.push({
          name,
          price: parseInt(price),
          quantity: 1
      });
  }
  
  updateCart();
  // Tambahkan feedback visual
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = 'Item ditambahkan ke keranjang';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

function updateCart() {
  const cartItemsContainer = document.querySelector('.cart-items');
  const cartCount = document.querySelector('.cart-count');
  const cartTotal = document.querySelector('.cart-total span');
  
  if (cartItemsContainer) {
      cartItemsContainer.innerHTML = '';
      
      cartItems.forEach(item => {
          const cartItemHTML = `
              <div class="cart-item">
                  <div class="item-detail">
                      <h3>${item.name}</h3>
                      <div class="item-price">IDR ${item.price.toLocaleString()}</div>
                      <div class="item-quantity">
                          <button class="quantity-btn minus" onclick="decreaseQuantity('${item.name}', event)">-</button>
                          <span class="quantity-display">${item.quantity}</span>
                          <button class="quantity-btn plus" onclick="increaseQuantity('${item.name}', event)">+</button>
                      </div>
                  </div>
                  <button class="remove-item" onclick="removeFromCart('${item.name}', event)">
                      <i data-feather="trash-2"></i>
                  </button>
              </div>
          `;
          cartItemsContainer.innerHTML += cartItemHTML;
      });
  }
  
  if (cartCount) {
      cartCount.textContent = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }
  
  if (cartTotal) {
      const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      cartTotal.textContent = `IDR ${total.toLocaleString()}`;
  }
  
  if (typeof feather !== 'undefined') {
      feather.replace();
  }
}

function removeFromCart(name, event) {
  if (event) {
      event.stopPropagation();
  }
  cartItems = cartItems.filter(item => item.name !== name);
  updateCart();
}

function increaseQuantity(name, event) {
  if (event) {
      event.stopPropagation();
  }
  const item = cartItems.find(item => item.name === name);
  if (item) {
      item.quantity += 1;
      updateCart();
  }
}

function decreaseQuantity(name, event) {
  if (event) {
      event.stopPropagation();
  }
  const item = cartItems.find(item => item.name === name);
  if (item && item.quantity > 1) {
      item.quantity -= 1;
      updateCart();
  }
}

// Add to Cart Button Listeners
document.querySelectorAll('.add-to-cart-button').forEach(button => {
    button.addEventListener('click', () => {
        const name = button.getAttribute('data-item');
        const price = button.getAttribute('data-price');
        addToCart(name, price);
    });
});

// Checkout Functions
const checkoutBtn = document.querySelector('.checkout-btn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cartItems.length === 0) {
            alert('Keranjang belanja masih kosong!');
            return;
        }
        
        const checkoutModal = document.getElementById('checkout-modal');
        const orderItems = document.getElementById('order-items');
        const orderTotal = document.getElementById('order-total');
        
        if (orderItems && orderTotal) {
            orderItems.innerHTML = '';
            const total = cartItems.reduce((acc, item) => {
                const itemTotal = item.price * item.quantity;
                orderItems.innerHTML += `
                    <div class="order-item">
                        <span>${item.name} x${item.quantity}</span>
                        <span>IDR ${itemTotal.toLocaleString()}</span>
                    </div>
                `;
                return acc + itemTotal;
            }, 0);
            
            orderTotal.textContent = `IDR ${total.toLocaleString()}`;
            checkoutModal.style.display = 'flex';
        }
    });
}

// Checkout Form Handler
const checkoutForm = document.getElementById('checkout-form');
if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate form
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;

        if (!name || !email || !phone) {
            alert('Mohon lengkapi semua data');
            return;
        }

        // Validate cart
        if (cartItems.length === 0) {
            alert('Keranjang belanja masih kosong!');
            return;
        }

        try {
            // Show loading state
            const submitButton = checkoutForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Memproses...';

            // Calculate total
            const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            // Prepare transaction parameters
            const transactionParams = {
                transaction_details: {
                    order_id: 'ORDER-' + Date.now(),
                    gross_amount: total
                },
                item_details: cartItems.map(item => ({
                    id: 'ITEM-' + Date.now(),
                    price: item.price,
                    quantity: item.quantity,
                    name: item.name
                })),
                customer_details: {
                    first_name: name,
                    email: email,
                    phone: phone
                }
            };

            // Check if snap is available
            if (typeof window.snap === 'undefined') {
                throw new Error('Midtrans Snap not loaded');
            }

            // Call snap.pay
            window.snap.pay(transactionParams, {
                onSuccess: function(result) {
                    console.log('Payment success:', result);
                    alert('Pembayaran berhasil!');
                    cartItems = [];
                    updateCart();
                    document.getElementById('checkout-modal').style.display = 'none';
                    checkoutForm.reset();
                },
                onPending: function(result) {
                    console.log('Payment pending:', result);
                    alert('Menunggu pembayaran Anda!');
                },
                onError: function(result) {
                    console.error('Payment error:', result);
                    alert('Pembayaran gagal!');
                    submitButton.disabled = false;
                    submitButton.textContent = 'Lanjutkan ke Pembayaran';
                },
                onClose: function() {
                    console.log('Customer closed the popup without finishing the payment');
                    submitButton.disabled = false;
                    submitButton.textContent = 'Lanjutkan ke Pembayaran';
                    alert('Anda menutup popup tanpa menyelesaikan pembayaran');
                }
            });

        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan: ' + error.message);
            const submitButton = checkoutForm.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.textContent = 'Lanjutkan ke Pembayaran';
        }
    });
}

// Midtrans Payment Integration
function handlePayment(token) {
  window.snap.pay(token, {
      onSuccess: function(result){
          /* You may add your own implementation here */
          alert("payment success!"); 
          // Clear cart after successful payment
          cartItems = [];
          updateCart();
          // Close modal
          document.getElementById('checkout-modal').style.display = 'none';
      },
      onPending: function(result){
          /* You may add your own implementation here */
          alert("wating your payment!"); 
      },
      onError: function(result){
          /* You may add your own implementation here */
          alert("payment failed!"); 
      },
      onClose: function(){
          /* You may add your own implementation here */
          alert('you closed the popup without finishing the payment');
      }
  });
}

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        
        // Only scroll if the href is not just "#"
        if (targetId !== '#') {
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Back to Top Button
const backToTopButton = document.createElement('button');
backToTopButton.innerHTML = '↑';
backToTopButton.classList.add('back-to-top');
document.body.appendChild(backToTopButton);

window.addEventListener('scroll', () => {
    backToTopButton.style.display = window.pageYOffset > 100 ? 'block' : 'none';
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateCart();
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
});

// Remove loading spinner if exists
window.addEventListener('load', () => {
    const loader = document.querySelector('.loader-container');
    if (loader) {
        loader.style.display = 'none';
    }
});

// Add this at the start of your script.js
window.addEventListener('load', function() {
    if (typeof window.snap === 'undefined') {
        console.error('Midtrans Snap failed to load');
    } else {
        console.log('Midtrans Snap loaded successfully');
    }
});


//whatsapp integrated
function sendWhatsApp(e) {
    e.preventDefault();

    // Ambil nilai dari form
    const nama = document.getElementById('nama').value;
    const noHP = document.getElementById('noHP').value;
    const message = document.getElementById('message').value;

    const waNumber = "628980018001";

    // Format pesan
    const text = `*Pesan dari Website Belutique*
    
Halo, saya ${nama}
Nomor HP: ${noHP}

Pesan: ${message}`;

    // Encode pesan untuk URL
    const encodedText = encodeURIComponent(text);

    // Buat URL WhatsApp
    const waUrl = `https://wa.me/${waNumber}?text=${encodedText}`;

    // Buka WhatsApp di tab baru
    window.open(waUrl, '_blank');

    // Reset form
    document.getElementById('contact-form').reset();
}