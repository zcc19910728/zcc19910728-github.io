$(function(){
	//$('#header').load('/header.html');
	var BL = {
		initPage: function(){
			$('#header').html(this.getHeader());
		},

		getHeader: function(){
			var html = this.template(function(){     
				/*        
				<div class="clearfix bg-b cor-w header">
					<h1 class="f-l fs-14 fw-b ml-20 pt-5"><img src="../images/logo.png" /></h1>
					<ul class="f-r fs-14 pt-20 pb-20">
						<li class="f-l"><a class="cor-w mr-20">html</a></li>
						<li class="f-l"><a class="cor-w mr-20">css</a></li>
						<li class="f-l"><a class="cor-w  mr-20">javascript</a></li>
						<li class="f-l"><a class="cor-w mr-20">project</a></li>
					</ul>
				</div>    
				*/
			});
			return html;
		},

		template: function(tmpl){
			var regEx = new RegExp("/\\*([\\S\\s]*)\\*/", "mg");		
			tmpl = tmpl + "";		
			var matches = tmpl.match(regEx) || [];		
			var result = [];		
			for (var i = 0; i < matches.length; i++) {			
				result.push(matches[i].replace(regEx, "$1"));		
			}		
			return result.join("");
			}
	};

	BL.initPage();
	
});


$(function(){
	if(!$('#container').attr('data-iscroll')){
		return false;
	}
	var win = $(window),
		menu = $('#sideBar'),
		mainContainer = $('#mainContainer'),
		contentSection = mainContainer.find('div.component-block'),
		topCache = contentSection.map(function () { return $(this).offset().top; }),
		windowHeight = win.height() / 3,
		windowWidth = win.width(),
		innerWindow = $(document.getElementById('innerIframe').contentWindow.document),
		currentActive = -1,
		contentSectionItem = null;
	var updateContent = function(text){
		innerWindow.find('#innerWindow').html(text);
	};
	var calculateScroll = function(){
		var currentTop = win.scrollTop();
		if(currentTop > 60){
			menu.addClass('side-bar-fixed');
		}else{
			menu.removeClass('side-bar-fixed');
		}

		for (var l = contentSection.length; l--;) {
            if ((topCache[l] - currentTop) < windowHeight) {
                if (currentActive === l) {
                    return;
                }
                currentActive = l;
                mainContainer.find('div.component-block.active').removeClass('active');
                contentSectionItem = $(contentSection[l]);
                contentSectionItem.addClass('active');
                var id = contentSectionItem.attr('id');
                menu.find(".active").removeClass("active");
                if (id) {
                    //device.attr('id', id + 'InDevice');
                    menu.find("a[href='#"+id+"']").parent().addClass("active");
                } else {
                    //device.attr('id', '');

                    //找到之前最近一个有id的
                    var prev = contentSectionItem.prev();
                    while(prev[0] && !prev.attr("id")) prev = prev.prev();
                    if(prev[0]) {
                        menu.find("a[href='#"+prev.attr("id")+"']").parents("li").addClass("active");
                    }
                }
                
                updateContent(contentSectionItem.find('.language-html').text());
                break;
            }
        }
	};

	win.on('scroll', function(){
        calculateScroll(win);
    });
});
