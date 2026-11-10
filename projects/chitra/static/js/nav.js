function openMenu(){
    const navbar = document.getElementById('mobileNav');
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.getElementById('hamburger');
    const links = document.querySelectorAll('#sidebar .sidebar-link');
    const footer = document.querySelector('#sidebar .sidebar-footer');

    navbar.classList.add('active');
    hamburger.classList.add('active');
    sidebar.classList.add('active');
    document.body.style.overflow = 'hidden';

    links.forEach(function(link, i){
        link.classList.remove('in');
        setTimeout(function(){
            link.classList.add('in');
        }, 150 + i * 70);
    });

    footer.classList.remove('in');
    setTimeout(function(){
        footer.classList.add('in');
    }, 150 + links.length * 70);
}

function closeMenu(){
    const navbar = document.getElementById('mobileNav');
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.getElementById('hamburger');
    const links = document.querySelectorAll('#sidebar .sidebar-link');
    const footer = document.querySelector('#sidebar .sidebar-footer');

    navbar.classList.remove('active');
    hamburger.classList.remove('active');
    sidebar.classList.remove('active');
    document.body.style.overflow = '';

    links.forEach(function(link){
        link.classList.remove('in');
    });
    footer.classList.remove('in');
}

function menu(){
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('active')){
        closeMenu();
    } else {
        openMenu();
    }
}

