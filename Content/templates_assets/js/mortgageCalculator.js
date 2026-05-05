
//Set Value to 0 on first click
$(document).on("click", ".first-click", function () {
    $(this).val('');
    $(this).removeClass('first-click');
});

//Calculator Calculations
$(document).on('click', '#CalculateMortgageBtn', function () {
    isCheckValidation = true;

    checkValidation();
    if ($('.isValid').length === 5) {
        CalculateMortgage();
    }
});



//Calculator Calculations
function checkValidation() {
    $('.CalcInput').each(function () {
        validateForm($(this));
    });
}

//Calculator Calculations
$(document).on('change keyup', '.CalcInput', function () {
    if (isCheckValidation) {
        validateForm($(this));
    }
});

function validateForm(_this) {
    var inputVal = parseFloat(cleanPrefixSufix(_this.val()));
    var minVal = parseFloat(_this.attr('minVal'));
    var maxVal = parseFloat(_this.attr('maxVal'));
    var minError = _this.closest('.user-input-div').siblings('.calc-input-validation-min');
    var maxError = _this.closest('.user-input-div').siblings('.calc-input-validation-max');

    if (inputVal < minVal) {
        minError.show();
        maxError.hide();
        _this.removeClass('isValid');
        _this.addClass('border-color-red');
        _this.closest('.user-input-div').addClass('border-color-red');
    } else if (inputVal > maxVal) {
        maxError.show();
        minError.hide();
        _this.removeClass('isValid');
        _this.addClass('border-color-red');
        _this.closest('.user-input-div').addClass('border-color-red');
    } else {
        maxError.hide();
        minError.hide();
        _this.addClass('isValid');
        _this.removeClass('border-color-red');
        _this.closest('.user-input-div').removeClass('border-color-red');
    }
}

function CalculateMortgage() {
    var propertyPrice = parseFloat(cleanPrefixSufix($('#propertyPrice').val()));
    var LTV = parseFloat(cleanPrefixSufix($('#LTV').val())) / 100;
    var loanTenure = parseFloat(cleanPrefixSufix($('#loanTenure').val()));
    var interestRate = parseFloat(cleanPrefixSufix($('#interestRate').val())) / 100;
    var ABSD = parseFloat(cleanPrefixSufix($('#ABSD').val())) / 100;

    var loanAmount = propertyPrice * LTV;
    $('#loanAmount').val("$" + addCommas(loanAmount.toFixed(2)));

    var monthlyInstall = PMT(interestRate / 12, loanTenure * 12, loanAmount);
    $('#monthlyInstall').val("$" + addCommas(monthlyInstall.toFixed(2)));

    var downPayment = (1 - LTV) * propertyPrice;
    $('#downPayment').val("$" + addCommas(downPayment.toFixed(2)));

    var stampDuty = CalcStampDuty(propertyPrice);
    $('#stampDuty').val("$" + addCommas(stampDuty.toFixed(2)));

    var ABSDAmount = propertyPrice * ABSD;
    $('#ABSDAmount').val("$" + addCommas(ABSDAmount.toFixed(2)));

    NegativeValColor();
}

function PMT(ir, np, pv, fv, type) {
    var pmt, pvif;
    fv || (fv = 0);
    type || (type = 0);
    if (ir === 0)
        return -(pv + fv) / np;
    pvif = Math.pow(1 + ir, np);
    pmt = - ir * pv * (pvif + fv) / (pvif - 1);
    if (type === 1)
        pmt /= (1 + ir);
    return pmt;
}


function CalcStampDuty(no) {
    var no1a = no > 0 ? 1 : 0;
    var no2a = no > 180000 ? 1 : 0;
    var no3a = no > 360000 ? 1 : 0;
    var no4a = no > 1000000 ? 1 : 0;
    var no5a = no > 1500000 ? 1 : 0;
    var no6a = no > 3000000 ? 1 : 0;

    var no1b = no - 0;
    var no2b = no - 180000;
    var no3b = no - 360000;
    var no4b = no - 1000000;
    var no5b = no - 1500000;
    var no6b = no - 3000000;

    var noc = 0.01;

    var a = no1a * no1b * noc;
    var b = no2a * no2b * noc;
    var c = no3a * no3b * noc;
    var d = no4a * no4b * noc;
    var e = no5a * no5b * noc;
    var f = no6a * no6b * noc;

    var result = parseFloat(a) + parseFloat(b) + parseFloat(c) + parseFloat(d) + parseFloat(e) + parseFloat(f);
    return result;
}

function addCommas(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}
function cleanPrefixSufix(value) {
    if (value != undefined && value != '') {
        return value.replace("$", "").replace(/,/g, "").replace(/%/g, "");
    }
}

$(document).on("keyup keypress change blur change", ".CalcInput", function (event) {
    if (!((event.ctrlKey || event.metaKey) && event.which == 65)) {
        // Handle key events
        if ((event.which != 46 && event.which != 190 && event.which != 8 && event.which != 110) && ((event.which < 48 || event.which > 57) && (event.which < 96 || event.which > 106))) {
            event.preventDefault();
        }

        var $this = $(this);
        var value = $this.val();
        // If value is empty, set it to 0
        if (value === '') {
            value = '0';
        }
        // Remove non-numeric characters except dot (.)
        value = value.replace(/[^0-9\.]/g, '');
        // Remove leading zero if the first digit is 0 and a new digit is inserted
        value = value.replace(/^0(?=\d)/, '');
        // If the first character is a dot, add a leading zero
        if (value.indexOf('.') === 0) {
            value = '0' + value;
        }

        // Update the input value
        $this.val(addCommas(value));
    }
});

function NegativeValColor() {
    $(".calculated_val").each(function () {
        var $input = $(this);
        var value = ($input.length > 0) ? $input.val() : $element.text();
        var number = parseFloat(value.replace(/[\$, %]/g, '').replace(/,/g, ''));

        if (!isNaN(number)) {
            if (number < 0) {
                if ($input.length > 0) {
                    $input.addClass("negativeValueCss");
                    $input.val($input.val().replace("-", ""));
                } else {
                    $element.addClass("negativeValueCss");
                    $input.val($input.val().replace("-", ""));
                }
            } else {
                if ($input.length > 0) {
                    $input.removeClass("negativeValueCss");
                } else {
                    $element.removeClass("negativeValueCss");
                }
            }
        }
    });
}
