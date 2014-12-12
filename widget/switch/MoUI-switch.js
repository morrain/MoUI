/* ========================================================================
MoUI-switch
date:2014-12-7
author:morrain
 * ========================================================================
 */

(function ($, window) {
    "use strict";

    var defaultOptions = {
        state: true,
        size: null,
        animate: true,
        disabled: false,
        readonly: false,
        indeterminate: false,
        inverse: false,
        radioAllOff: false,
        onColor: "primary",
        offColor: "default",
        onText: "ON",
        offText: "OFF",
        labelText: "&nbsp;",
        handleWidth: "auto",
        labelWidth: "auto",
        baseClass: "MoUI-switch",
        wrapperClass: "wrapper",
        onInit: function () {},
        onSwitchChange: function () {}
    };

    function MoUISwitch(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, defaultOptions, {
            state: this.$element.is(":checked"),
            size: this.$element.data("size"),
            animate: this.$element.data("animate"),
            disabled: this.$element.is(":disabled"),
            readonly: this.$element.is("[readonly]"),
            indeterminate: this.$element.data("indeterminate"),
            inverse: this.$element.data("inverse"),
            radioAllOff: this.$element.data("radio-all-off"),
            onColor: this.$element.data("on-color"),
            offColor: this.$element.data("off-color"),
            onText: this.$element.data("on-text"),
            offText: this.$element.data("off-text"),
            labelText: this.$element.data("label-text"),
            handleWidth: this.$element.data("handle-width"),
            labelWidth: this.$element.data("label-width"),
            baseClass: this.$element.data("base-class"),
            wrapperClass: this.$element.data("wrapper-class")
        }, this.$element.data("options"), options);
        this.$wrapper = $("<div>", {
            "class": (function (_this) {
                return function () {
                    var classes;
                    classes = ["" + _this.options.baseClass].concat(_this._getClasses(_this.options.wrapperClass));
                    classes.push(_this.options.state ? "" + _this.options.baseClass + "-on" : "" + _this.options.baseClass + "-off");
                    if (_this.options.size != null) {
                        classes.push("" + _this.options.baseClass + "-" + _this.options.size);
                    }
                    if (_this.options.disabled) {
                        classes.push("" + _this.options.baseClass + "-disabled");
                    }
                    if (_this.options.readonly) {
                        classes.push("" + _this.options.baseClass + "-readonly");
                    }
                    if (_this.options.indeterminate) {
                        classes.push("" + _this.options.baseClass + "-indeterminate");
                    }
                    if (_this.options.inverse) {
                        classes.push("" + _this.options.baseClass + "-inverse");
                    }
                    if (_this.$element.attr("id")) {
                        classes.push("" + _this.options.baseClass + "-id-" + (_this.$element.attr("id")));
                    }
                    return classes.join(" ");
                };
            })(this)()
        });
        this.$container = $("<div>", {
            "class": "" + this.options.baseClass + "-container"
        });
        this.$on = $("<span>", {
            html: this.options.onText,
            "class": "" + this.options.baseClass + "-handle-on " + this.options.baseClass + "-" + this.options.onColor
        });
        this.$off = $("<span>", {
            html: this.options.offText,
            "class": "" + this.options.baseClass + "-handle-off " + this.options.baseClass + "-" + this.options.offColor
        });
        this.$label = $("<span>", {
            html: this.options.labelText,
            "class": "" + this.options.baseClass + "-label"
        });
        this.$element.on("init.MoUISwitch", (function (_this) {
            return function () {
                return _this.options.onInit.apply(element, arguments);
            };
        })(this));
        this.$element.on("switchChange.MoUISwitch", (function (_this) {
            return function () {
                return _this.options.onSwitchChange.apply(element, arguments);
            };
        })(this));
        this.$container = this.$element.wrap(this.$container).parent();
        this.$wrapper = this.$container.wrap(this.$wrapper).parent();
        this.$element.before(this.options.inverse ? this.$off : this.$on).before(this.$label).before(this.options.inverse ? this.$on : this.$off);
        if (this.options.indeterminate) {
            this.$element.prop("indeterminate", true);
        }
        this._initWidth();
        this._containerPosition(this.options.state, (function (_this) {
            return function () {
                if (_this.options.animate) {
                    return _this.$wrapper.addClass("" + _this.options.baseClass + "-animate");
                }
            };
        })(this));
        this._elementHandlers();
        this._handleHandlers();
        this._labelHandlers();
        this._formHandler();
        this._externalLabelHandler();
        this.$element.trigger("init.MoUISwitch");
    }

    MoUISwitch.prototype.constructor = MoUISwitch;

    MoUISwitch.prototype.state = function (value, skip) {
        if (typeof value === "undefined") {
            return this.options.state;
        }
        if (this.options.disabled || this.options.readonly) {
            return this.$element;
        }
        if (this.options.state && !this.options.radioAllOff && this.$element.is(":radio")) {
            return this.$element;
        }
        if (this.options.indeterminate) {
            this.indeterminate(false);
            value = true;
        } else {
            value = !!value;
        }
        this.$element.prop("checked", value).trigger("change.MoUISwitch", skip);
        return this.$element;
    };

    MoUISwitch.prototype.toggleState = function (skip) {
        if (this.options.disabled || this.options.readonly) {
            return this.$element;
        }
        if (this.options.indeterminate) {
            this.indeterminate(false);
            return this.state(true);
        } else {
            return this.$element.prop("checked", !this.options.state).trigger("change.MoUISwitch", skip);
        }
    };

    MoUISwitch.prototype.size = function (value) {
        if (typeof value === "undefined") {
            return this.options.size;
        }
        if (this.options.size != null) {
            this.$wrapper.removeClass("" + this.options.baseClass + "-" + this.options.size);
        }
        if (value) {
            this.$wrapper.addClass("" + this.options.baseClass + "-" + value);
        }
        this._width();
        this.options.size = value;
        return this.$element;
    };

    MoUISwitch.prototype.animate = function (value) {
        if (typeof value === "undefined") {
            return this.options.animate;
        }
        value = !!value;
        if (value === this.options.animate) {
            return this.$element;
        }
        return this.toggleAnimate();
    };

    MoUISwitch.prototype.toggleAnimate = function () {
        this.options.animate = !this.options.animate;
        this.$wrapper.toggleClass("" + this.options.baseClass + "-animate");
        return this.$element;
    };

    MoUISwitch.prototype.disabled = function (value) {
        if (typeof value === "undefined") {
            return this.options.disabled;
        }
        value = !!value;
        if (value === this.options.disabled) {
            return this.$element;
        }
        return this.toggleDisabled();
    };

    MoUISwitch.prototype.toggleDisabled = function () {
        this.options.disabled = !this.options.disabled;
        this.$element.prop("disabled", this.options.disabled);
        this.$wrapper.toggleClass("" + this.options.baseClass + "-disabled");
        return this.$element;
    };

    MoUISwitch.prototype.readonly = function (value) {
        if (typeof value === "undefined") {
            return this.options.readonly;
        }
        value = !!value;
        if (value === this.options.readonly) {
            return this.$element;
        }
        return this.toggleReadonly();
    };

    MoUISwitch.prototype.toggleReadonly = function () {
        this.options.readonly = !this.options.readonly;
        this.$element.prop("readonly", this.options.readonly);
        this.$wrapper.toggleClass("" + this.options.baseClass + "-readonly");
        return this.$element;
    };

    MoUISwitch.prototype.indeterminate = function (value) {
        if (typeof value === "undefined") {
            return this.options.indeterminate;
        }
        value = !!value;
        if (value === this.options.indeterminate) {
            return this.$element;
        }
        return this.toggleIndeterminate();
    };

    MoUISwitch.prototype.toggleIndeterminate = function () {
        this.options.indeterminate = !this.options.indeterminate;
        this.$element.prop("indeterminate", this.options.indeterminate);
        this.$wrapper.toggleClass("" + this.options.baseClass + "-indeterminate");
        this._containerPosition();
        return this.$element;
    };

    MoUISwitch.prototype.inverse = function (value) {
        if (typeof value === "undefined") {
            return this.options.inverse;
        }
        value = !!value;
        if (value === this.options.inverse) {
            return this.$element;
        }
        return this.toggleInverse();
    };

    MoUISwitch.prototype.toggleInverse = function () {
        var $off, $on;
        this.$wrapper.toggleClass("" + this.options.baseClass + "-inverse");
        $on = this.$on.clone(true);
        $off = this.$off.clone(true);
        this.$on.replaceWith($off);
        this.$off.replaceWith($on);
        this.$on = $off;
        this.$off = $on;
        this.options.inverse = !this.options.inverse;
        return this.$element;
    };

    MoUISwitch.prototype.onColor = function (value) {
        var color;
        color = this.options.onColor;
        if (typeof value === "undefined") {
            return color;
        }
        if (color != null) {
            this.$on.removeClass("" + this.options.baseClass + "-" + color);
        }
        this.$on.addClass("" + this.options.baseClass + "-" + value);
        this.options.onColor = value;
        return this.$element;
    };

    MoUISwitch.prototype.offColor = function (value) {
        var color;
        color = this.options.offColor;
        if (typeof value === "undefined") {
            return color;
        }
        if (color != null) {
            this.$off.removeClass("" + this.options.baseClass + "-" + color);
        }
        this.$off.addClass("" + this.options.baseClass + "-" + value);
        this.options.offColor = value;
        return this.$element;
    };

    MoUISwitch.prototype.onText = function (value) {
        if (typeof value === "undefined") {
            return this.options.onText;
        }
        this.$on.html(value);
        this._width();
        this._containerPosition();
        this.options.onText = value;
        return this.$element;
    };

    MoUISwitch.prototype.offText = function (value) {
        if (typeof value === "undefined") {
            return this.options.offText;
        }
        this.$off.html(value);
        this._width();
        this._containerPosition();
        this.options.offText = value;
        return this.$element;
    };

    MoUISwitch.prototype.labelText = function (value) {
        if (typeof value === "undefined") {
            return this.options.labelText;
        }
        this.$label.html(value);
        this._width();
        this.options.labelText = value;
        return this.$element;
    };

    MoUISwitch.prototype.handleWidth = function (value) {
        if (typeof value === "undefined") {
            return this.options.handleWidth;
        }
        this.options.handleWidth = value;
        this._width();
        this._containerPosition();
        return this.$element;
    };

    MoUISwitch.prototype.labelWidth = function (value) {
        if (typeof value === "undefined") {
            return this.options.labelWidth;
        }
        this.options.labelWidth = value;
        this._width();
        this._containerPosition();
        return this.$element;
    };

    MoUISwitch.prototype.baseClass = function (value) {
        return this.options.baseClass;
    };

    MoUISwitch.prototype.wrapperClass = function (value) {
        if (typeof value === "undefined") {
            return this.options.wrapperClass;
        }
        if (!value) {
            value = defaultOptions.wrapperClass;
        }
        this.$wrapper.removeClass(this._getClasses(this.options.wrapperClass).join(" "));
        this.$wrapper.addClass(this._getClasses(value).join(" "));
        this.options.wrapperClass = value;
        return this.$element;
    };

    MoUISwitch.prototype.radioAllOff = function (value) {
        if (typeof value === "undefined") {
            return this.options.radioAllOff;
        }
        value = !!value;
        if (value === this.options.radioAllOff) {
            return this.$element;
        }
        this.options.radioAllOff = value;
        return this.$element;
    };

    MoUISwitch.prototype.onInit = function (value) {
        if (typeof value === "undefined") {
            return this.options.onInit;
        }
        if (!value) {
            value = defaultOptions.onInit;
        }
        this.options.onInit = value;
        return this.$element;
    };

    MoUISwitch.prototype.onSwitchChange = function (value) {
        if (typeof value === "undefined") {
            return this.options.onSwitchChange;
        }
        if (!value) {
            value = defaultOptions.onSwitchChange;
        }
        this.options.onSwitchChange = value;
        return this.$element;
    };

    MoUISwitch.prototype.destroy = function () {
        var $form;
        $form = this.$element.closest("form");
        if ($form.length) {
            $form.off("reset.MoUISwitch").removeData("MoUI-switch");
        }
        this.$container.children().not(this.$element).remove();
        this.$element.unwrap().unwrap().off(".MoUISwitch").removeData("MoUI-switch");
        return this.$element;
    };

    MoUISwitch.prototype._width = function () {
        var $handles, handleWidth;
        $handles = this.$on.add(this.$off);
        $handles.add(this.$label).css("width", "");
        handleWidth = this.options.handleWidth === "auto" ? Math.max(this.$on.width(), this.$off.width()) : this.options.handleWidth;
        $handles.width(handleWidth);
        this.$label.width((function (_this) {
            return function (index, width) {
                if (_this.options.labelWidth !== "auto") {
                    return _this.options.labelWidth;
                }
                if (width < handleWidth) {
                    return handleWidth;
                } else {
                    return width;
                }
            };
        })(this));
        this._handleWidth = this.$on.outerWidth();
        this._labelWidth = this.$label.outerWidth();
        this.$container.width((this._handleWidth * 2) + this._labelWidth);
        return this.$wrapper.width(this._handleWidth + this._labelWidth);
    };

    MoUISwitch.prototype._initWidth = function () {
        var widthInterval;
        if (this.$wrapper.is(":visible")) {
            return this._width();
        }
        return widthInterval = window.setInterval((function (_this) {
            return function () {
                if (_this.$wrapper.is(":visible")) {
                    _this._width();
                    return window.clearInterval(widthInterval);
                }
            };
        })(this), 50);
    };

    MoUISwitch.prototype._containerPosition = function (state, callback) {
        if (state == null) {
            state = this.options.state;
        }
        this.$container.css("margin-left", (function (_this) {
            return function () {
                var values;
                values = [0, "-" + _this._handleWidth + "px"];
                if (_this.options.indeterminate) {
                    return "-" + (_this._handleWidth / 2) + "px";
                }
                if (state) {
                    if (_this.options.inverse) {
                        return values[1];
                    } else {
                        return values[0];
                    }
                } else {
                    if (_this.options.inverse) {
                        return values[0];
                    } else {
                        return values[1];
                    }
                }
            };
        })(this));
        if (!callback) {
            return;
        }
        if ($.support.transition) {
            return this.$container.one("bsTransitionEnd", callback).emulateTransitionEnd(500);
        } else {
            return callback();
        }
    };

    MoUISwitch.prototype._elementHandlers = function () {
        return this.$element.on({
            "change.MoUISwitch": (function (_this) {
                return function (e, skip) {
                    var state;
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    state = _this.$element.is(":checked");
                    _this._containerPosition(state);
                    if (state === _this.options.state) {
                        return;
                    }
                    _this.options.state = state;
                    _this.$wrapper.toggleClass("" + _this.options.baseClass + "-off").toggleClass("" + _this.options.baseClass + "-on");
                    if (!skip) {
                        if (_this.$element.is(":radio")) {
                            $("[name='" + (_this.$element.attr('name')) + "']").not(_this.$element).prop("checked", false).trigger("change.MoUISwitch", true);
                        }
                        return _this.$element.trigger("switchChange.MoUISwitch", [state]);
                    }
                };
            })(this),
            "focus.MoUISwitch": (function (_this) {
                return function (e) {
                    e.preventDefault();
                    return _this.$wrapper.addClass("" + _this.options.baseClass + "-focused");
                };
            })(this),
            "blur.MoUISwitch": (function (_this) {
                return function (e) {
                    e.preventDefault();
                    return _this.$wrapper.removeClass("" + _this.options.baseClass + "-focused");
                };
            })(this),
            "keydown.MoUISwitch": (function (_this) {
                return function (e) {
                    if (!e.which || _this.options.disabled || _this.options.readonly) {
                        return;
                    }
                    switch (e.which) {
                    case 37:
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        return _this.state(false);
                    case 39:
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        return _this.state(true);
                    }
                };
            })(this)
        });
    };

    MoUISwitch.prototype._handleHandlers = function () {
        this.$on.on("click.MoUISwitch", (function (_this) {
            return function (e) {
                _this.state(false);
                return _this.$element.trigger("focus.MoUISwitch");
            };
        })(this));
        return this.$off.on("click.MoUISwitch", (function (_this) {
            return function (e) {
                _this.state(true);
                return _this.$element.trigger("focus.MoUISwitch");
            };
        })(this));
    };

    MoUISwitch.prototype._labelHandlers = function () {
        return this.$label.on({
            "mousedown.MoUISwitch touchstart.MoUISwitch": (function (_this) {
                return function (e) {
                    if (_this._dragStart || _this.options.disabled || _this.options.readonly) {
                        return;
                    }
                    e.preventDefault();
                    _this._dragStart = (e.pageX || e.originalEvent.touches[0].pageX) - parseInt(_this.$container.css("margin-left"), 10);
                    if (_this.options.animate) {
                        _this.$wrapper.removeClass("" + _this.options.baseClass + "-animate");
                    }
                    return _this.$element.trigger("focus.MoUISwitch");
                };
            })(this),
            "mousemove.MoUISwitch touchmove.MoUISwitch": (function (_this) {
                return function (e) {
                    var difference;
                    if (_this._dragStart == null) {
                        return;
                    }
                    e.preventDefault();
                    difference = (e.pageX || e.originalEvent.touches[0].pageX) - _this._dragStart;
                    if (difference < -_this._handleWidth || difference > 0) {
                        return;
                    }
                    _this._dragEnd = difference;
                    return _this.$container.css("margin-left", "" + _this._dragEnd + "px");
                };
            })(this),
            "mouseup.MoUISwitch touchend.MoUISwitch": (function (_this) {
                return function (e) {
                    var state;
                    if (!_this._dragStart) {
                        return;
                    }
                    e.preventDefault();
                    if (_this.options.animate) {
                        _this.$wrapper.addClass("" + _this.options.baseClass + "-animate");
                    }
                    if (_this._dragEnd) {
                        state = _this._dragEnd > -(_this._handleWidth / 2);
                        _this._dragEnd = false;
                        _this.state(_this.options.inverse ? !state : state);
                    } else {
                        _this.state(!_this.options.state);
                    }
                    return _this._dragStart = false;
                };
            })(this),
            "mouseleave.MoUISwitch": (function (_this) {
                return function (e) {
                    return _this.$label.trigger("mouseup.MoUISwitch");
                };
            })(this)
        });
    };

    MoUISwitch.prototype._externalLabelHandler = function () {
        var $externalLabel;
        $externalLabel = this.$element.closest("label");
        return $externalLabel.on("click", (function (_this) {
            return function (event) {
                event.preventDefault();
                event.stopImmediatePropagation();
                if (event.target === $externalLabel[0]) {
                    return _this.toggleState();
                }
            };
        })(this));
    };

    MoUISwitch.prototype._formHandler = function () {
        var $form;
        $form = this.$element.closest("form");
        if ($form.data("MoUI-switch")) {
            return;
        }
        return $form.on("reset.MoUISwitch", function () {
            return window.setTimeout(function () {
                return $form.find("input").filter(function () {
                    return $(this).data("MoUI-switch");
                }).each(function () {
                    return $(this).MoUISwitch("state", this.checked);
                });
            }, 1);
        }).data("MoUI-switch", true);
    };

    MoUISwitch.prototype._getClasses = function (classes) {
        var c, cls, _i, _len;
        if (!$.isArray(classes)) {
            return ["" + this.options.baseClass + "-" + classes];
        }
        cls = [];
        for (_i = 0, _len = classes.length; _i < _len; _i++) {
            c = classes[_i];
            cls.push("" + this.options.baseClass + "-" + c);
        }
        return cls;
    };
    $.fn.MoUISwitch = function () {
        var args, option, ret;
        option = arguments[0], args = 2 <= arguments.length ? Array.prototype.slice.call(arguments, 1) : [];
        ret = this;
        this.each(function () {
            var $this, data;
            $this = $(this);
            data = $this.data("MoUI-switch");
            if (!data) {
                $this.data("MoUI-switch", data = new MoUISwitch(this, option));
            }
            if (typeof option === "string") {
                return ret = data[option].apply(data, args);
            }
        });
        return ret;
    };
})(window.jQuery, window);