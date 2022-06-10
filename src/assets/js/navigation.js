var paperMenu = {
    $window: $('#js-paper-window'),
    $paperFront: $('#js-paper-front'),
    $hamburger: $('.js-menu-open'),
    offset: 1800,
    pageHeight: $('#js-paper-front').outerHeight(),
    
    open: function() {
        this.$window.addClass('tilt');
        this.$hamburger.off('click');
        $('main, .js-menu-open').on('click', this.close.bind(this));
        this.hamburgerFix(true);
        console.log('opening...');
    },
    close: function() {
        this.$window.removeClass('tilt'); 
        $('main, .js-menu-open').off('click');
        this.$hamburger.on('click', this.open.bind(this));
        this.hamburgerFix(false);
        console.log('closing...');
    },
    updateTransformOrigin: function() {
        scrollTop = this.$window.scrollTop();
        equation = (scrollTop + this.offset) / this.pageHeight * 100;
        this.$paperFront.css('transform-origin', 'center ' + equation + '%');
    },
    //hamburger icon fix to keep its position
    hamburgerFix: function(opening) {
            if(opening) {
                $('.js-menu-open').css({
                    position: 'sticky',
                    top: this.$window.scrollTop() + 30 + 'px'
                });
            } else {
                setTimeout(function() {
                    $('.js-menu-open').css({
                        position: 'sticky',
                        top: '30px'
                    });
                }, 300);
            }
        },
    bindEvents: function() {
        this.$hamburger.on('click', this.open.bind(this));
        $('.js-menu-close').on('click', this.close.bind(this));
        this.$window.on('scroll', this.updateTransformOrigin.bind(this));
    },
    init: function() {
        this.bindEvents();
        this.updateTransformOrigin();
    },
};

paperMenu.init();
