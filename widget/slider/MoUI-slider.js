/* ========================================================================
MoUI-slider
date:2015-1-10
author:morrain
 * ========================================================================
 */

(function ($) {
    "use strict";
    var aa = 10;
    var defaultOpitons = {
        speed: 500, // 动画切换的速度 单位毫秒
        interval: 2, // 动画切换的时间间隔 单位秒
        pause: true, // 鼠标移入进是否暂停
        loop: true, // 是否循环，最后一张再下一个会循环到第一张
        keys: false, // 是否支持键盘播放
        dot: 'd01', // 点导航条样式。为空不显示
        arrow: 'a05', //箭头的样式。为空不显示箭头
        arrowspad: 0, // 箭头导航条距离两边的像素长度
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
                me.data('MoUI-slider', instance = new MoUISlider(me, option));

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
    /**
     * [MoUISlider description]组件构造函数
     * @param {[type]} ele    [description]对应的DOM元素
     * @param {[type]} option [description]相应的配置对象
     */
    function MoUISlider(ele, option) {
        var _ = this,
            ele = $(ele);

        _.ele = ele;
        _.o = $.extend(defaultOpitons, {
            speed: ele.data('speed'),
            interval: ele.data('interval'),
            pause: ele.data('pause'),
            loop: ele.data('loop'),
            keys: ele.data('keys'),
            dot: ele.data('dot'),
            arrow: ele.data('arrow'),
            arrowspad: ele.data('arrowspad'),
            prev: ele.data('prev'),
            next: ele.data('next'),
            fluid: ele.data('fluid'),
            easing: ele.data('easing'),
            autoplay: ele.data('autoplay')
        }, ele.data("option"), option);

        _.max = [ele.outerWidth(), ele.outerHeight()];
        _.ul = ele.find('>ul');
        _.li = _.ul.find('>li').each(function () {
            var me = $(this),
                width = me.outerWidth(),
                height = me.outerHeight();

            //  找到所有li中最大的宽高
            if (width > _.max[0]) _.max[0] = width;
            if (height > _.max[1]) _.max[1] = height;
        });

        _.i = 0; //当前slider的索引

        ele.css({
            'width': _.max[0],
            'height': _.li.first().outerHeight(),
            'overflow': 'hidden'
        });

        _.ul.css({
            'position': 'relative',
            'left': 0,
            'width': (_.li.length * 100) + '%'
        });

        if (_.li.length === 0) return;
        _.li.css({
            'float': 'left',
            'width': _.o.fluid ? ((100 / _.li.length) + '%') : (_.max[0] + 'px')
        });

        //设置轮播图片对应的链接
        _.li.find('>a').css({
            'display':'inline-block',
            'width':function() {
                return $(this).parent().width() + 'px';
            },
            'height':function() {
                return $(this).parent().height() + 'px';
            }
        });

        //是否为自动播放
        _.o.autoplay && setTimeout(function () {

            _.play();

            //鼠标移入时暂停播放，移出时继续播放
            if (_.o.pause) {
                ele.bind({
                    'mouseover': function () {
                        _.stop();
                        _.showArrow(true);
                    },
                    'mouseout': function () {
                        _.play();
                        _.showArrow(false);
                    }
                });
            };
        }, 0);

        //添加键盘响应
        _.o.keys && $(document).keydown(function (e) {

            if (e.which == 37)
                _.prev(); // 向左
            else if (e.which == 39)
                _.next(); // 向右
            else if (e.which == 27)
                _.stop(); // Esc

        });

        //添加点和箭头导航
        _.o.dot && _._nav('dot');
        _.o.arrow && _._nav('arrow');
        _.showArrow(false); //默认隐藏，当鼠标移入时显示

        //图片自适应调整
        _.o.fluid && $(window).resize(function () {
            _.r && clearTimeout(_.r);

            _.r = setTimeout(function () {
                var style = {
                        height: _.li.eq(_.i).outerHeight()
                    },
                    width = _.ele.outerWidth();

                _.ul.css(style);
                style['width'] = Math.min(Math.round((width / _.ele.parent().width()) * 100), 100) + '%';
                _.ele.css(style);
                _.li.css({
                    width: width + 'px'
                });
            }, 50);
        }).resize();


        return _;
    }


    MoUISlider.prototype.to = function (index) {

        var _ = this;

        var o = _.o,
            el = _.ele,
            ul = _.ul,
            li = _.li;


        $.isFunction(o.onBefore) && o.onBefore.call(_, el, li.eq(_.i));

        //第一张
        if (index < 0 && !o.loop) return;
        else if (index < 0) index = li.length - 1;

        //最后一张
        if (index >= li.length && !o.loop) return;
        else if (index >= li.length) index = 0;

        if (!ul.queue('fx').length) {

            var height = li.eq(index).outerHeight();

            el.animate({
                'height': height
            }, o.speed, o.easing);

            ul.animate({
                'left': '-' + index + '00%',
                'height': height
            }, o.speed, o.easing, function () {
                //切换完成后  修改样式  更新索引
                el.find('.dot').removeClass('active').eq(index).addClass('active');
                _.i = index;
                $.isFunction(o.onAfter) && o.onAfter.call(_, el, li.eq(_.i));
            });
        };
    };

    MoUISlider.prototype.play = function () {
        var _ = this;

        if (_.o.interval) {
            clearInterval(_.t);
            _.t = setInterval(function () {
                _.to(_.i + 1);
            }, _.o.interval * 1000);
        }

        return _;

    };
    MoUISlider.prototype.stop = function () {
        clearInterval(this.t);
        return this;
    };

    MoUISlider.prototype.next = function () {
        this.to(this.i + 1);
    };

    MoUISlider.prototype.prev = function () {
        this.to(this.i - 1);
    };

    MoUISlider.prototype._nav = function (name) {
        var _ = this,
            html;


        if (name == 'dot') {
            html = '<ol class="dots">';
            $.each(_.li, function (index) {
                html += '<li class="' + (index === _.i ? name + ' active' : name) + '"></li>';
            });
            html += '</ol>';
        } else {
            var top = _.ele.outerHeight() / 2 - 25;
            html = '<div class="arrow prev" style="left:' + _.o.arrowspad + 'px;top:' + top + 'px">' + '' + '</div>';
            html += '<div class="arrow next" style="right:' + _.o.arrowspad + 'px;top:' + top + 'px">' + '' + '</div>';
        };

        _.ele.addClass('has-' + name + 's').append(html).find('.' + name)
            .click(function () {
                var me = $(this);
                me.hasClass('dot') ? _.to(me.index()) : me.hasClass('prev') ? _.prev() : _.next();
            }).mousedown(function (event) {
                var me = $(this);
                if (me.hasClass('prev'))
                    me.removeClass('prev').addClass('prevdown');
                if (me.hasClass('next'))
                    me.removeClass('next').addClass('nextdown');
            }).mouseup(function (event) {
                var me = $(this);
                if (me.hasClass('prevdown'))
                    me.removeClass('prevdown').addClass('prev');
                if (me.hasClass('nextdown'))
                    me.removeClass('nextdown').addClass('next');
            }).css({
                'background-image': function () {
                    return 'url(img/' + _.o[name] + '.png)';
                }
            });
    };

    MoUISlider.prototype.showArrow = function (b_show) {
        b_show ? this.ele.find('.arrow').show() : this.ele.find('.arrow').hide();
    };

})(jQuery);