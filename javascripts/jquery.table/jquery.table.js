/**
 * This jQuery plugin auto  generate table.
 * 
 * This plugin needs at least jQuery 1.8.0
 *
 * @author lumeiqin
 * @version 1.0
 * @param {Object} opts Several options (see README for documentation)
 * @return {Object} jQuery Object
 */
 (function($){
	$.Jtable = function(containers, opts){
		this.containers = containers;
		this.opts = opts;
	};

	$.extend($.Jtable.prototype, {
		generateHeader:function(){
			var opts = this.opts,
                columns = opts.columns,
				headerHtml = '',
				thText = '',
				colsText = '',
                colsField = '';
			if(!columns) return;
			headerHtml += '<thead><tr>';
			for(var i=0; i<columns.length; i++){
				thText = columns[i].isCheckbox?'<input type="checkbox" id="selectAll" />' : columns[i].title;
				colsText = columns[i].hcols? 'colspan="'+columns[i].hcols+'"' : '';
                colsField = columns[i].field;
				headerHtml += '<th width="'+columns[i].width+'" '+colsText+' class="'+(columns[i].hcls || "")+'" data-field="'+colsField+'" >'+thText+'</th>';
				if(columns[i].hcols){
					i += columns[i].hcols-1;
				}

                columns[i].idDeep = colsField && colsField.indexOf('.') != -1?true: false;
			}
			headerHtml += '</tr></thead>';

            if(!opts.isFixedHeader){
                this.containers.html(headerHtml);
            }else{
                this.containers.html('');
                var jtableWrap = this.containers.closest('.jtable-wrap'),
                    jtableInner = jtableWrap.find('.jtable-inner'),
                    jtableInner = jtableInner.length && jtableInner || $('<div class="jtable-inner"></div>'),
                    jtableBody = $('<div class="jqtable-body" style="height:'+opts.tableHeight+'px"></div>');

                jtableInner.html('<table class="jq-table w-100">'+headerHtml+'</table');
                this.containers.addClass('no-border');
                jtableWrap.prepend(jtableInner);
                this.containers.wrap(jtableBody);
            }

		},

        calculateFixedHeader: function(){
            var containers = this.containers,
                jtableWrap = containers.closest('.jtable-wrap'),
                jtableInner = jtableWrap.find('.jtable-inner'),
                jtableTableTr = jtableInner.find('table').find('tr:eq(0)');

            jtableInner.find('table').width(containers.width());
            containers.find('tr:eq(0)').find('td').each(function(index){
                jtableTableTr.find('th').eq(index).width($(this).width());
            });
        },

		generateTbody:function(){
			var that = this,
				source = this.opts.source,
				list = source.data,
				columns = this.opts.columns,
				tbodyHtml = "";

			tbodyHtml += '<tbody>';
			if(list && list.length){
				for(var i=0; i< list.length; i++){
					tbodyHtml += this.generateTr(list[i], i);
				}
			}else{
				tbodyHtml += '<tr><td colspan="'+columns.length+'" align="center">暂无数据</td></tr>';
			}

			tbodyHtml += '</tbody>';
			this.containers.append(tbodyHtml);
			if(list && list.length){
				this.handerRender();
			}

            if(this.opts.isFixedHeader) {
                this.calculateFixedHeader();
            }

			// 生成分页

			if(this.opts.pageContainer && source){
				if(source.totalCount>0){
					this.opts.curpage = (this.opts.curpage || 1)-1;
					this.opts.pageContainer.pagination(source.totalCount, {
						items_per_page:this.opts.itemsPerPage,
						num_display_entries:8,
						current_page:that.opts.curpage,
						num_edge_entries:1,
						prev_text:"上一页",
						next_text:"下一页",
						jump_page:true,
						callback: function(pageIndex){
							that.opts.curpage = pageIndex;
							that.opts.pageCallback && typeof that.opts.pageCallback == "function" && that.opts.pageCallback(pageIndex);
						}
					});
					this.opts.pageContainer.show();
				}else{
					this.opts.pageContainer.hide();
				}
			}
			// 成功回调
			this.opts.successCallback && typeof this.opts.successCallback == "function" && this.opts.successCallback.call(that.containers);
		},

		generateTr: function(rowData, i){
			if(!rowData) return;
			var trBgClass = i%2 ? "even" : "odd";
			var columns = this.opts.columns,
				trHtml = '<tr class="'+trBgClass+'">',
				tdText = '';
				field = '',
                fieldVal = '';
			for(var i=0; i< columns.length; i++){
                field = columns[i].field;
                fieldVal = !columns[i].idDeep? rowData[field] : this.handlerDeepField(field, rowData);
				tdText = columns[i].isCheckbox?'<input type="checkbox" class="jt-checkbox" value="'+fieldVal+'" />' : (fieldVal || (fieldVal === 0?0:""));
				trHtml += '<td width="'+(columns[i].width || "")+'" class="'+(columns[i].cls || "")+'">'+tdText+'</td>';
			}
			trHtml += '</tr>';

			return trHtml;
		},

        handlerDeepField: function(field, rowData){
            if(!field){
                return '';
            }

            var fields =  field.split('.'),
                firstField = fields[0],
                secondField = fields[1];

            return rowData[firstField]?rowData[firstField][secondField] : '';
        },

		handerRender:function(){
			var columns = this.opts.columns,
				source = this.opts.source,
				renderTd = null;
			this.containers.find("tbody>tr").each(function(index){
				for(var i=0; i< columns.length; i++){
					if(columns[i].render && typeof columns[i].render == "function"){
						renderTd = $(this).children("td:eq("+i+")");
						columns[i].render.call(renderTd, source.data[index]);
					}
				}
			});
		},

		bindEvent:function(){
			var that = this,
				containers = this.containers,
				selectAll = null;

			containers.on("click", ".jt-checkbox", function(){
				selectAll = containers.find("#selectAll");
				if(containers.find(".jt-checkbox").length == containers.find(".jt-checkbox:checked").length){
					selectAll.prop("checked", true);
				}else{
					selectAll.prop("checked", false);
				}

			});

			// 全选
			containers.on("click", "#selectAll", function(){
				containers.find(".jt-checkbox").prop("checked", $(this).prop("checked"));
			});

			if(this.opts.isFixedHeader) {
				$(window).resize(function () {
					that.calculateFixedHeader();
				});
			}
		}
	});


	// Extend jQuery
	$.fn.jtable = function(options){

		// Initialize options with default values
		//{
		//			width:0,
		//			field:"",
		//			title:"",
		//			cls:"",
		//			isCheckbox:false,
        //          isDeep: false,
		//			render:null //function
		//		}
		var opts = jQuery.extend({
			columns:null,
			source:null,
			pageContainer:null,
			pageCallback:null,
			curpage:1,
			itemsPerPage:10,
			successCallback:null,
			isFixedHeader: false,
			tableHeight:300
		}, options);

		var containers = this,
			tableRender = new $.Jtable(containers, opts);

		if(opts.isFixedHeader){
			containers.addClass('fixedHeader');
			tableRender.jqtableWrap = containers.closest('.jtable-wrap');
			if(tableRender.jqtableWrap.length == 0){
				tableRender.jqtableWrap = $('<div class="jtable-wrap"></div>');
				containers.wrap(tableRender.jqtableWrap);
			}
		}

		tableRender.generateHeader();
		tableRender.generateTbody();
		tableRender.bindEvent();
	};

})(jQuery);
