document.addEventListener('DOMContentLoaded', function () {
    const bubble = document.querySelector('.fact-bubble');
    const factSection = bubble && bubble.closest('.fact');
    if (!factSection) return;

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                bubble.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    observer.observe(factSection);

    const tributeReveal = document.querySelector('.tribute-reveal');
    const tributeRevealFill = tributeReveal && tributeReveal.querySelector('.tribute-reveal-fill');
    if (tributeReveal && tributeRevealFill) {
        const minScale = 0.32;
        const maxScale = 1;
        let ticking = false;

        function updateTributeRevealScale() {
            const rect = tributeReveal.getBoundingClientRect();
            // Finish growing while the section is still ~half a viewport from
            // the top, so the dome is full size before the cream cap scrolls
            // into view and there is never a dark gap at the seam.
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
    }
});
