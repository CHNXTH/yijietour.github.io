(function() {
    var isOrderOrContact = window.location.pathname.endsWith('order.html') || window.location.pathname.endsWith('contact.html');
    if (isOrderOrContact && window.location.hash) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
        window.scrollTo(0, 0);
    }
})();

document.addEventListener('DOMContentLoaded', function() {
    // 导航栏滚动效果
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 动画触发
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    // 观察所有需要动画的元素
    document.querySelectorAll('.section-title, .product-card').forEach(el => {
        observer.observe(el);
    });

    // 平滑滚动
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // 表单验证
    const tripForm = document.querySelector('.trip-planner form');
    if (tripForm) {
        tripForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const departure = this.querySelector('input[type="text"]').value;
            const date = this.querySelector('input[type="date"]').value;
            
            if (!departure || !date) {
                alert('请填写完整的旅程信息');
                return;
            }
            
            alert('旅程定制申请已提交，我们会尽快联系您！');
            this.reset();
        });
    }

    // 设备检测和产品卡片样式调整
    function adjustProductCardStyles() {
        const isMobile = window.innerWidth <= 768;
        const productCardImages = document.querySelectorAll('.product-card img');
        
        productCardImages.forEach(img => {
            if (isMobile) {
                img.style.height = '450px';  // 手机端高度
            } else {
                img.style.height = '380px';  // 电脑端保持原高度
            }
        });
    }

    // 初始调用
    adjustProductCardStyles();

    // 监听窗口大小变化
    window.addEventListener('resize', adjustProductCardStyles);

    // 产品卡片动画
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // 响应式导航栏处理
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    // 确保Bootstrap的Collapse实例只创建一次
    const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
        toggle: false
    });

    // 点击汉堡菜单按钮时的处理
    navbarToggler.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        bsCollapse.toggle();
    });

    // 点击导航链接时收起菜单
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 992) {  // 只在移动端处理
                bsCollapse.hide();
            }
        });
    });

    // 点击页面其他区域时收起菜单
    document.addEventListener('click', function(e) {
        if (!navbarCollapse.contains(e.target) && !navbarToggler.contains(e.target)) {
            if (navbarCollapse.classList.contains('show')) {
                bsCollapse.hide();
            }
        }
    });

    // 搜索框动画
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        searchInput.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    }

    // 全站搜索功能
    const searchForm = document.getElementById('searchForm');
    const searchResults = document.getElementById('searchResults');
    let searchModal;
    try {
        searchModal = new bootstrap.Modal(document.getElementById('searchModal'));
    } catch(e) {}

    // 优化本页面内容搜索：覆盖所有可见文字节点，且每个元素只展示一次
    function performPageSearch(searchTerm) {
        if (!searchTerm.trim()) {
            return [];
        }
        const keyword = searchTerm.trim().toLowerCase();
        const results = [];
        const seen = new Set();
        // 只搜索可见元素（不包括script、style、head等）
        function isVisible(el) {
            return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
        }
        // 递归遍历body下所有元素，只保留最内层命中的元素
        function traverse(node) {
            if (node.nodeType === 1 && isVisible(node)) {
                if (["SCRIPT","STYLE","HEAD","NOSCRIPT","TITLE","META","LINK"].includes(node.tagName)) return;
                let hasChildHit = false;
                for (let child of node.children) {
                    if (traverse(child)) hasChildHit = true;
                }
                // 如果有子元素已命中，则父元素不再作为结果
                if (hasChildHit) return true;
                const text = node.innerText || node.textContent || '';
                const textLower = text.trim().toLowerCase();
                if (textLower && textLower.includes(keyword)) {
                    if (!seen.has(node)) {
                        let context = text;
                        if (text.length > 100) {
                            const index = textLower.indexOf(keyword);
                            const start = Math.max(0, index - 50);
                            const end = Math.min(text.length, index + 50);
                            context = '...' + text.substring(start, end) + '...';
                        }
                        const highlightedContext = context.replace(
                            new RegExp(searchTerm, 'gi'),
                            match => `<span class="highlight">${match}</span>`
                        );
                        results.push({
                            category: node.tagName.toLowerCase(),
                            context: highlightedContext,
                            element: node
                        });
                        seen.add(node);
                    }
                    return true;
                }
                return false;
            }
            return false;
        }
        traverse(document.body);
        return results;
    }

    function displayPageSearchResults(results) {
        if (!searchResults) return;
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-no-results">未找到相关内容</div>';
            return;
        }
        searchResults.innerHTML = results.map(result => `
            <div class="search-result-item">
                <h6>${result.category}</h6>
                <p>${result.context}</p>
            </div>
        `).join('');
        // 点击结果高亮定位
        const resultItems = searchResults.querySelectorAll('.search-result-item');
        resultItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                const targetElement = results[index].element;
                if (searchModal) searchModal.hide();
                setTimeout(() => {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    targetElement.style.backgroundColor = 'rgba(46, 125, 50, 0.1)';
                    setTimeout(() => {
                        targetElement.style.backgroundColor = '';
                    }, 2000);
                }, 300);
            });
        });
    }

    if (searchForm && searchInput && searchResults) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchTerm = searchInput.value;
            const results = performPageSearch(searchTerm);
            displayPageSearchResults(results);
            if (searchModal) searchModal.show();
        });
    }

    // 多选下拉框处理
    const interestDropdown = document.getElementById('interestDropdown');
    const dropdownItems = document.querySelectorAll('.trip-planner .dropdown-item');
    const selectedInterests = document.getElementById('selectedInterests');
    const selectedValues = new Set();

    // 阻止下拉菜单自动关闭
    document.querySelector('.trip-planner .dropdown-menu').addEventListener('click', function(e) {
        e.stopPropagation();
    });

    dropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();  // 阻止事件冒泡
            const value = this.getAttribute('data-value');
            
            if (this.classList.contains('selected')) {
                this.classList.remove('selected');
                selectedValues.delete(value);
            } else {
                this.classList.add('selected');
                selectedValues.add(value);
            }

            // 更新按钮文本和样式
            if (selectedValues.size === 0) {
                interestDropdown.textContent = '请选择感兴趣的项目';
                interestDropdown.classList.remove('has-value');
            } else if (selectedValues.size <= 2) {
                interestDropdown.textContent = Array.from(selectedValues).join('、');
                interestDropdown.classList.add('has-value');
            } else {
                interestDropdown.textContent = `已选择 ${selectedValues.size} 个项目`;
                interestDropdown.classList.add('has-value');
            }

            // 更新隐藏输入框的值
            selectedInterests.value = Array.from(selectedValues).join(',');
        });
    });

    // 点击下拉框以外的区域时关闭下拉框
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.trip-planner .dropdown')) {
            const dropdownMenu = document.querySelector('.trip-planner .dropdown-menu');
            const bsDropdown = bootstrap.Dropdown.getInstance(interestDropdown);
            if (bsDropdown) {
                bsDropdown.hide();
            }
        }
    });

    // 已在HTML <head>中阻止锚点跳转，这里无需再补救
}); 