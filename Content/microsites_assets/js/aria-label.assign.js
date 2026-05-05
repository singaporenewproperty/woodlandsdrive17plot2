$(function () {

    const EXEMPT_TYPES = ['hidden', 'submit', 'button', 'reset', 'image'];

    // ── Core function: assign aria-label to a single element ──────────────
    function assignAriaLabel(el) {
        const $el = $(el);

        if (el.tagName === 'INPUT') {
            const type = ($el.attr('type') || 'text').toLowerCase();
            if (EXEMPT_TYPES.includes(type)) return;
        }

        if ($el.attr('aria-label') || $el.attr('aria-labelledby')) return;

        const label =
            $el.attr('placeholder') ||
            $el.attr('name') ||
            $el.attr('id') ||
            `${el.tagName.toLowerCase()} field`;

        $el.attr('aria-label', label);
    }

    // ── Run on all existing inputs on page load ────────────────────────────
    $('input, textarea, select').each(function () {
        assignAriaLabel(this);
    });

    // ── Debounce: prevents firing too many times during rapid DOM changes ──
    let debounceTimer = null;

    function debounce(fn, delay) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(fn, delay);
    }

    // ── MutationObserver: watches for new elements added to the DOM ────────
    const observer = new MutationObserver(function (mutations) {
        debounce(function () {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {

                    // If the added node itself is an input
                    if (node.nodeType === 1) {
                        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(node.tagName)) {
                            assignAriaLabel(node);
                        }

                        // Also check any inputs inside the added node (e.g. a whole section loaded)
                        $(node).find('input, textarea, select').each(function () {
                            assignAriaLabel(this);
                        });
                    }

                });
            });
        }, 300); // 300ms debounce delay — adjust if needed
    });

    // Observe the entire document for any added child nodes
    observer.observe(document.body, {
        childList: true,  // watch for added/removed nodes
        subtree: true     // watch all descendants, not just direct children
    });

});