(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.CarameloMask = factory();
    }
}(typeof self !== 'undefined' ? self : this, function() {
    'use strict';

    class CarameloMask {
        constructor(el, mask, options) {
            this.el = typeof el === 'string' ? document.querySelector(el) : el;
            this.options = options || {};
            
            // Check for named masks
            if (CarameloMask.masks[mask]) {
                const config = CarameloMask.masks[mask];
                this.maskPattern = config.mask;
                // Merge options, giving priority to user options but ensuring callbacks run
                const userOptions = this.options;
                const configOptions = config.options || {};
                
                this.options = { ...configOptions, ...userOptions };
                
                // If both have callbacks, we might need to chain them (simple overwrite for now is risky for logic)
                // For dynamic masks, the internal logic (onKeyPress) is crucial.
                // We'll wrap the user callback if needed, but for simplicity, we assume named masks control the logic
                // and user might add onComplete/onChange.
                
                // Specially handle onKeyPress to ensure dynamic switching works
                if (configOptions.onKeyPress) {
                    const internalHandler = configOptions.onKeyPress;
                    const userHandler = userOptions.onKeyPress;
                    this.options.onKeyPress = function(val, e, field, options) {
                        internalHandler(val, e, field, options);
                        if (userHandler) userHandler(val, e, field, options);
                    };
                }
            } else {
                this.maskPattern = mask;
            }

            // Default translations
            this.translation = {
                '0': { pattern: /\d/ },
                '9': { pattern: /\d/, optional: true },
                '#': { pattern: /\d/, recursive: true },
                'A': { pattern: /[a-zA-Z0-9]/ },
                'S': { pattern: /[a-zA-Z]/ }
            };

            // Merge custom translations
            if (this.options.translation) {
                Object.assign(this.translation, this.options.translation);
            }

            this.invalid = [];
            
            // Bind methods
            this.handler = this.behaviour.bind(this);
            this.onKeydown = this.onKeydown.bind(this);
            this.onPaste = this.onPaste.bind(this);
            this.onChange = this.onChange.bind(this);
            this.onBlur = this.onBlur.bind(this);
            this.onFocus = this.onFocus.bind(this);

            this.init();
        }

        init() {
            if (!this.el) return;
            
            // Clean up existing instance if any
            if (this.el.CarameloMask) {
                this.el.CarameloMask.unbindEvents();
            }
            
            // Store instance
            this.el.CarameloMask = this;
            
            this.bindEvents();
            
            // Initial masking
            if (this.el.tagName === 'INPUT' || this.el.tagName === 'TEXTAREA') {
                const val = this.getMasked();
                this.val(val);
            }
        }

        bindEvents() {
            this.params = {
                watchInterval: 300,
                watchInputs: true
            };
            
            this.el.addEventListener('keydown', this.onKeydown);
            this.el.addEventListener('input', this.handler);
            this.el.addEventListener('keyup', this.handler);
            this.el.addEventListener('paste', this.onPaste);
            this.el.addEventListener('change', this.onChange);
            this.el.addEventListener('blur', this.onBlur);
            this.el.addEventListener('focus', this.onFocus);
        }

        unbindEvents() {
            if (!this.el) return;
            this.el.removeEventListener('keydown', this.onKeydown);
            this.el.removeEventListener('input', this.handler);
            this.el.removeEventListener('keyup', this.handler);
            this.el.removeEventListener('paste', this.onPaste);
            this.el.removeEventListener('change', this.onChange);
            this.el.removeEventListener('blur', this.onBlur);
            this.el.removeEventListener('focus', this.onFocus);
        }

        onKeydown(e) {
            this.lastKeyCode = e.keyCode || e.which;
            this.oldValue = this.val();
        }

        onPaste(e) {
            // Small delay to allow value to populate
            setTimeout(() => {
                this.handler(e);
            }, 10);
        }

        onChange() {
            this.changed = true;
        }

        onBlur() {
            if (this.oldValue !== this.val() && !this.changed) {
                this.el.dispatchEvent(new Event('change'));
            }
            this.changed = false;
        }

        onFocus(e) {
            if (this.options.selectOnFocus) {
                this.el.select();
            }
        }

        behaviour(e) {
            this.invalid = [];
            const keyCode = this.lastKeyCode;
            
            // Ignore certain keys (arrow keys, etc.) to allow navigation
            const byPassKeys = [9, 16, 17, 18, 36, 37, 38, 39, 40, 91];
            if (byPassKeys.includes(keyCode)) {
                return;
            }

            const caretPos = this.getCaret();
            const newVal = this.getMasked();
            const currentVal = this.val();
            
            if (currentVal !== newVal) {
                this.val(newVal); // Set the new value
                this.setCaret(this.calculateCaretPosition(caretPos, newVal));
            }
            
            const finalVal = this.val();
            
            // Callbacks
            if (this.options.onComplete && finalVal.length === this.maskPattern.length) {
                this.options.onComplete.call(this, finalVal, e, this.el, this.options);
            }
            if (this.options.onChange && finalVal !== this.oldValue) {
                this.options.onChange.call(this, finalVal, e, this.el, this.options);
            }
            if (this.options.onKeyPress && finalVal !== this.oldValue) {
                this.options.onKeyPress.call(this, finalVal, e, this.el, this.options);
            }
        }

        calculateCaretPosition(caretPos, newVal) {
            const oldValue = this.oldValue || '';
            const oValueL = oldValue.length;
            const newValL = newVal.length;
            
            // Edge cases handling (similar to original)
            if (this.lastKeyCode === 8 && oldValue !== newVal) {
                // Backspace
                caretPos = caretPos - (newVal.slice(0, caretPos).length - oldValue.slice(0, caretPos).length);
            } else if (oldValue !== newVal) {
                // Typing
                if (caretPos >= oValueL) {
                    caretPos = newValL;
                } else {
                     caretPos = caretPos + (newVal.slice(0, caretPos).length - oldValue.slice(0, caretPos).length);
                }
            }
            return caretPos;
        }

        getMasked(skipMaskChars, val) {
            const buf = [];
            const value = val === undefined ? this.val() : val + '';
            const mask = this.maskPattern;
            const maskLen = mask.length;
            const valLen = value.length;
            
            let offset = 1;
            let addMethod = 'push';
            let resetPos = -1;
            let lastMaskChar;
            let check;

            let m = 0;
            let v = 0;

            if (this.options.reverse) {
                addMethod = 'unshift';
                offset = -1;
                lastMaskChar = 0;
                m = maskLen - 1;
                v = valLen - 1;
                check = () => m > -1 && v > -1;
            } else {
                lastMaskChar = maskLen - 1;
                check = () => m < maskLen && v < valLen;
            }

            let lastUntranslatedMaskChar;

            while (check()) {
                const maskDigit = mask.charAt(m);
                const valDigit = value.charAt(v);
                const translation = this.translation[maskDigit];

                if (translation) {
                    if (valDigit.match(translation.pattern)) {
                        buf[addMethod](valDigit);
                        if (translation.recursive) {
                            if (resetPos === -1) {
                                resetPos = m;
                            } else if (m === lastMaskChar) {
                                m = resetPos - offset;
                            }
                            if (lastMaskChar === resetPos) {
                                m -= offset;
                            }
                        }
                        m += offset;
                    } else if (valDigit === lastUntranslatedMaskChar) {
                        lastUntranslatedMaskChar = undefined;
                    } else if (translation.optional) {
                        m += offset;
                        v -= offset;
                    } else if (translation.fallback) {
                        buf[addMethod](translation.fallback);
                        m += offset;
                        v -= offset;
                    } else {
                        this.invalid.push({p: v, v: valDigit, e: translation.pattern});
                    }
                    v += offset;
                } else {
                    if (!skipMaskChars) {
                        buf[addMethod](maskDigit);
                    }
                    if (valDigit === maskDigit) {
                        v += offset;
                    } else {
                        lastUntranslatedMaskChar = maskDigit;
                    }
                    m += offset;
                }
            }

            const lastMaskCharDigit = mask.charAt(lastMaskChar);
            if (maskLen === valLen + 1 && !this.translation[lastMaskCharDigit]) {
                buf.push(lastMaskCharDigit);
            }

            return buf.join('');
        }

        val(v) {
            if (arguments.length > 0) {
                if (this.el.tagName === 'INPUT' || this.el.tagName === 'TEXTAREA') {
                    this.el.value = v;
                } else {
                    this.el.textContent = v;
                }
                return this.el;
            }
            if (this.el.tagName === 'INPUT' || this.el.tagName === 'TEXTAREA') {
                return this.el.value;
            } else {
                return this.el.textContent;
            }
        }

        getCaret() {
            try {
                let pos = 0;
                if (document.selection && navigator.appVersion.indexOf('MSIE 10') === -1) {
                   // Legacy IE support omitted for brevity/modernity, but here's placeholder
                   // ...
                } else if (this.el.selectionStart || this.el.selectionStart === '0') {
                    pos = this.el.selectionStart;
                }
                return pos;
            } catch (e) { return 0; }
        }

        setCaret(pos) {
            try {
                if (this.el === document.activeElement) {
                   if (this.el.setSelectionRange) {
                       this.el.setSelectionRange(pos, pos);
                   }
                }
            } catch (e) {}
        }
        
        unmask() {
            this.unbindEvents();
            this.val(this.getCleanVal());
        }
        
        getCleanVal() {
           return this.getMasked(true);
        }

        static maskAll() {
            const elements = document.querySelectorAll('[data-mask]');
            elements.forEach(el => {
                const mask = el.getAttribute('data-mask');
                // parse options
                const options = {};
                if (el.getAttribute('data-mask-reverse') === 'true') options.reverse = true;
                if (el.getAttribute('data-mask-selectonfocus') === 'true') options.selectOnFocus = true;
                
                new CarameloMask(el, mask, options);
            });
        }
        
        static maskInput(el) {
             const mask = el.getAttribute('data-mask');
             if(mask) {
                const options = {};
                if (el.getAttribute('data-mask-reverse') === 'true') options.reverse = true;
                if (el.getAttribute('data-mask-selectonfocus') === 'true') options.selectOnFocus = true;
                 new CarameloMask(el, mask, options);
             }
        }
    }
    
    // Auto init
    document.addEventListener('DOMContentLoaded', () => {
        CarameloMask.maskAll();
    });

    // Predefined named masks
    CarameloMask.masks = {
        'CPF_CNPJ': {
            mask: 'AAA.AAA.AAA-AAA',
            options: {
                onKeyPress: function(val, e, field, options) {
                    const masks = ['AAA.AAA.AAA-AAA', 'AA.AAA.AAA/AAAA-00'];
                    const digits = val.replace(/[^a-zA-Z0-9]/g, '');
                    const mask = (digits.length > 11) ? masks[1] : masks[0];
                    if (field.CarameloMask.maskPattern !== mask) {
                         new CarameloMask(field, mask, options);
                    }
                }
            }
        },
        'CELULAR_TELEFONE': {
            mask: '(00) 0000-00009',
            options: {
                 onKeyPress: function(val, e, field, options) {
                    const masks = ['(00) 0000-00009', '(00) 00000-0000'];
                    const digits = val.replace(/\D/g, '');
                    const mask = (digits.length > 10) ? masks[1] : masks[0];
                    if (field.CarameloMask.maskPattern !== mask) {
                         new CarameloMask(field, mask, options);
                     }
                }
            }
        }
    };

    return CarameloMask;
}));
