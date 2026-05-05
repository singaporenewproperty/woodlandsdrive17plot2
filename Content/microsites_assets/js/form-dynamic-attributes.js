/**
 * Auto-Name Fixer for Form Inputs
 * 
 * Fallback chain:
 *  1. name already set       → do nothing
 *  2. name missing/empty     → use [id]
 *  3. id also missing/empty  → use [type]_[formIndex]_[inputIndex]
 *  4. type is also generic   → use input_[formIndex]_[UUID-like counter]
 */

(function ($) {

    // Global counter to guarantee uniqueness across the entire page
    var _uid = 0;

    function generateFallbackName(formIndex, inputIndex, $el) {
        var type = ($el.attr('type') || $el.prop('tagName').toLowerCase() || 'input')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, ''); // sanitize

        // Avoid vague type names being used as-is
        var vague = ['input', 'text', 'hidden', 'submit', 'button', 'reset'];
        if (vague.indexOf(type) !== -1) {
            type = 'field';
        }

        return type + '_f' + formIndex + '_' + (++_uid);
    }

    function sanitizeName(raw) {
        // HTML name attributes must not have spaces; replace with underscores
        return raw.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-:.]/g, '');
    }

    $.fn.autoFixInputNames = function () {
        return this.each(function (formIndex) {
            var $form = $(this);

            // All "input-like" elements inside this form
            var $inputs = $form.find(
                'input, textarea, select, ' +
                'input[type="checkbox"], input[type="radio"], ' +
                'input[type="file"], input[type="range"], input[type="color"]'
            );

            $inputs.each(function (inputIndex) {
                var $el = $(this);
                var nameVal = $.trim($el.attr('name') || '');

                // ── CASE 1: name already has a value → leave it alone ──────────────
                if (nameVal !== '') {
                    //console.log('[autoFixInputNames] ✔ has name:', nameVal, $el[0]);
                    return; // continue .each()
                }

                var assignedName;

                // ── CASE 2: no name → try id ────────────────────────────────────────
                var idVal = $.trim($el.attr('id') || '');
                if (idVal !== '') {
                    assignedName = sanitizeName(idVal);
                    //console.log(
                    //    '[autoFixInputNames] ⚠ missing name, used id →', assignedName, $el[0]
                    //);
                }

                // ── CASE 3: no id either → generate a meaningful fallback ───────────
                else {
                    assignedName = generateFallbackName(formIndex, inputIndex, $el);
                    //console.warn(
                    //    '[autoFixInputNames] ✘ missing name AND id, generated →',
                    //    assignedName, $el[0]
                    //);
                }

                $el.attr('name', assignedName);

                // Optional: mark it so you can find auto-named fields later
                $el.attr('data-autonamed', 'true');
            });
        });
    };

}(jQuery));


(function ($) {
    $.fn.autoFixFormAccessibility = function () {
        return this.each(function () {
            var $form = $(this);

            // Add role="form" if missing
            if (!$form.attr('role')) {
                $form.attr('role', 'form');
            }

            // Add aria-label if missing (and no aria-labelledby)
            if (!$form.attr('aria-label') && !$form.attr('aria-labelledby')) {
                var formId = $form.attr('id');
                var label = formId
                    ? formId
                        .replace(/[-_]/g, ' ')
                        .replace(/([a-z])([A-Z])/g, '$1 $2')
                        .replace(/\b\w/g, function (c) { return c.toUpperCase(); })
                    : 'Enquiry Form';

                $form.attr('aria-label', label);
            }
        });
    };

})(jQuery);

(function ($) {
    $.fn.autoFixMaxLength = function () {

        var defaults = {
            'text': 100,
            'email': 254,
            'tel': 15,
            'textarea': 1000,
            'password': 128,
            'search': 200,
            'url': 2048
        };

        return this.each(function () {
            var $form = $(this);

            $form.find('input, textarea').each(function () {
                var $input = $(this);
                var type = $input.attr('type') || 'text';
                var name = ($input.attr('name') || '').toLowerCase();
                var tagName = this.tagName.toLowerCase();

                // Skip these types entirely
                var skipTypes = ['hidden', 'submit', 'button',
                    'checkbox', 'radio', 'file',
                    'range', 'color', 'date'];
                if (skipTypes.indexOf(type) !== -1) return;

                // Already has maxlength — skip
                if ($input.attr('maxlength')) return;

                // --- Name-based overrides (more specific than type) ---
                var limit = null;

                if (/nric|ic\b/.test(name)) limit = 9;
                else if (/postal|postcode|zipcode/.test(name)) limit = 6;
                else if (/phone|mobile|tel|contact/.test(name)) limit = 15;
                else if (/email/.test(name)) limit = 254;
                else if (/name/.test(name)) limit = 100;
                else if (/message|enquiry|remark/.test(name)) limit = 1000;
                else if (/agent|code|ref/.test(name)) limit = 20;

                // --- Fall back to type-based default ---
                if (!limit) {
                    limit = tagName === 'textarea'
                        ? defaults['textarea']
                        : defaults[type] || defaults['text'];
                }

                $input.attr('maxlength', limit);
                //console.warn('autoFixMaxLength: maxlength=' + limit + ' applied to [name="' + $input.attr('name') + '"]');
            });
        });
    };
})(jQuery);

(function ($) {
    $.fn.autoFixAutocomplete = function () {

        var nameMap = {
            name: 'name',
            fullname: 'name',
            firstname: 'given-name',
            lastname: 'family-name',
            email: 'email',
            phone: 'tel',
            mobile: 'tel',
            contact: 'tel',
            company: 'organization',
            address: 'street-address',
            postal: 'postal-code',
            postcode: 'postal-code',
            country: 'country',
            message: 'off',
            enquiry: 'off',
            remark: 'off',
            nric: 'off',
            password: 'current-password',
            agentcode: 'off',
            ref: 'off'
        };

        return this.each(function () {
            var $form = $(this);

            $form.find('input, textarea').each(function () {
                var $input = $(this);
                var type = $input.attr('type') || 'text';
                var name = ($input.attr('name') || '').toLowerCase()
                    .replace(/[-_\s]/g, '');

                var skipTypes = ['hidden', 'submit', 'button',
                    'checkbox', 'radio', 'file'];
                if (skipTypes.indexOf(type) !== -1) return;

                // Already has specific autocomplete — skip
                var existing = $input.attr('autocomplete');
                if (existing && existing !== 'on') return;

                // Match against nameMap
                var matched = null;
                $.each(nameMap, function (key, value) {
                    if (name.indexOf(key) !== -1) {
                        matched = value;
                        return false; // break
                    }
                });

                if (matched) {
                    $input.attr('autocomplete', matched);
                    //console.warn(
                    //    'autoFixAutocomplete: autocomplete="' + matched +
                    //    '" applied to [name="' + $input.attr('name') + '"]'
                    //);
                }
            });
        });
    };
})(jQuery);

// ── Auto-run on DOM ready ──────────────────────────────────────────────────
$(function () {
    setTimeout(function () {
        $('form').autoFixInputNames();
        $('form').autoFixFormAccessibility();
        $('form').autoFixMaxLength();
        $('body').autoFixAutocomplete();

        document.querySelectorAll('svg').forEach(function (svg) {
            if (!svg.hasAttribute('aria-label') && !svg.hasAttribute('role')) {
                svg.setAttribute('focusable', 'false');
                svg.setAttribute('aria-hidden', 'true');
                svg.setAttribute('tabindex', '-1');
            }
        });

    }, 2500); // adjust delay in ms as needed
});;