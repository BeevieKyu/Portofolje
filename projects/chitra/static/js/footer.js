// Footer hero: swap the background image while a booking tag is hovered/focused.
document.addEventListener('DOMContentLoaded', function () {
    const hero = document.querySelector('.site-footer-hero');
    if (!hero) return;

    const swap = hero.querySelector('.site-footer-bg-swap');
    const tags = Array.from(hero.querySelectorAll('.site-footer-tags .tag[data-footer-bg]'));
    if (!swap || !tags.length) return;

    // Preload so the crossfade has no first-hover flash.
    tags.forEach(function (tag) {
        const img = new Image();
        img.src = tag.dataset.footerBg;
    });

    function show(tag) {
        const src = tag.dataset.footerBg;
        if (!src) return;
        if (swap.getAttribute('src') !== src) swap.setAttribute('src', src);
        swap.classList.add('is-visible');
    }

    function hide() {
        swap.classList.remove('is-visible');
    }

    tags.forEach(function (tag) {
        tag.addEventListener('mouseenter', function () { show(tag); });
        tag.addEventListener('focus', function () { show(tag); });
        tag.addEventListener('mouseleave', hide);
        tag.addEventListener('blur', hide);
    });
});
