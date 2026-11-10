const customCursor = document.querySelector('.custom-cursor');

if (customCursor && window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('pointermove', (event) => {
        customCursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) rotate(155deg)`;
    });

    document.addEventListener('pointerdown', () => {
        customCursor.classList.add('is-clicking');
    });

    document.addEventListener('pointerup', () => {
        customCursor.classList.remove('is-clicking');
    });
}