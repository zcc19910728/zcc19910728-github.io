var Yt = {
	    ajax: function(options) {
	    	var that = this,
		    	opts = $.extend({
				    		url:"",
				    		data:"",
				    		type:"GET",
				    		async : true,
				    		success:null,
							fail:null,
				    		error:null,
                            complete:null,
							isLayer:true
				    	},options);

	    	if(opts.isLayer){
				that.createOLayer();
			}

			if(typeof opts.data != "string"){
				opts.data = $.extend({t: new Date().getTime()}, opts.data);
			}else{
				opts.data += "&t="+new Date().getTime();
			}

	        var currAjax = $.ajax({
	            type: opts.type,
	            url: opts.url,
	            data: opts.data,
	            async : opts.async,
	            dataType: 'json',
	            complete: function(XMLHttpRequest,status){
                    opts.complete && opts.complete();
	                if(status=='timeout'){
	                    currAjax.abort();
	                    that.toast('请求超时',2000);
	                }

					if(opts.isLayer) {
						$("#ajaxLoadingLayer").remove();
					}
	            },
	            success: function(data, textStatus, jqXHR){
	            	if(data.code){
	            		if(data.code == 200){
		            		opts.success(data);
		            	}else{
							if(!opts.fail){
								that.toast(data.message,2000);
							}else{
								opts.fail(data);
							}

		            	}
	            	}else{
	            		if(data.success){
	            			opts.success(data);
		            	}else{
							if(!opts.fail){
								that.toast(data.message,2000);
							}else{
								opts.fail(data);
							}
		            	}
	            	}
	            	
	            	if(null != data.fieldError && ""!=data.fieldError){
	            		if(data.fieldError.length>0){
	            			that.toast(data.fieldError[0].defaultMessage,2000);
	            		}
					}

	            },
				error: function(xhr, textStatus, errorThrown){
					if(xhr.status == "404"){
						that.toast('<span class="cor-red">网络连接不通或访问地址不存在！</span>');
					}else{
						that.toast('<span class="cor-red">网络异常，请稍后再试!</span>');

					}
				}

	        });
	    },
	    
	    createOLayer: function(){
	    	if($("#ajaxLoadingLayer").length == 0){
	    		var layerHtml = '<div id="ajaxLoadingLayer">'+
									'<div class="o-layer" ></div>'+
						        	'<div class="wait-layer" ><img src="'+$("#basePath").val()+'/static/images/weixin/loading.gif" width="100%" /></div>'+
						        '</div>';
				$("body").append($(layerHtml));
	    	}
	    	
	    },
	    
	    get: function(url, data, success, error) {
	        this.ajax({
	        	url:url,
	    		data:data,
	    		type:"GET",
	    		success:success,
	    		error:error
	        });
	    },
	    
	    post: function(url, data, success, error, isLayer) {
	    	this.ajax({
	        	url:url,
	    		data:data,
	    		type:"POST",
	    		success:success,
	    		error:error,
                isLayer:isLayer
	        });
	    },
	   
	    toast: function (title,time, callback){
			time = time || 2000;
        	var that = this;
        	this.dialog({
        		content:title
        	});

        	setTimeout(function(){
        		that.dialogClose("ytDialog");
        		callback && callback();
        	}, time);
        },

        alert: function(title, callback, time){
            time = time || 5000;
            var that = this;
            this.dialog({
                content:title,
                ok: function(){
                    that.dialogClose("ytDialog");
                    callback && callback();
                }
            });

            setTimeout(function(){
                that.dialogClose("ytDialog");
                callback && callback();
            }, time);
        },

        confirm: function(title, okCallback){
            Yt.dialog({
                content: title,
                ok:function(){
                    okCallback && okCallback();
                },
                cancel: function(){
                    Yt.dialogClose("ytDialog");
                }
            });
        },

        render: function(tpl, data){
            if(typeof(doT)!="undefined"){
                var compile = doT.template(tpl);
                return compile(data);
            }

        },

        dialog: function(option){
        	var opts = $.extend({
        			id:"ytDialog",
        		    content:"",
        		    okValue: '确定',
        		    cancelValue: '取消',
        		    cancel: null,
        		    ok: null
        	}, option);
        	
        	var btnsStr = opts.cancel? " tow-btns" : "";
        	var dialogStr = '<div class="yt-dialog" id="'+opts.id+'">'+
				        	    '<div class="yt-dialog-layer" > </div>'+
				        	    '<div class="yt-dialog-wrap" >'+
				                  	'<div class="w-72 m-auto bg-w w-72 yt-dialog-inner">'+
				                  		'<div class="yt-dialog-content">'+
				                  			'<div class="fs">'+opts.content+'</div>'+
				                  		'</div>';
    					if(opts.cancel || opts.ok){
    						dialogStr += '<div class="yt-dialog-btns'+btnsStr+'">';
    						if(opts.cancel){
    							dialogStr +='<div class="dialog-btn br cancel"><div>'+opts.cancelValue+'</div></div>';
    						}

    						if(opts.ok){
    							dialogStr +='<div class="dialog-btn ok"><div>'+opts.okValue+'</div></div>';
    						}
							
    						dialogStr +='</div>';
    					}
				           
						 dialogStr += '</div>'+
				                  '</div>' +
				            '</div>';
			var dialogWrap = $(dialogStr);
        	$("body").append(dialogWrap);
        	dialogWrap.find(".ok").on("click", function(){
        		if(opts.ok && typeof opts.ok == "function"){
        			 opts.ok();
        		}
        	});
        	
        	dialogWrap.find(".cancel").on("click", function(){
        		if(opts.ok && typeof opts.cancel == "function"){
        			opts.cancel();
        		}
        	});
        	
        },
        
        dialogClose: function(id){
        	$("#"+id).remove();
        },
		//获取URL参数值
		GetQueryString: function(name){
			var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
			var r = window.location.search.substr(1).match(reg);
			if(r!=null)return  unescape(r[2]); return null;
		},
        
        autoTextarea: function (elem, extra, maxHeight) {
            extra = extra || 0;
            var isFirefox = !!document.getBoxObjectFor || 'mozInnerScreenX' in window,
            isOpera = !!window.opera && !!window.opera.toString().indexOf('Opera'),
                    addEvent = function (type, callback) {
                            elem.addEventListener ?
                                    elem.addEventListener(type, callback, false) :
                                    elem.attachEvent('on' + type, callback);
                    },
                    getStyle = elem.currentStyle ? function (name) {
                            var val = elem.currentStyle[name];
     
                            if (name === 'height' && val.search(/px/i) !== 1) {
                                    var rect = elem.getBoundingClientRect();
                                    return rect.bottom - rect.top -
                                            parseFloat(getStyle('paddingTop')) -
                                            parseFloat(getStyle('paddingBottom')) + 'px';        
                            };
     
                            return val;
                    } : function (name) {
                                    return getComputedStyle(elem, null)[name];
                    },
                    minHeight = parseFloat(getStyle('height'));
     
            elem.style.resize = 'none';
     
            var change = function () {
                    var scrollTop, height,
                            padding = 0,
                            style = elem.style;
     
                    if (elem._length === elem.value.length) return;
                    elem._length = elem.value.length;
     
                    if (!isFirefox && !isOpera) {
                            padding = parseInt(getStyle('paddingTop')) + parseInt(getStyle('paddingBottom'));
                    };
                    scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
     
                    elem.style.height = minHeight + 'px';
                    if (elem.scrollHeight > minHeight) {
                            if (maxHeight && elem.scrollHeight > maxHeight) {
                                    height = maxHeight - padding;
                                    style.overflowY = 'auto';
                            } else {
                                    height = elem.scrollHeight - padding;
                                    style.overflowY = 'hidden';
                            };
                            style.height = height + extra + 'px';
                            scrollTop += parseInt(style.height) - elem.currHeight;
                            document.body.scrollTop = scrollTop;
                            document.documentElement.scrollTop = scrollTop;
                            elem.currHeight = parseInt(style.height);
                    };
            };
     
            addEvent('propertychange', change);
            addEvent('input', change);
            addEvent('focus', change);
            change();
    },
    
    swipe: function(){
    	var count = 0; 
    	//判断用户是否第一次进行touchmove操作
    	var startX, startY;var endX, endY;var distanceX, distanceY;
    	$('body').bind('touchstart', function(event) {   
    		 count = 0; //每次开始点击时清零    
    		 startX = event.targetTouches[0].clientX;    
    		 startY = event.targetTouches[0].clientY;
    	 })
    	 .bind('touchmove', function(event) {    
    		 if (count === 0) { //如果是第一次滑动        
    			 endX = event.changedTouches[0].clientX;        
    			 endY = event.changedTouches[0].clientY;       
    			  distanceX = Math.abs(startX - endX);        
    			  distanceY = Math.abs(startY - endY);        
    			  if (distanceX > distanceY) { //如果X绝对距离大于Y绝对距离            
    			  		event.preventDefault();        
    			  }    
    		  }    
    		  count++; 
    	  })
    	  .bind('touchend', function(event) {    
    		  endX = event.changedTouches[0].clientX;    
    		  endY = event.changedTouches[0].clientY;    
    		  distanceX = Math.abs(startX - endX);    
    		  distanceY = Math.abs(startY - endY);    
    		  if (distanceX > distanceY) {       
    		   		//startX - endX > 0 ? swipeLeft() : swipeRight();    
    		   }
    	 });
    },

	getBrandCateList: function(options){
		var opts = $.extend({
			wrap: null,
			brandUrl: '',
			cateUrl: '',
			cateData:null,
			goodsUrl: '',
			brandDef : '', //默认选中品牌id
			cateDef : '', //默认分类id
			goodsDef : '', //默认规格id
			isHasGoodsSel: true,
            detafultTexts:["--请选择类目--", "--请选择品牌--", "--请选择商品--"],
			dataCallback:function() {}
		}, options||{});

		var that = this,
			wrap = opts.wrap,
			firstSel = wrap.find("select").eq(0),
			secondSel = wrap.find("select").eq(1),
			thirdSel = wrap.find("select").eq(2),
			optionStr = "";

		// 生成分类
		that.generateSelect({
			target: firstSel,
			url: opts.cateUrl,
			data: opts.cateData,
			defVal: opts.cateDef,
			defText:opts.detafultTexts[0],
			chageCallback: function(){
				secondSel.html('<option value="">'+opts.detafultTexts[1]+'</option>');
				thirdSel.html('<option value="">'+opts.detafultTexts[2]+'</option>');
				//that.resetPrice();

				if(!firstSel.val()){
					return false;
				}
				// 生成品牌
				that.generateSelect({
					target: secondSel,
					url: opts.brandUrl,
					data: {cateId: firstSel.val()},
					defVal: opts.brandDef,
					defText:opts.detafultTexts[1],
					chageCallback: function(){
						thirdSel.html('<option value="">'+opts.detafultTexts[2]+'</option>');
						//that.resetPrice();

						if(opts.isHasGoodsSel){
							if(!secondSel.val()){
								return false;
							}
							// 生成商品
							that.generateSelect({
								target: thirdSel,
								url: opts.goodsUrl,
								data: {cateId:firstSel.val(), brandId:secondSel.val()},
								field:"stock",
								defVal: opts.goodsDef,
								defText:opts.detafultTexts[2],
								chageCallback: function(me, data){
									opts.dataCallback.call(thirdSel, data);
									opts.brandDef = "";
									opts.goodsDef = "";
									opts.cateDef = "";
								}
							});
						}

					}
				});
			}
		});

	},

    generateSelect: function(options){
        var opts = $.extend({
                target:null,
                url: '',
                data: '',
                displayField:'name',
                field:"",
                defVal: '',
                defText: null,
                isHasChange: true,
                chageCallback:function() {},
                callback:function() {}
            }, options||{}),
            me = opts.target,
            listData = null,
            optionStr = '',
            dataField = '',
            that = this;

        if(!opts.target) return false;

        this.post(opts.url, opts.data, function(json){
            optionStr = '';
            listData = json.data;
            optionStr += '<option value="">'+opts.defText+'</option>';
            for(var i=0; i< listData.length; i++){
                if(opts.field){
                    dataField = 'data-'+opts.field+'='+listData[i][opts.field];
                }
                optionStr += '<option value="'+listData[i].id+'" '+dataField+'>'+listData[i][opts.displayField]+'</option>';
            }
            me.html(optionStr);

            // 绑定change
            me.off("change").on("change", function(){
                opts.chageCallback(me, listData);
            });


            // 选中默认值
            if(opts.defVal){

                //解决ie6 bug
                //setTimeout(function(){
                    me.val(opts.defVal);

                    if(opts.isHasChange){
                        me.trigger('change');
                    }
                //},1);
            }

            opts.callback(me, listData);

        });

    },

	formatDate: function(date, fmt){
		var o = {
			"M+" : date.getMonth()+1,                 //月份
			"d+" : date.getDate(),                    //日
			"h+" : date.getHours(),                   //小时
			"m+" : date.getMinutes(),                 //分
			"s+" : date.getSeconds(),                 //秒
			"q+" : Math.floor((date.getMonth()+3)/3), //季度
			"S"  : date.getMilliseconds()             //毫秒
		};

		if(/(y+)/.test(fmt)){
			fmt = fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
		}

		for(var k in o){
			if(new RegExp("("+ k +")").test(fmt)){
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
			}
		}

		return fmt;
	},

    _checkTime: function (i){
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    },

	formateTime: function(ts, wrap){
        var dd = parseInt(ts / 1000 / 60 / 60 / 24, 10); //计算剩余的天数
		var hh = parseInt(ts / 1000 / 60 / 60 % 24, 10); //计算剩余的小时数
		var mm = parseInt(ts / 1000 / 60 % 60, 10); //计算剩余的分钟数
		var ss = parseInt(ts / 1000 % 60, 10); //计算剩余的秒数
		dd = this._checkTime(dd);
		hh = this._checkTime(hh);
		mm = this._checkTime(mm);
		ss = this._checkTime(ss);
        var timeStr = dd + "天" + hh + "时" + mm + "分" + ss + "秒";
        if(wrap){
            wrap.html(timeStr);
        }else{
           return timeStr;
        }
	},

	timeCountDown: function(wrap, timestarps, callback){
		var that = this;
		if(timestarps <= 0){
			return false;
		}

		var intervalTimer = setInterval(function(){
			timestarps = timestarps - 1000;
			if(timestarps <= 0){
				clearInterval(intervalTimer);
				that.formateTime(0, wrap);
				callback && callback();
			}else{
				that.formateTime(timestarps, wrap);
			}
		}, 1000);
	},


	serializeObj: function(paramStrs){
        if(!paramStrs){
            return {};
        }
        var arr = paramStrs.split('&'),
            returnObj = {},
            name = '',
            value = '',
            temp = null;
        for(var i=0; i< arr.length; i++){
            temp = arr[i].split('=');
            name = temp[0];
            value = decodeURIComponent(temp[1]);
            returnObj[name] = value;
        }

        return returnObj;
    },

    banDeliveryAddress:['进口','超市','免税', '宝贝', '宝宝', '母婴', '孕婴', '生活馆','贝贝', '孕婴','妈咪', '商店', '商场','商城','门店','直营','连锁'],
    validateMethods: {
        required: function(value, element, param) {
            if(!value){
                Yt.toast(param);
                return false;
            }

            return true;
        },

        phone: function(value, element, param){
            if(!/^[0-9]{11}$/.test(value)){
                Yt.toast(param);
                return false;
            }
            return true;
        },

        name: function(value, element, param){
            var nameFilterArr = ["大","小","一","二","三","四","五","六","七","八","九","十"];
            if(!(/^[\u4e00-\u9fa5]{2,}$/.test(value) && $.inArray(value.substring(0,1),nameFilterArr) == -1)){
                Yt.toast(param);
                return false;
            }
            return true;
        },

        cardNo: function(value, element, param){
            if(!value || !/^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/.test(value)){
                Yt.toast(param);
                return false;
            }
            return true;
        },

        deliveryAddress: function(value, element, tips){
            tips = tips || '收货地址';
            var temp = '';

            for(var i=0; i<Yt.banDeliveryAddress.length; i++){
                temp = Yt.banDeliveryAddress[i];
                if(value.indexOf(temp) != -1){
                    Yt.toast('您的'+tips+'含有'+temp+'等门店名称字样，请修改', 3000);
                    return false;
                }
            }
            return true;
        }
    }

		
};


