// Galleri page — balanced column masonry. Every figure is placed into whichever
// column is currently shortest, so the columns stay even and there are never
// any gaps. Re-runs as images load and when the column count changes on resize.
(function () {
    var grid = document.querySelector('.gallery-grid');
    if (!grid) return;

    var figures = Array.prototype.slice.call(grid.querySelectorAll('.gallery-item'));
    if (!figures.length) return;

    function columnCount() {
        if (window.matchMedia('(min-width: 1140px)').matches) return 4;
        if (window.matchMedia('(min-width: 700px)').matches) return 3;
        return 2;
    }

    var currentCount = 0;
    var scheduled = false;

    function distribute() {
        scheduled = false;
        var count = columnCount();

        grid.classList.add('gallery-grid--js');
        grid.textContent = '';
        currentCount = count;

        var cols = [];
        for (var i = 0; i < count; i++) {
            var col = document.createElement('div');
            col.className = 'gallery-col';
            grid.appendChild(col);
            cols.push(col);
        }

        figures.forEach(function (fig) {
            var shortest = cols[0];
            for (var j = 1; j < cols.length; j++) {
                if (cols[j].offsetHeight < shortest.offsetHeight) shortest = cols[j];
            }
            shortest.appendChild(fig);
        });
    }

    function schedule() {
        if (scheduled) return;
        scheduled = true;
        window.requestAnimationFrame(distribute);
    }

    figures.forEach(function (fig) {
        var img = fig.querySelector('img');
        if (img && !img.complete) {
            img.addEventListener('load', schedule);
            img.addEventListener('error', schedule);
        }
    });

    distribute();
    window.addEventListener('load', schedule);

    var resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            if (columnCount() !== currentCount) distribute();
        }, 150);
    }, { passive: true });
})();
