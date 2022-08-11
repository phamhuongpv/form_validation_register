function Validator(options) {
    const selectorRules = {}; // Lưu trữ các rule, mỗi rule 1 đối tượng, 1 rule có nhiều kiểu validate thì lưu dạng array
    
    // Hàm thực hiện validate
    function validate(inputElement, rule) {
        var errorMessage; //lấy dữ liệu từ validate
        var messageElement = inputElement.closest(options.formGroupSelector).querySelector(options.errorMessage); //Lấy element thông báo lỗi
        var rules = selectorRules[rule.selector]; // Lấy ra các rule của selector
        // Lập qua các rule của selector nếu có lỗi thì dừng việc kiểm tra
        for (var i = 0; i < rules.length; i++) {
            switch(inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'));
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if(errorMessage) break;
        }
        
        if(errorMessage) {
            messageElement.innerText = errorMessage;
            inputElement.closest(options.formGroupSelector).classList.add('invalid');
        }
        else {
            messageElement.innerText = '';
            inputElement.closest(options.formGroupSelector).classList.remove('invalid');
        }
        
        return !errorMessage;
    }
    
    // Lấy element của form cần validate
    var formElement = document.querySelector(options.form);

    if(formElement) {
        // Duyệt qua các rule và xử lí
        options.rules.forEach(rule => {
            // Lưu các rule vào đổi tượng chứa rule
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            }
            else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElement = formElement.querySelector(rule.selector);
            if(inputElement) {
                // Xử lí trường hợp blur ra khỏi input
                inputElement.onblur = function() {
                    validate(inputElement, rule);
                }

                // Xử lí mỗi khi người dùng nhập
                inputElement.oninput = function() {
                    var messageElement = inputElement.closest(options.formGroupSelector).querySelector('.form-message');
                    messageElement.innerText = '';
                    inputElement.closest(options.formGroupSelector).classList.remove('invalid');
                }
                
                // Xử lí trường hợp thay đổi giá trị select
                inputElement.onchange = function() {
                    validate(inputElement, rule);
                }
            }
        });

        //Xử lí submit form
        formElement.onsubmit = function(e) {
            e.preventDefault();
            var isVlaid = true;

            options.rules.forEach(rule => {
                var inputElement = formElement.querySelector(rule.selector);
                var isError = validate(inputElement, rule);
                if(!isError) {
                    isVlaid = false;
                }
            });

            if(isVlaid) {
                // Trường hợp submit với js
                if(typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');
                    var formValue = Array.from(enableInputs).reduce(function(values, input) {
                        switch(input.type) {
                            case 'radio':
                                if (input.matches(':checked')) {
                                    values[input.name] = input.value;
                                }
                                break;
                            case 'checkbox':
                                if(!input.matches(':checked')) {
                                    values[input.name] = '';
                                    return values;
                                }
                                if(!Array.isArray(values[input.name])) {
                                    values[input.name] = []
                                }
                                values[input.name].push(input.value);
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        return values;
                    }, {});
                    options.onSubmit(formValue)
                }

                // Trường hợp submit với hành động mặc định
                else {
                    formElement.submit();
                }
            }
            else console.log('that bai')
        }
    }
}

// Trường hợp không được để trống
Validator.isRequired = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            return value ? undefined : message ||'Vui lòng nhập trường này';
        }
    }
}

// Trường hợp phải là email
Validator.isEmail = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Email không đúng định dạng';
        }
    }
}

// Trường hợp số kí tự tối thiểu
Validator.minLength = function(selector, min, message) {
    return {
        selector: selector,
        test: function(value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự`;
        }
    }
}

// Xác nhận lại thông tin đã nhập
Validator.isConfirmed = function(selector, getConfirValue, message) {
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirValue() ? undefined : message || 'Giá trị nhập lại không chính xác';
        }
    }
}