// 公用业务逻辑
$(function(){
    // 表单中input框的清除按钮
    var  wxFormUl = $('.wx-form-ul');
    if(wxFormUl.length > 0){
        wxFormUl.on('tap', '.clear-icon', function(){
            $(this).parent().find('.ipt').val('').focus();
        });
        wxFormUl.on('focus', '.ipt', function(){
            $(this).siblings('.clear-icon').show();
        });
        wxFormUl.on('blur', '.ipt', function(){
            $(this).siblings('.clear-icon').hide();
        });
    }

	// 搜索框交互
	var searchBar = $('#searchBar');
	if(searchBar.length > 0){
		var searchBar = $('#searchBar'),
			keywordLayer = $('#keywordLayer'),
			cancleBtn = searchBar.find('.back-icon'),
			searchBtn = searchBar.find('.search-btn'),
			searchIpt = searchBar.find('.J-search-ipt'),
			delKeyBtn = searchBar.find('.clear-icon');
		// 搜索框事件
		searchIpt.on("click",function(){
			if(!searchBar.data('isSearch')){
				searchBar.data('isSearch', true);
				searchBar.find('.search-inner').addClass('search-active');
				delKeyBtn.show();
				keywordLayer.show();
			}
		});

		// 取消搜索
		cancleBtn.click(function(){
			searchBar.data('isSearch', false);
			searchBar.find('.search-inner').removeClass('search-active');
			delKeyBtn.hide();
			keywordLayer.hide();
			searchIpt.val('');
		});

		searchBar.find('.search-icon').on('click', function(){
			searchBtn.trigger("click");
		});
		searchBar.find(".clear-icon").on("click",function(){
			searchIpt.val("");
		});
	}

});

// 验证表单
;(function($){

    $.extend($.fn, {
        validateForm: function(){
            var formElem = $(this),
                rules = null,
                flag = true;

            formElem.find('input[validate],textarea[validate]').each(function(index){
                var me = $(this),
                    value = me.val().replace(/\r/g, "");
                rules = eval('('+me.attr('validate')+')');
                if($.isPlainObject(rules)){
                    for(var rule in rules){
                        flag =  Yt.validateMethods[rule] && Yt.validateMethods[rule].call(this, value, me, rules[rule]);
                        if(!flag){
                            return false;
                        }
                    }
                }

            });

            return flag;
        }
    })
})(Zepto);
