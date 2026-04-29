document.addEventListener('DOMContentLoaded', () => {
    const WHATSAPP_NUMBER = '212635939690';
    const ADMIN_EMAIL = 'raymoweb1@gmail.com';

    // --- Preloader Control & Page Transitions ---
    window.hidePreloader = function() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.classList.add('fade-out');
            // We do NOT remove it from DOM so we can reuse it for transitions
        }
    }

    window.showPreloader = function() {
        let preloader = document.getElementById('preloader');
        if (!preloader) {
            // Re-create if missing
            preloader = document.createElement('div');
            preloader.id = 'preloader';
            preloader.innerHTML = `
                <div class="loader-content">
                    <div class="loader-logo">Miftah Saada</div>
                    <div class="loader-bar"><div class="bar-progress"></div></div>
                </div>
            `;
            document.body.appendChild(preloader);
        }
        preloader.classList.remove('fade-out');
    };

    // Fallback: hide preloader after 5 seconds anyway
    setTimeout(window.hidePreloader, 5000);

    window.addEventListener('load', () => {
        if (!document.querySelector('.products-grid') && !document.querySelector('.offers-grid')) {
            window.hidePreloader();
        }
    });

    // Intercept internal links for smooth transitions
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function(e) {
            const target = this.getAttribute('href');
            // Check if it's an internal link
            if (target && !target.startsWith('#') && !target.startsWith('javascript') && !target.startsWith('http') && !target.startsWith('mailto') && !target.startsWith('tel') && this.getAttribute('target') !== '_blank') {
                e.preventDefault();
                window.showPreloader();
                setTimeout(() => {
                    window.location.href = target;
                }, 400); // Wait for fade-in animation
            }
        });
    });


    // Load Dynamic Settings Immediately
    loadSiteSettings();

    // --- Dark Mode Logic ---
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const theme = savedTheme || systemTheme;
        
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeIcon(theme);
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        
        if (window.showToast) {
            const msg = newTheme === 'dark' ? 'تم تفعيل الوضع الليلي' : 'تم تفعيل الوضع النهاري';
            window.showToast(msg, 'success');
        }
    }

    function updateThemeIcon(theme) {
        const icons = document.querySelectorAll('#theme-toggle i');
        icons.forEach(icon => {
            if (theme === 'dark') {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
        });
    }

    // Initialize theme
    initTheme();

    // Event delegation for theme toggle
    document.addEventListener('click', (e) => {
        if (e.target.closest('#theme-toggle')) {
            toggleTheme();
        }
    });

    // --- نظام التنبيهات (Toast System) ---
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);

    window.showToast = function (message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        let icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-exclamation-circle';
        if (type === 'warning') icon = 'fa-exclamation-triangle';

        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => { toast.remove(); }, 500);
        }, 4000);
    };

    // --- حركة أيقونة السلة (Cart Animation) ---
    function animateCartIcon() {
        const cartIcon = document.querySelector('.fa-shopping-cart');
        if (cartIcon) {
            cartIcon.parentElement.classList.add('cart-wiggle');
            setTimeout(() => {
                cartIcon.parentElement.classList.remove('cart-wiggle');
            }, 500);
        }
    }

    // --- تحديث عداد السلة (Update Cart Count) ---
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('miftah_saada_cart')) || [];
        const count = cart.reduce((acc, item) => acc + item.quantity, 0);
        document.querySelectorAll('.cart-count').forEach(el => el.textContent = count);
    }

    // --- إدارة السلة (Cart Management) ---
    window.addToCart = function (id, name, price, img) {
        let cart = JSON.parse(localStorage.getItem('miftah_saada_cart')) || [];
        const existing = cart.find(item => item.id === id);

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ id, name, price: parseFloat(price), img, quantity: 1 });
        }

        localStorage.setItem('miftah_saada_cart', JSON.stringify(cart));
        showToast(`تم إضافة ${name} إلى السلة`);
        animateCartIcon();
        updateCartCount();
        if (window.location.pathname.includes('cart.html')) renderCart();
    };

    window.removeFromCart = function (id) {
        let cart = JSON.parse(localStorage.getItem('miftah_saada_cart')) || [];
        cart = cart.filter(item => item.id !== id);
        localStorage.setItem('miftah_saada_cart', JSON.stringify(cart));
        updateCartCount();
        renderCart();
    };

    window.updateQuantity = function (id, change) {
        let cart = JSON.parse(localStorage.getItem('miftah_saada_cart')) || [];
        const item = cart.find(i => i.id === id);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeFromCart(id);
            } else {
                localStorage.setItem('miftah_saada_cart', JSON.stringify(cart));
                updateCartCount();
                renderCart();
            }
        }
    };

    // --- عرض محتويات السلة (Render Cart) ---
    function renderCart() {
        const cartList = document.getElementById('cart-items-list');
        const mainLayout = document.getElementById('cart-main-layout');
        const emptyView = document.getElementById('empty-cart-view');
        const loader = document.getElementById('cart-loader');
        
        if (!cartList) return;

        const cart = JSON.parse(localStorage.getItem('miftah_saada_cart')) || [];
        
        if (loader) loader.style.display = 'none';

        if (cart.length === 0) {
            mainLayout.style.display = 'none';
            emptyView.style.display = 'block';
            return;
        }

        mainLayout.style.display = 'grid';
        emptyView.style.display = 'none';

        let subtotal = 0;
        cartList.innerHTML = cart.map(item => {
            subtotal += item.price * item.quantity;
            return `
                <div class="cart-item">
                    <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-info">
                        <h3>${item.name}</h3>
                        <p class="price">${item.price.toLocaleString()} درهم</p>
                    </div>
                    <div class="cart-item-actions">
                        <div style="display: flex; align-items: center; gap: 10px; background: #f8fafc; padding: 5px; border-radius: 12px; border: 1px solid #f1f5f9;">
                            <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)"><i class="fas fa-plus"></i></button>
                            <span style="font-weight: 900; min-width: 25px; text-align: center;">${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)"><i class="fas fa-minus"></i></button>
                        </div>
                        <button class="remove-btn" onclick="removeFromCart('${item.id}')">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('subtotal-display').textContent = subtotal.toLocaleString() + ' درهم';
        document.getElementById('total-display').textContent = subtotal.toLocaleString() + ' درهم';
    }

    // --- جلب وعرض المنتجات مع Skeleton Screen ---
    async function renderGlobalProducts() {
        const productsGrids = document.querySelectorAll('.products-grid, .offers-grid');
        if (productsGrids.length === 0) return;

        // إظهار هيكل التحميل (Skeleton)
        const skeletonHTML = `
            <div class="product-card skeleton-card">
                <div class="skeleton-img"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-text short"></div>
            </div>
        `.repeat(4);
        productsGrids.forEach(grid => grid.innerHTML = skeletonHTML);

        if (!window.supabaseClient) return;

        const { data: cloudProducts, error } = await window.supabaseClient.from('products').select('*').order('created_at', { ascending: false });

        if (error) {
            console.error("Supabase Error:", error);
            productsGrids.forEach(grid => grid.innerHTML = '<p style="text-align:center; width:100%; padding: 40px;">عذراً، تعذر تحميل المنتجات حالياً. يرجى المحاولة لاحقاً.</p>');
            return;
        }

        if (!cloudProducts || cloudProducts.length === 0) {
            productsGrids.forEach(grid => grid.innerHTML = '<p style="text-align:center; width:100%; padding: 40px;">لا توجد منتجات متوفرة حالياً. تابعونا قريباً!</p>');
            return;
        }

        productsGrids.forEach(grid => {
            const isOffers = grid.classList.contains('offers-grid');
            let displayedProducts = [...cloudProducts];
            
            if (isOffers) {
                // Priority to products with old_price
                const discounted = cloudProducts.filter(p => p.old_price && p.old_price > p.price);
                displayedProducts = discounted.length > 0 ? discounted.slice(0, 4) : cloudProducts.slice(0, 4);
            }

            grid.innerHTML = displayedProducts.map(prod => {
                const thumbUrl = prod.media_urls?.[0]?.url || 'assets/no-image.jpg';
                const hasDiscount = prod.old_price && parseFloat(prod.old_price) > parseFloat(prod.price);
                const discountPercent = hasDiscount ? Math.round(((prod.old_price - prod.price) / prod.old_price) * 100) : 0;

                return `
                    <div class="product-card">
                        ${hasDiscount ? `<div class="discount-badge">-${discountPercent}%</div>` : ''}
                        <div class="product-img">
                            <a href="product.html?id=${prod.id}"><img src="${thumbUrl}" alt="${prod.name}" loading="lazy"></a>
                        </div>
                        <div class="product-info">
                            <span class="category">${prod.brand || 'منتج أصلي'}</span>
                            <h3><a href="product.html?id=${prod.id}">${prod.name}</a></h3>
                            <div class="price">
                                <span class="current">${parseFloat(prod.price).toLocaleString()} درهم</span>
                                ${hasDiscount ? `<span class="old">${parseFloat(prod.old_price).toLocaleString()} درهم</span>` : ''}
                            </div>
                            <button class="btn ${isOffers ? 'btn-yellow' : 'btn-outline'} w-100 add-to-cart" 
                                data-id="${prod.id}" data-name="${prod.name}" data-price="${prod.price}" data-img="${thumbUrl}">
                                <i class="fas ${isOffers ? 'fa-cart-plus' : 'fa-shopping-cart'}"></i> أضف إلى السلة
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        });

        // Hide preloader after products are rendered
        window.hidePreloader();

    }

    // --- Global Event Delegation for Add-to-Cart Buttons ---
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-to-cart');
        if (btn) {
            const { id, name, price, img } = btn.dataset;
            if (id && name && price && window.addToCart) {
                window.addToCart(id, name, parseFloat(price), img || 'assets/no-image.jpg');
            }
        }
    }, { once: false });


    // --- Dynamic Site Settings with Retry Mechanism ---
    async function loadSiteSettings(retries = 5) {
        if (!window.supabaseClient) {
            if (retries > 0) {
                console.log(`⏳ Waiting for Supabase... (${retries} attempts left)`);
                setTimeout(() => loadSiteSettings(retries - 1), 500);
            }
            return;
        }
        
        try {
            const { data: settings, error } = await window.supabaseClient
                .from('site_settings')
                .select('*')
                .eq('id', 1)
                .maybeSingle(); // Use maybeSingle to avoid error if no row exists

            if (error) throw error;
            if (settings) {
                applySiteSettings(settings);
                console.log("✅ Site settings loaded from Cloud:", settings);
            } else {
                console.warn("⚠️ No site settings found (ID: 1). Using defaults.");
            }
        } catch (err) {
            console.error("Error loading site settings:", err);
        }
    }

    function applySiteSettings(s) {
        if (!s || window.settingsApplied) return;

        // 0. Global Theme Colors
        if (s.primary_color) {
            const hexToRgb = (hex) => {
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                return `${r}, ${g}, ${b}`;
            };
            
            document.documentElement.style.setProperty('--primary-color', s.primary_color);
            document.documentElement.style.setProperty('--primary-color-shadow', `rgba(${hexToRgb(s.primary_color)}, 0.3)`);
            document.documentElement.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${s.primary_color}, ${s.secondary_color || '#3b82f6'})`);
        }
        if (s.secondary_color) {
            document.documentElement.style.setProperty('--secondary-color', s.secondary_color);
        }

        // 1. Store Name / Logo
        if (s.store_name) {
            const parts = s.store_name.trim().split(' ');
            const formattedName = parts.length > 1 
                ? `${parts[0]} <span>${parts.slice(1).join(' ')}</span>`
                : s.store_name;
            
            document.querySelectorAll('#site-logo-name, #footer-logo-name').forEach(el => {
                if (s.logo_url) {
                    el.innerHTML = `<img src="${s.logo_url}" alt="${s.store_name}" class="site-logo-img">`;
                } else {
                    el.innerHTML = formattedName;
                }
            });

            const loginDesc = document.getElementById('login-card-desc');
            const registerDesc = document.getElementById('register-card-desc');
            if (loginDesc) loginDesc.textContent = `مرحباً بك مجدداً في متجر ${s.store_name}`;
            if (registerDesc) registerDesc.textContent = `إنشاء حساب جديد للانضمام إلى ${s.store_name}`;
            
            // Smartly update page title based on current page
            const currentTitleParts = document.title.split('|');
            const pageSuffix = currentTitleParts.length > 1 ? currentTitleParts[1].trim() : 'الرئيسية';
            document.title = `${s.store_name} | ${pageSuffix}`;
        }

        // 2. Hero Section
        const heroTitle = document.getElementById('hero-title');
        const heroSubtitle = document.getElementById('hero-subtitle');
        const heroSection = document.getElementById('hero-section');

        if (heroTitle && s.hero_title) heroTitle.textContent = s.hero_title;
        if (heroSubtitle && s.hero_subtitle) heroSubtitle.textContent = s.hero_subtitle;
        if (heroSection && s.hero_image_url && s.hero_image_url.trim().length > 10) {
            const cacheBuster = `v=${new Date().getTime()}`;
            const fullUrl = s.hero_image_url.includes('?') 
                ? `${s.hero_image_url}&${cacheBuster}` 
                : `${s.hero_image_url}?${cacheBuster}`;
            
            heroSection.style.setProperty('background-image', `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('${fullUrl}')`, 'important');
        }
        
        // 3. WhatsApp Link
        if (s.whatsapp_number) {
            const waBtn = document.getElementById('whatsapp-float-btn');
            if (waBtn) waBtn.href = `https://wa.me/${s.whatsapp_number.replace(/\s+/g, '')}`;
        }

        // 4. Contact Info & Description
        if (s.store_description) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.content = s.store_description;
            const footerDesc = document.getElementById('footer-description');
            if (footerDesc) footerDesc.textContent = s.store_description;
        }

        const footerPhone = document.getElementById('footer-phone');
        const footerWA = document.getElementById('footer-whatsapp');
        const footerLoc = document.getElementById('footer-location');
        const footerCopyright = document.getElementById('footer-copyright');

        if (footerPhone && s.phone_number) footerPhone.textContent = s.phone_number;
        if (footerWA && s.whatsapp_number) footerWA.textContent = `+${s.whatsapp_number}`;
        if (footerLoc && s.location) footerLoc.textContent = s.location;
        if (footerCopyright && s.footer_copyright) footerCopyright.textContent = s.footer_copyright;

        // 4.1 Floating WhatsApp Link
        const floatWA = document.getElementById('whatsapp-float-link');
        if (floatWA && s.whatsapp_number) floatWA.href = `https://wa.me/${s.whatsapp_number.replace(/\+/g, '')}`;

        // 5. Social Links
        const fb = document.getElementById('footer-facebook');
        const insta = document.getElementById('footer-instagram');
        const tiktok = document.getElementById('footer-tiktok');

        if (fb && s.facebook_url) fb.href = s.facebook_url;
        if (insta && s.instagram_url) insta.href = s.instagram_url;
        if (tiktok && s.tiktok_url) tiktok.href = s.tiktok_url;

        // 6. Announcement Bar (Storefront only)
        if (s.announcement_text && !window.location.pathname.includes('admin.html')) {
            let bar = document.getElementById('announcement-bar');
            if (!bar) {
                bar = document.createElement('div');
                bar.id = 'announcement-bar';
                bar.className = 'announcement-bar';
                document.body.prepend(bar);
            }
            
            // Create a robust infinite marquee with two identical groups
            const separator = '<i class="fas fa-star" style="margin: 0 30px; font-size: 0.7rem; opacity: 0.6;"></i>';
            const items = `<span>${s.announcement_text}${separator}</span>`.repeat(10);
            bar.innerHTML = `
                <div class="marquee-content">${items}</div>
                <div class="marquee-content" aria-hidden="true">${items}</div>
            `;
            bar.style.display = 'flex';
        }

        // 7. Contact Page Specifics
        const contactHeroTitle = document.getElementById('contact-hero-title');
        const contactHeroSubtitle = document.getElementById('contact-hero-subtitle');
        const contactPhoneLink = document.getElementById('contact-phone-link');
        const contactPhoneText = document.getElementById('contact-phone-text');
        const contactWALink = document.getElementById('contact-whatsapp-link');
        const contactLocText = document.getElementById('contact-location-text');
        const contactMapIframe = document.getElementById('contact-map-iframe');
        const contactEmailLink = document.getElementById('contact-email-link');
        const contactEmailText = document.getElementById('contact-email-text');

        if (contactHeroTitle && s.contact_hero_title) contactHeroTitle.textContent = s.contact_hero_title;
        if (contactHeroSubtitle && s.contact_hero_subtitle) contactHeroSubtitle.textContent = s.contact_hero_subtitle;
        if (contactPhoneText && s.phone_number) contactPhoneText.textContent = s.phone_number;
        if (contactPhoneLink && s.phone_number) contactPhoneLink.href = `tel:${s.phone_number.replace(/\s+/g, '')}`;
        if (contactWALink && s.whatsapp_number) contactWALink.href = `https://wa.me/${s.whatsapp_number.replace(/\+/g, '')}`;
        if (contactLocText && s.location) contactLocText.textContent = s.location;
        if (contactMapIframe && s.contact_map_url) contactMapIframe.src = s.contact_map_url;
        if (contactEmailText && s.contact_email) contactEmailText.textContent = s.contact_email;
        if (contactEmailLink && s.contact_email) contactEmailLink.href = `mailto:${s.contact_email}`;

        window.settingsApplied = true;
    }

    updateCartCount();
    // Only run global product renderer on pages WITHOUT their own product loading logic
    // shop.html has its own initShopProducts() with filtering support
    if (!window.location.pathname.includes('shop.html')) {
        renderGlobalProducts();
    }
    if (window.location.pathname.includes('cart.html')) renderCart();
    
    // --- Mobile Menu Toggle logic ---
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    const overlay = document.querySelector('.menu-overlay');
    const navLinks = document.querySelectorAll('.nav-list a');

    if (menuBtn && navMenu && overlay) {
        function toggleMenu() {
            navMenu.classList.toggle('active');
            overlay.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        }

        menuBtn.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) toggleMenu();
            });
        });
    }
});