(function () {
    document.addEventListener('DOMContentLoaded', function () {
        var shell = document.querySelector('.dash-shell');
        var menuToggle = document.getElementById('dashMenuToggle');
        if (menuToggle && shell) {
            menuToggle.addEventListener('click', function () {
                shell.classList.toggle('is-sidebar-open');
            });
        }

        // ---------- Delete confirmation modal ----------
        var modal = document.getElementById('dashConfirmModal');
        var deleteForm = document.getElementById('dashDeleteForm');
        if (modal && deleteForm) {
            var nameEl = document.getElementById('dashConfirmName');
            var okBtn = document.getElementById('dashConfirmOk');
            var cancelBtn = document.getElementById('dashConfirmCancel');

            function closeModal() { modal.hidden = true; }

            document.querySelectorAll('[data-confirm-delete]').forEach(function (trigger) {
                trigger.addEventListener('click', function () {
                    if (nameEl) nameEl.textContent = trigger.dataset.name || '';
                    deleteForm.action = trigger.dataset.action;
                    modal.hidden = false;
                });
            });

            if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
            modal.addEventListener('click', function (e) {
                if (e.target === modal) closeModal();
            });
            if (okBtn) okBtn.addEventListener('click', function () { deleteForm.submit(); });
        }

        // ---------- Auto-dismiss flash messages ----------
        document.querySelectorAll('.dash-flash').forEach(function (flash) {
            setTimeout(function () { flash.classList.add('is-leaving'); }, 4000);
        });
    });
})();
