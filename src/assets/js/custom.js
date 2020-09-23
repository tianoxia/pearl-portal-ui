(function($){
    if (!$('.dropdown-toggle > i').first().hasClass('fa-chevron-down')) {
        $('#header').find('.dropdown-toggle').append('<i class="fas fa-chevron-down"></i>');
        $('#header').find('.dropdown-toggle[href="#"], .dropdown-toggle[href!="#"] .fa-chevron-down').on('click', function(e) {
            e.preventDefault();
            if (window.innerWidth < 992) {
                $(this).closest('li').toggleClass('open');
            }
        });
    }
    $('#header ul.dropdown-menu li > a').on('click', function() {
        $('.header-btn-collapse-nav').click();
    });
    $('#header .dropdown-item.dropdown-toggle.bp_link').on('click', function() {
        $('.header-btn-collapse-nav').click();
    })
    $('#header .dropdown-item.dropdown-toggle.bp_link > .fa-chevron-down').click(function(e) {
        e.stopPropagation(); 
    });
    $('.header-nav-main nav').on('show.bs.collapse', function () {
        $(this).removeClass('closed');

        // Add Mobile Menu Opened Class
        $('html').addClass('mobile-menu-opened');
   });

   // Set Header Body Height when collapse mobile menu
   $('.header-nav-main nav').on('hide.bs.collapse', function () {
        $(this).addClass('closed');

        // Remove Mobile Menu Opened Class
        $('html').removeClass('mobile-menu-opened');
   });
}(jQuery));