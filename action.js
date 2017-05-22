$(document).ready(function() {
			$('a.next').click(function () {
			    $('html, body').stop().animate({
			        scrollTop: $( $(this).attr('href') ).offset().top
			    }, 500);
		        return false;
		    });
		    $('a.scrollTop').scrollTop();
		});

$(function() {
    $(window).scroll(function() {
        //Position du scroll + moitié de l'écran visible
        var scroll = $(this).scrollTop() + window.innerHeight * 0.8;
        $('.info').each(function() {
            if (scroll > $(this).offset().top) {
                $(this).removeClass('hid')
            } else {
                $(this).addClass('hid')
            }
        });

        $(".footer").toggle($(this).scrollTop() > 280);
    });

    $(".smooth-scroll").click(function(event) {
        //prevent the default action for the click event
        event.preventDefault();

        //get the full url - like mysitecom/index.htm#home
        var full_url = this.href;

        //split the url by # and get the anchor target name - home in mysitecom/index.htm#home
        var parts = full_url.split("#");
        var trgt = parts[1];

        //get the top offset of the target anchor
        var target_offset = $("#" + trgt).offset();
        var target_top = target_offset.top;

        //goto that anchor by setting the body scroll top to anchor top
        $('html, body').animate({ scrollTop: target_top }, 700);
    });
});