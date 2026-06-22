// JavaScript Document

$(document).ready(function(){	
	
	$(".menu").click(function(){ 
	
		$("nav").slideToggle();
		
	});

    $(window).on('load resize',function(){
		var a_w = document.body.clientWidth;
		if(a_w >= 768) $("nav").show(); else $("nav").hide();
	});
//如果寬度大於768,nav會出現否則nav會隱藏

//group
	$(".fancybox").fancybox({
		openEffect	: 'fade', //'elastic', 'fade' or 'none'
		closeEffect	: 'elastic'
	});

//single
	$("#s2").fancybox({
    	openEffect	: 'elastic',//彈出
    	closeEffect	: 'elastic',

    	helpers : {
    		title : {
    			type : 'inside' // 'float', 'inside', 'outside' or 'over'
    		}
    	}
    });

});