document.addEventListener('DOMContentLoaded', function(){
    const pagePrefix = window.location.pathname.includes('/pages/') ? '' : 'pages/';
    const rootPath = pagePrefix ? 'index.html' : '../index.html';
    const assetPrefix = pagePrefix ? 'static/' : '../static/';
    if (!document.getElementById('mobileNav') && document.getElementById('desNav')) {
        const mobileNav = document.createElement('div');
        mobileNav.id = 'mobileNav';
        mobileNav.innerHTML = '<div class="hamburger" id="hamburger" onclick="menu()"><span></span><span></span><span></span></div>'
            + '<a href="' + rootPath + '" class="logo"><img src="' + assetPrefix + 'images/logo/ChitraLogo.webp" alt="Chitra"></a>'
            + '<div id="sidebar"><div class="sidebar-links"></div><div class="sidebar-footer"><a href="' + pagePrefix + 'booking.html" class="button">Booking</a></div></div>';
        document.querySelector('header').insertBefore(mobileNav, document.getElementById('desNav'));
        const mobileLinks = mobileNav.querySelector('.sidebar-links');
        [['Om oss', 'om-oss.html'], ['Bryllup', 'bryllup.html'], ['Møter og konferanser', 'moter-og-konferanser.html'], ['Afternoon tea', 'afternoon-tea.html'], ['Privat arrangement', 'privat-arrangement.html'], ['Kolleksjoner', 'kolleksjoner.html'], ['Galleri', 'galleri.html']].forEach(function(page){
            const link = document.createElement('a');
            link.className = 'sidebar-link';
            link.href = pagePrefix + page[1];
            link.textContent = page[0];
            mobileLinks.appendChild(link);
        });
    }
    const arrangementPages = [
        ['Bryllup', 'bryllup.html'],
        ['Møter og konferanser', 'moter-og-konferanser.html'],
        ['Afternoon tea', 'afternoon-tea.html'],
        ['Privat arrangement', 'privat-arrangement.html']
    ];
    const desktopLinks = document.querySelector('#desNav .links');
    if (desktopLinks && !desktopLinks.querySelector('a[href*="afternoon-tea.html"]')) {
        const menu = document.createElement('details');
        menu.className = 'nav-dropdown';
        menu.setAttribute('name', 'nav-menu');
        menu.innerHTML = '<summary>Arrangementer <i class="fa-solid fa-chevron-down" aria-hidden="true"></i></summary><div class="nav-dropdown-panel"></div>';
        const panel = menu.querySelector('.nav-dropdown-panel');
        arrangementPages.forEach(function(page){
            const link = document.createElement('a');
            link.href = pagePrefix + page[1];
            link.textContent = page[0];
            panel.appendChild(link);
        });
        desktopLinks.insertBefore(menu, desktopLinks.children[1] || null);
    }
    const sidebarLinks = document.querySelector('#sidebar .sidebar-links');
    if (sidebarLinks && !sidebarLinks.querySelector('a[href*="afternoon-tea.html"]')) {
        arrangementPages.slice(2).forEach(function(page){
            const link = document.createElement('a');
            link.className = 'sidebar-link';
            link.href = pagePrefix + page[1];
            link.textContent = page[0];
            sidebarLinks.appendChild(link);
        });
    }

    document.querySelectorAll('#sidebar .sidebar-link').forEach(function(link){
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function(e){
        if (e.key === 'Escape') closeMenu();
    });

    document.addEventListener('click', function(e){
        document.querySelectorAll('#desNav details[open]').forEach(function(details){
            if (!details.contains(e.target)) details.removeAttribute('open');
        });
    });

    const langSelect = document.querySelector('.language-select');
    if (langSelect){
        const current = langSelect.querySelector('.lang-current');
        const options = langSelect.querySelectorAll('.lang-option');
        options.forEach(function(option){
            option.addEventListener('click', function(){
                options.forEach(function(o){
                    o.classList.toggle('is-active', o === option);
                    o.setAttribute('aria-checked', o === option ? 'true' : 'false');
                });
                if (current) current.textContent = option.dataset.lang;
                langSelect.removeAttribute('open');
            });
        });
    }

    const themedEls = Array.from(document.querySelectorAll('[data-nav-theme]'));
    if (themedEls.length){
        const desNav = document.getElementById('desNav');
        const mobileNav = document.getElementById('mobileNav');
        let ticking = false;

        function activeNav(){
            return window.innerWidth >= 1140 ? desNav : mobileNav;
        }

        function updateNavTheme(){
            const nav = activeNav();
            const probeY = nav ? nav.offsetHeight / 2 : 0;
            let theme = 'dark';

            themedEls.forEach(function(el){
                const rect = el.getBoundingClientRect();
                if (rect.top <= probeY && rect.bottom > probeY){
                    theme = el.dataset.navTheme;
                }
            });

            if (desNav) desNav.classList.toggle('nav-on-light', theme === 'light');
            if (mobileNav) mobileNav.classList.toggle('nav-on-light', theme === 'light');
            ticking = false;
        }

        window.addEventListener('scroll', function(){
            if (!ticking){
                window.requestAnimationFrame(updateNavTheme);
                ticking = true;
            }
        }, { passive: true });
        window.addEventListener('resize', updateNavTheme);

        updateNavTheme();
    }

    const desNavEl = document.getElementById('desNav');
    const mobileNavEl = document.getElementById('mobileNav');
    if (desNavEl || mobileNavEl){
        const sidebarEl = document.getElementById('sidebar');
        let lastScrollY = window.scrollY;
        let hideTicking = false;

        function updateNavVisibility(){
            const currentScrollY = window.scrollY;
            const sidebarOpen = sidebarEl && sidebarEl.classList.contains('active');
            const scrollingDown = currentScrollY > lastScrollY;
            const pastThreshold = currentScrollY > 80;
            const shouldHide = !sidebarOpen && scrollingDown && pastThreshold;

            if (desNavEl) desNavEl.classList.toggle('nav-hidden', shouldHide);
            if (mobileNavEl) mobileNavEl.classList.toggle('nav-hidden', shouldHide);

            lastScrollY = currentScrollY;
            hideTicking = false;
        }

        window.addEventListener('scroll', function(){
            if (!hideTicking){
                window.requestAnimationFrame(updateNavVisibility);
                hideTicking = true;
            }
        }, { passive: true });
    }
});
