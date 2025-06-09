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

    // 搜索功能实现
    const searchForm = document.getElementById('searchForm');
    const searchResults = document.getElementById('searchResults');
    const searchModal = new bootstrap.Modal(document.getElementById('searchModal'));
    
    // 定义要搜索的内容区域
    const searchableAreas = [
        { selector: '.hero-section h1, .hero-section p', category: '首页横幅' },
        { selector: '.trip-planner .card', category: '旅程定制' },
        { selector: '#brand-story', category: '品牌故事' },
        { selector: '#countryside', category: '畅游乡野' },
        { selector: '#products', category: '金桃佳品' },
        { selector: '.media-item', category: '媒体聚焦' },
        { selector: '.footer-contact, .footer-about', category: '联系信息' }
    ];

    function performSearch(searchTerm) {
        if (!searchTerm.trim()) {
            return [];
        }

        const results = [];
        searchableAreas.forEach(area => {
            const elements = document.querySelectorAll(area.selector);
            elements.forEach(element => {
                const text = element.textContent.toLowerCase();
                const searchTermLower = searchTerm.toLowerCase();
                
                if (text.includes(searchTermLower)) {
                    // 提取匹配文本的上下文
                    let context = text;
                    if (text.length > 100) {
                        const index = text.indexOf(searchTermLower);
                        const start = Math.max(0, index - 50);
                        const end = Math.min(text.length, index + 50);
                        context = '...' + text.substring(start, end) + '...';
                    }
                    
                    // 高亮搜索词
                    const highlightedContext = context.replace(
                        new RegExp(searchTerm, 'gi'),
                        match => `<span class="highlight">${match}</span>`
                    );
                    
                    results.push({
                        category: area.category,
                        context: highlightedContext,
                        element: element
                    });
                }
            });
        });
        
        return results;
    }

    function displaySearchResults(results) {
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-no-results">未找到相关内容</div>';
            return;
        }

        const resultsHTML = results.map(result => `
            <div class="search-result-item">
                <h6>${result.category}</h6>
                <p>${result.context}</p>
            </div>
        `).join('');

        searchResults.innerHTML = resultsHTML;

        // 为搜索结果添加点击事件
        const resultItems = searchResults.querySelectorAll('.search-result-item');
        resultItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                const targetElement = results[index].element;
                searchModal.hide();
                setTimeout(() => {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // 添加临时高亮效果
                    targetElement.style.backgroundColor = 'rgba(46, 125, 50, 0.1)';
                    setTimeout(() => {
                        targetElement.style.backgroundColor = '';
                    }, 2000);
                }, 300);
            });
        });
    }

    // 处理搜索表单提交
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const searchTerm = searchInput.value;
        const results = performSearch(searchTerm);
        displaySearchResults(results);
        searchModal.show();
    });

    // 实时搜索（可选）
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = this.value;
            if (searchTerm.length >= 2) {  // 至少输入2个字符才开始搜索
                const results = performSearch(searchTerm);
                displaySearchResults(results);
                searchModal.show();
            }
        }, 300);  // 300ms 防抖
    });
}); 