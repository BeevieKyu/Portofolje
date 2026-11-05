document.addEventListener('DOMContentLoaded', function () {
    // Ball reveal — copied from om-oss.js. The LigthBall dome grows from a small
    // scale to full size as the section scrolls up into view, so it is at full
    // size before the cream cap arrives and there is never a dark gap at the seam.
    const tributeReveal = document.querySelector('.tribute-reveal');
    const tributeRevealFill = tributeReveal && tributeReveal.querySelector('.tribute-reveal-fill');
    if (!tributeReveal || !tributeRevealFill) return;

    const minScale = 0.32;
    const maxScale = 1;
    let ticking = false;

    function updateTributeRevealScale() {
        const rect = tributeReveal.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight * 0.55)));
        const scale = minScale + progress * (maxScale - minScale);
        tributeRevealFill.style.transform = 'scale(' + scale.toFixed(4) + ')';
        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(updateTributeRevealScale);
            ticking = true;
        }
    }, { passive: true });

    updateTributeRevealScale();
});
