document.addEventListener('DOMContentLoaded', function () {
    const anchors = Array.from(document.querySelectorAll('.scroll-track .scroll-anchor'));
    if (anchors.length) {
        const layers = anchors.map(function (anchor) {
            const layer = document.querySelector('.photo-layer[data-layer="' + anchor.dataset.layer + '"]');
            return {
                anchor: anchor,
                layer: layer,
                img: layer && layer.querySelector('img'),
                content: layer && layer.querySelector('.content')
            };
        }).filter(function (item) { return item.layer; });

        // Which photo currently owns the viewport - only used to make that
        // layer's links clickable and lift it in the stack. Cheap, event-driven,
        // never per-frame.
        const activeObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                const item = layers.find(function (l) { return l.anchor === entry.target; });
                if (item) item.layer.classList.toggle('is-active', entry.isIntersecting);
            });
        }, { threshold: 0.5 });
        layers.forEach(function (item) { activeObserver.observe(item.anchor); });

        // The crossfade + zoom + text drift run in CSS as scroll-driven
        // animations (compositor thread - immune to main-thread jank). This rAF
        // path is the fallback for browsers without `animation-timeline`, and is
        // also switched on if the CSS path fails to resolve its timelines.
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // `d` is a layer's distance from centred, in screen-heights. The fade
        // width scales with the actual anchor spacing (CSS `--scene-scroll`), so
        // bumping that one value stretches the whole effect in both paths.
        const FADE_FRAC = 1.15;   // how far (in inter-scene distances) a layer fades over
        const TEXT_SHIFT = 44;    // px the text drifts across a scene
        const SCALE_MIN = 1.03;
        const SCALE_MAX = 1.18;

        const clamp01 = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
        const ease = function (t) { t = clamp01(t); return t * t * (3 - 2 * t); };

        let viewportH = window.innerHeight;
        let span = 1;             // distance between adjacent anchors, in screen-heights
        let fade = FADE_FRAC;
        let ticking = false;
        let jsFadeOn = false;

        function measure() {
            viewportH = window.innerHeight;
            const scrollY = window.pageYOffset;
            layers.forEach(function (item) {
                item.top = item.anchor.getBoundingClientRect().top + scrollY;
            });
            span = layers.length > 1
                ? (layers[1].top - layers[0].top) / viewportH
                : 1;
            fade = span * FADE_FRAC;
        }

        function render() {
            const scrollY = window.pageYOffset;
            for (let i = 0; i < layers.length; i++) {
                const item = layers[i];
                const d = (scrollY - item.top) / viewportH;
                const opacity = ease(1 - Math.abs(d) / fade);

                // Text and photo share one opacity - they fade together.
                item.layer.style.opacity = opacity;

                if (reduceMotion) continue;

                if (item.img) {
                    const zoom = SCALE_MIN + clamp01(0.5 + d / (2 * span)) * (SCALE_MAX - SCALE_MIN);
                    item.img.style.transform = 'scale3d(' + zoom.toFixed(5) + ',' + zoom.toFixed(5) + ',1)';
                }
                if (item.content) {
                    item.content.style.transform = 'translate3d(0,' + (d / span * -TEXT_SHIFT).toFixed(2) + 'px,0)';
                    item.content.style.opacity = opacity;
                }
            }
            ticking = false;
        }

        function requestRender() {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(render);
            }
        }

        function enableJsFade() {
            if (jsFadeOn) return;
            jsFadeOn = true;
            window.addEventListener('scroll', requestRender, { passive: true });
            window.addEventListener('resize', function () { measure(); requestRender(); });
            measure();
            render();
        }

        const hasScrollTimeline = window.CSS && CSS.supports &&
            (CSS.supports('animation-timeline: view()') || CSS.supports('animation-timeline', 'view()'));

        if (!hasScrollTimeline) {
            enableJsFade();
        } else {
            // CSS owns it - but verify the timelines actually resolved. If the
            // first scene reads fully transparent while pinned at the top, the
            // scroll-driven path is broken; take over in JS.
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    if (window.pageYOffset < viewportH * 0.5) {
                        const op = parseFloat(getComputedStyle(layers[0].layer).opacity);
                        if (!(op > 0.01)) enableJsFade();
                    }
                });
            });
        }
    }

    const storyImg = document.querySelector('.story-photo img');
    const storySection = storyImg && storyImg.closest('.story');
    if (storySection) {
        const minScale = 1;
        const maxScale = 1.18;
        let ticking = false;

        function updateStoryZoom() {
            const rect = storySection.getBoundingClientRect();
            const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / window.innerHeight));
            const scale = minScale + progress * (maxScale - minScale);
            storyImg.style.transform = 'scale(' + scale.toFixed(4) + ')';
            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(updateStoryZoom);
                ticking = true;
            }
        }, { passive: true });

        updateStoryZoom();
    }

    const stairsPhoto = document.querySelector('.stairs-photo');
    const stairsImg = stairsPhoto && stairsPhoto.querySelector('img');
    if (stairsPhoto && stairsImg) {
        const minScale = 0.32;
        const maxScale = 1;
        let ticking = false;

        function updateStairsScale() {
            const rect = stairsPhoto.getBoundingClientRect();
            const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / window.innerHeight));
            const scale = minScale + progress * (maxScale - minScale);
            stairsImg.style.transform = 'scale(' + scale.toFixed(4) + ')';
            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(updateStairsScale);
                ticking = true;
            }
        }, { passive: true });

        updateStairsScale();
    }

    const glimpseTrack = document.querySelector('.glimpse-track');
    if (glimpseTrack) {
        const glimpseGallery = glimpseTrack.parentElement;
        const glimpseInner = glimpseGallery.parentElement;
        const slideCount = parseInt(glimpseTrack.dataset.slides, 10) || 0;
        const images = Array.from(glimpseTrack.children);

        if (slideCount > 1 && images.length === slideCount * 2) {
            const visibleCount = Math.min(3, slideCount);
            const glimpseSection = document.querySelector('.glimpse');
            const glimpseHeading = glimpseSection.querySelector('h2');
            const glimpseButton = glimpseSection.querySelector('.button');
            const imageRatio = 512 / 735; // width / height, matches the source photos

            function sizeGlimpseImages() {
                const gap = parseFloat(getComputedStyle(glimpseTrack).columnGap) || 0;
                const innerStyle = getComputedStyle(glimpseInner);
                const innerPadding = (parseFloat(innerStyle.paddingLeft) || 0) + (parseFloat(innerStyle.paddingRight) || 0);
                const availableWidth = glimpseInner.clientWidth - innerPadding;
                const itemWidth = (availableWidth - gap * (visibleCount - 1)) / visibleCount;
                const naturalHeight = itemWidth / imageRatio;

                // Width always fills the full available space so the outer photos
                // stay flush with the logo/booking-button edges. Height is free to
                // stretch beyond the natural aspect ratio (object-fit crops it) to
                // fill leftover vertical space on tall viewports, closing the gap
                // above/below the section instead of leaving it centered and empty.
                let itemHeight = naturalHeight;
                if (window.innerWidth >= 1140) {
                    const sectionStyle = getComputedStyle(glimpseSection);
                    const reservedTop = parseFloat(sectionStyle.paddingTop) || 0;
                    const reservedBottom = parseFloat(sectionStyle.paddingBottom) || 0;
                    const chromeHeight = glimpseHeading.offsetHeight
                        + parseFloat(getComputedStyle(glimpseHeading).marginBottom)
                        + parseFloat(getComputedStyle(glimpseGallery).marginBottom)
                        + glimpseButton.offsetHeight;
                    const maxImgHeight = window.innerHeight - reservedTop - reservedBottom - chromeHeight;
                    itemHeight = Math.max(naturalHeight, maxImgHeight);
                }

                images.forEach(function (img) {
                    img.style.width = itemWidth + 'px';
                    img.style.height = itemHeight + 'px';
                });

                glimpseGallery.style.width = availableWidth + 'px';
            }

            sizeGlimpseImages();
            window.addEventListener('resize', sizeGlimpseImages);

            let step = 0;

            setInterval(function () {
                step++;
                const gap = parseFloat(getComputedStyle(glimpseTrack).columnGap) || 0;
                const slideWidth = images[0].getBoundingClientRect().width + gap;
                glimpseTrack.style.transform = 'translateX(-' + (slideWidth * step) + 'px)';

                if (step === slideCount) {
                    setTimeout(function () {
                        glimpseTrack.style.transition = 'none';
                        glimpseTrack.style.transform = 'translateX(0)';
                        void glimpseTrack.offsetWidth;
                        glimpseTrack.style.transition = '';
                        step = 0;
                    }, 700);
                }
            }, 2000);
        }
    }
});
