/* ========================================================================
MoUI-slider
date:2015-1-10
author:morrain
 * ========================================================================
 */

(function ($) {
    "use strict";

    var defaultOpitons = {
        speed: 500, // 动画切换的速度
        interval: 3000, // 动画切换的时间间隔
        pause: true, // 鼠标移入进是否暂停
        loop: true, // 是否循环，最后一张再下一个会循环到第一张
        keys: false, // 是否支持键盘播放
        dots: true, // 是否显示点导航条
        arrows: false, // 是否显示箭头导航条
        prev: '&larr;', // 前一页箭头
        next: '&rarr;', // 后一页箭头
        fluid: true, // 宽度自适应
        easing: 'swing', //要使用的擦除效果的名称(需要插件支持).默认jQuery提供"linear" 和 "swing".
        autoplay: true, // 初始化完成后是否自动播放
        onBefore: function () {}, //切换前回调
        onAfter: function () {} //切换后回调
    };


    /**
     * [MoUISlider description]组件接口
     * 1. 直接调用，使用默认配置初始化组件 如 $('#aa').MoUISlider();
     * 2. 传入配置，使用传入的配置初始化 如 $('#aa').MoUISlider({fluid:false});
     * 3. 调用组件方法  如 $('#aa').MoUISlider('update',arg0,arg1);
     */
    $.fn.MoUISlider = function () {

        var option = arguments[0],
            args = 2 <= arguments.length ? Array.prototype.slice.call(arguments, 1) : [],
            ret = this;

        //支持初始化多个slider
        this.each(function () {
            var me = $(this),
                instance = me.data('MoUI-slider');

            //如果不存在就创建组件实例
            if (!instance)
                me.data('MoUI-slider', instance = new MoUISlider(me, option).init(me, option));

            if (typeof option === 'string') {
                //当为方法调用时 调用组件方法
                var result = instance[option].apply(instance, args);

                if (result !== undefined) {
                    // 如果有返回值 退出循环 返回组件的返回值
                    ret = result;
                    return false;
                }
            }
        });

        return ret;
    };

    MoUISlider.prototype.constructor = MoUISlider;

    function MoUISlider() {
        //  Object clone
        var _ = this;

        //  Set some options
        _.o = {
            speed: 500, // animation speed, false for no transition (integer or boolean)
            interval: 3000, // interval between slides, false for no autoplay (integer or boolean)
            pause: true, // pause on hover (boolean)
            loop: true, // infinitely looping (boolean)
            keys: false, // keyboard shortcuts (boolean)
            dots: false, // display dots pagination (boolean)
            arrows: false, // display prev/next arrows (boolean)
            prev: '&larr;', // text or html inside prev button (string)
            next: '&rarr;', // same as for prev option
            fluid: false, // is it a percentage width? (boolean)
            onBefore: false, // invoke before animation (function with argument)
            onAfter: false, // invoke after animation (function with argument)
            easing: 'swing', // easing function to use for animation
            autoplay: true // enable autoplay on initialisation
        };

        _.init = function (el, o) {
            //  Check whether we're passing any options in to MoUISlider
            _.o = $.extend(_.o, o);

            _.el = el;
            _.ul = el.find('>ul');
            _.max = [el.outerWidth() | 0, el.outerHeight() | 0];
            _.li = _.ul.find('>li').each(function (index) {
                var me = $(this),
                    width = me.outerWidth(),
                    height = me.outerHeight();

                //  Set the max values
                if (width > _.max[0]) _.max[0] = width;
                if (height > _.max[1]) _.max[1] = height;
            });


            //  Cached vars
            var o = _.o,
                ul = _.ul,
                li = _.li,
                len = li.length;

            //  Current indeed
            _.i = 0;

            //  Set the main element
            el.css({
                width: _.max[0],
                height: li.first().outerHeight(),
                overflow: 'hidden'
            });

            //  Set the relative widths
            ul.css({
                position: 'relative',
                left: 0,
                width: (len * 100) + '%'
            });
            if (o.fluid) {
                li.css({
                    'float': 'left',
                    width: (100 / len) + '%'
                });
            } else {
                li.css({
                    'float': 'left',
                    width: (_.max[0]) + 'px'
                });
            }

            //  Autoslide
            o.autoplay && setTimeout(function () {
                if (o.interval | 0) {
                    _.play();

                    if (o.pause) {
                        el.on('mouseover mouseout', function (e) {
                            _.stop();
                            e.type == 'mouseout' && _.play();
                        });
                    };
                };
            }, 0);

            //  Keypresses
            if (o.keys) {
                $(document).keydown(function (e) {
                    var key = e.which;

                    if (key == 37)
                        _.prev(); // Left
                    else if (key == 39)
                        _.next(); // Right
                    else if (key == 27)
                        _.stop(); // Esc
                });
            };

            //  Dot pagination
            o.dots && nav('dot');

            //  Arrows support
            o.arrows && nav('arrow');

            //  Patch for fluid-width sliders. Screw those guys.
            if (o.fluid) {
                $(window).resize(function () {
                    _.r && clearTimeout(_.r);

                    _.r = setTimeout(function () {
                        var styl = {
                                height: li.eq(_.i).outerHeight()
                            },
                            width = el.outerWidth();

                        ul.css(styl);
                        styl['width'] = Math.min(Math.round((width / el.parent().width()) * 100), 100) + '%';
                        el.css(styl);
                        li.css({
                            width: width + 'px'
                        });
                    }, 50);
                }).resize();
            };

            return _;
        };

        //  Move MoUISlider to a slide index
        _.to = function (index, callback) {
            if (_.t) {
                _.stop();
                _.play();
            }
            var o = _.o,
                el = _.el,
                ul = _.ul,
                li = _.li,
                current = _.i,
                target = li.eq(index);

            $.isFunction(o.onBefore) && !callback && o.onBefore(el, li.eq(current));

            //  To slide or not to slide
            if ((!target.length || index < 0) && o.loop == false) return;

            //  Check if it's out of bounds
            if (!target.length) index = 0;
            if (index < 0) index = li.length - 1;
            target = li.eq(index);

            var speed = callback ? 5 : o.speed | 0,
                easing = o.easing,
                obj = {
                    height: target.outerHeight()
                };

            if (!ul.queue('fx').length) {
                //  Handle those pesky dots
                el.find('.dot').eq(index).addClass('active').siblings().removeClass('active');

                el.animate(obj, speed, easing) && ul.animate($.extend({
                    left: '-' + index + '00%'
                }, obj), speed, easing, function (data) {
                    _.i = index;

                    $.isFunction(o.onAfter) && !callback && o.onAfter(el, target);
                });
            };
        };

        //  Autoplay functionality
        _.play = function () {
            _.t = setInterval(function () {
                _.to(_.i + 1);
            }, _.o.interval | 0);
        };

        //  Stop autoplay
        _.stop = function () {
            _.t = clearInterval(_.t);
            return _;
        };

        //  Move to previous/next slide
        _.next = function () {
            return _.stop().to(_.i + 1);
        };

        _.prev = function () {
            return _.stop().to(_.i - 1);
        };

        //  Create dots and arrows
        function nav(name, html) {
            if (name == 'dot') {
                html = '<ol class="dots">';
                $.each(_.li, function (index) {
                    html += '<li class="' + (index == _.i ? name + ' active' : name) + '">' + ++index + '</li>';
                });
                html += '</ol>';
            } else {
                html = '<div class="';
                html = html + name + 's">' + html + name + ' prev">' + _.o.prev + '</div>' + html + name + ' next">' + _.o.next + '</div></div>';
            };

            _.el.addClass('has-' + name + 's').append(html).find('.' + name).click(function () {
                var me = $(this);
                me.hasClass('dot') ? _.stop().to(me.index()) : me.hasClass('prev') ? _.prev() : _.next();
            });
        };
    };


})(jQuery);