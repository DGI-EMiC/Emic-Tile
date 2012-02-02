/**
* TextSelection 
* @author Grant Dickie
* 
*  Provides functionality to highlight areas of text
* in the Transcript window
*/

(function($,rangy){
	rootNS = this;
	/**
	* TextSelector Object
	* Main object that handles selection objects
	*
	* @constructor
	*/
	TextSelector = function(){
		var self = this;
		this._color = "#FDFF00";
		this._selections = [];
	};
	TextSelector.constructor = TextSelector;
	TextSelector.prototype = {};
	$.extend(TextSelector.prototype, {
		
		
		_showSelectionObject: function(){
			var self = this;
			return this._selections;
		},	
		
		_checkForID: function(objID){
			for (var i=0;i<this._selections.length;i++){
				if (this._selections[i].id==objID){
					return false;
				}
			}
			return true;
		},			
		
		getSelectedText:function(){
				var self = this;
	
				//var range = rangy.createRange();
				var sel = rangy.getSelection();
				if(!sel.anchorNode) return null;
				var startChildren = self._getChildNumber(sel.anchorNode);
				var endChildren = self._getChildNumber(sel.focusNode);
				
				var startParent = $(sel.anchorNode.parentNode).getPath();
				var endParent = $(sel.focusNode.parentNode).getPath();
				
				var uniqueID = self._getUniqueId({length:8, prefix:"anno_"});
				
					
				selObj = {
					'id': uniqueID,
					'StartParent' : $(sel.anchorNode.parentNode).getPath(),
					'StartOffset' : sel.anchorOffset,
					'StartChild' : startChildren,
					'EndParent' : $(sel.focusNode.parentNode).getPath(),
					'EndOffset' : sel.focusOffset,
					'EndChild' : endChildren,
					'color': this._color
				};
	
				// Returns selection object 
				// of the following type:
				// { 
				//  "id": unique  
				//	"StartParent": "Id of anchor parent",
				//   "StartOffset": "anchor offset"
				//   "StartChild": "child in anchorNode",
				// 
				//	 "EndParent": "Id of focus parent",
				//   "EndOffset": "focus offset",
				//   "EndChild": "child in focus Node" 
				// }

				return selObj;
			 	
		},
		_getUniqueId:  function(o) {
				// http://www.sitepoint.com/forums/showthread.php?t=318819
				// changed a bit to receive prefix and length
				o.prefix = (typeof o.prefix == 'undefined') ? "anote_" : o.prefix;
				o.length = (typeof o.length == 'undefined') ? 8 : o.length;
				
				function getRandomNumber(range)	{
					return Math.floor(Math.random() * range);
				}
				
				function getRandomChar() {
					var chars = "0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ";
					return chars.substr(getRandomNumber(62), 1);
				}
				
				function randomID(length)	{
					var str = "";
					for(var i = 0; i < length; i++) {
						str += getRandomChar();
					}
					return str;
				}
				
				return o.prefix + randomID(o.length); /// returns length of 8

		},
		
		_getIndexOfId: function(selId){
	
			for (var i=0;i<this._selections.length;i++){
				if (this._selections[i].id == selId){
					return i;
				}
			}
			return null;
		},
		
		_getPathToNode: function(node){
			path = "";
			
			if (node.id){
				return "#"+node.id;
			}
			else{
				var childNo=this._getChildNumber(node,node.nodeName);
				
				path=">*:eq("+childNo+")";
				while(node.parentNode){
					node = node.parentNode;
					if (node.id){
						return "#"+node.id+path;
					}
					else{
						var childNo=this._getChildNumber(node,node.nodeName);
						
						if (childNo) {
							path = ">*:eq(" + childNo + ")" + path;
						}
						else{
							return node.nodeName+path;
						}
					}
				}
				return node.nodeName+":"+path;
			}
			
		},

		_getChildNumber: function(obj){
			if (obj.parentNode) {
				var children = obj.parentNode.childNodes;
				var num;
				for (var i = 0; i < children.length; i++) {
					if (children[i].isSameNode(obj)) {
						
						return i;
					}
				}
			}
			
			return null;
		},
		
		_rgb2hex: function(rgb) {
			
			// from http://stackoverflow.com/questions/638948/background-color-hex-to-javascript-variable-jquery
			rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
				function hex(x) {
					return ("0" + parseInt(x,10).toString(16)).slice(-2);
				}
			return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
		},
		
		_addColorSelector: function(selId) {
			// add the color selector to each highlight
			// add onclick behavior to show
			var self = this;
			var selectorHTML = '<div id="colorSelector1" style="display:inline-block;"><div style="display: inline-block; background-color: rgb(210, 212, 0);"></div></div>';
			// can't use .last() or .first()
			if($('span.'+selId).length>1){
				// attach to first
				$('span.'+selId+"eq:("+($('span.'+selId).length-1)+")").append(selectorHTML);
			} else {
				$('span.'+selId).append(selectorHTML);
			}
		
			
			var currColor = $('span.'+selId).css('background-color');
			currColor = this._rgb2hex(currColor);
			
			$('span.'+selId).ColorPicker({			
					color: currColor,
					onShow: function (colpkr) {
						$(colpkr).fadeIn(500);
						return false;
					},
					onHide: function (colpkr) {
						$(colpkr).fadeOut(500);
						return false;
					},
					onChange: function (hsb, hex, rgb) {
						$('span.'+selId).css('background-color', '#'+hex);
						self.changeSelectionColor(selId, hex);
						
						
					}
				});
			
		},
		changeSelectionColor:function(selId,hexcolor){
			// get selection object from this._selections
			// by selId.  
			var self = this;
			self._selections[self._getIndexOfId(selId)].color = '#'+hexcolor;		
				
			
		},
		
		changePenColor:function(color){
			// From now on, highlight in Color
			this._color = color;
			return true;
		},
	
		addSelection: function(JSONobj){
			// adds a selection object to this._selections
			// and adds highlight span (each with a class
  			// name unique to this selection).  CSS should 
			// turn the background-color of this class to 
			// this._color  
			var self = this;
			
			if (this._checkForID(JSONobj.id)) {	
				this._selections[this._selections.length] = JSONobj;  // add the selObj to the _selections holder
				this.addHighlightMarkers(JSONobj);
				// NOT ADDING COLOR SELECTOR - Can be accomplished through FloatingDiv
				// TOOD: make this an optional component
				// this._addColorSelector(JSONobj.id); /// add color selector 
			}

			return true;
		},
		removeSelection: function(selId){
			// removes selection object from array
			// and drops all highlight spans  
			
			
		},
		exportSelections: function(){
			// returns JSON object of this._selections
			var self = this;
			
			var encoded = $.toJSON(this._selections);  
			return encoded;
			
			
		},
		importSelections: function(selObj){
			/* assigns a JSON object of selections (like that 
			   returned by exportSelections) to this._selections
			   Then add colors to each */
			   
			var self, win;
							
			self = this;
			win = window;
			
			selObj.reverse();
			// if(__v) console.log("import selections receives highlights: "+selObj+" [0]: "+selObj[0]);
			for (var i in selObj) {
				this.addHighlightMarkers(selObj[i]);
				// this._addColorSelector(selObj[i].id); /// add color selector 
				//console.log(JSONobj[i]);
			}			
		   
		},
		clearSelections: function(){
			/*  empties this._selections
			 *  and removes all highlight markers
			 */
			this._selections = [];
			this.removeHighlightMarkers();
			return true;
		},
		removeHighlightMarkers: function(){
			/*  
			 *  removes all highlight markers
			 *  but keeps this._selections unchanged
			 *  
			 */		
	 
			/* remove highlights  */
			$('span[class^="anno_"]').each(function() {
				var parentNode = $(this).parent();
			
				$(this).before($(this).html()).remove();
				
				parentNode[0].normalize(); // we have to normalize because the <span> highlights separate the text node!
			});
			 return true;
			 
			 
		},
		addHighlightMarkers: function(JSONobj){
			/*
			 * adds highlight markers for new selections
			 */
			
			if(!JSONobj){
				if(TILE.experimental){
					TILE.engine.displayError("Error reading selection object.");
				}
				
				return;
			} 
			var self, win, addTo, start, end, range, startSide, endSide, ancestor, flag, done, node, tmp;
							
			self = this;
			win = window;
			
			const record = {offsetY:Number.NaN, firstNode:null, lastNode:null};  // record object
			
			// create span wrapper
			const wrap = window.document.createElement("SPAN");
			wrap.style.backgroundColor = JSONobj.color;	
			wrap.className = JSONobj.id;	
			wrap.title = 'highlighter';	
						
			const _createWrapper = function(n) {   // wrapper
				var e = wrap.cloneNode(false);
			
				if(!record.firstNode) { record.firstNode = e; }
				if(record.lastNode) { record.lastNode.nextHighlight = e; }
				record.lastNode = e;
				
				var offset = $(n.parentNode).offset();
				var posTop = offset.top;
				var pageTop = parseInt(win.pageYOffset,10);
				if(!posTop || posTop < pageTop) {
					record.offsetY = pageTop;
				} else {
					if(!(posTop > record.offsetY))record.offsetY = posTop;
				}
				
				return e;
			};				
			
		
			// get jQuery object using CSS path
			start = $(JSONobj.StartParent);
			end = $(JSONobj.EndParent);		
			
			//console.log(start);
			//console.log(end);
					
			/* set range for obj */
			var sNode = start[0].childNodes.item(JSONobj.StartChild);
			var eNode = end[0].childNodes.item(JSONobj.EndChild);
			
			range = document.createRange(); // create new range from selObj
			range.setStart(sNode, JSONobj.StartOffset);
			range.setEnd(eNode, JSONobj.EndOffset);
			
			
			startSide = range.startContainer;
			endSide = range.endContainer;				
			ancestor = range.commonAncestorContainer;
			flag = true;				

			
			if(range.endOffset == 0) {  //text | element
				while(!endSide.previousSibling && endSide.parentNode != ancestor) {
					endSide = endSide.parentNode;
				}
				endSide = endSide.previousSibling;
			} else if(endSide.nodeType == Node.TEXT_NODE) {
				if(range.endOffset < endSide.nodeValue.length) {
					endSide.splitText(range.endOffset);
				}
			} else if(range.endOffset > 0) { // element
				endSide = endSide.childNodes.item(range.endOffset - 1);
			}				
			
			
			if(startSide.nodeType == Node.TEXT_NODE) {
				if(range.startOffset == startSide.nodeValue.length) {
					flag = false;
				} else if(range.startOffset > 0) {
					startSide = startSide.splitText(range.startOffset);
					if(endSide == startSide.previousSibling) { endSide = startSide; }
				}
			} else if(range.startOffset < startSide.childNodes.length) {
				startSide = startSide.childNodes.item(range.startOffset);
			} else {
				flag = false;
			}				
			
			
			range.setStart(range.startContainer, 0);
			range.setEnd(range.startContainer, 0);
			
			done = false;
			node = startSide;
			
			do {
				if(flag && node.nodeType == Node.TEXT_NODE && !((tmp = node.parentNode) instanceof HTMLTableElement || tmp instanceof HTMLTableRowElement || tmp instanceof HTMLTableColElement ||	tmp instanceof HTMLTableSectionElement)) {
					var myWrap = node.previousSibling;
					if(!myWrap || myWrap != record.lastNode) {
						myWrap = _createWrapper(node);
						node.parentNode.insertBefore(myWrap, node);
					}
					
					myWrap.appendChild(node);
					node = myWrap.lastChild;
					flag = false;
				}
			
				if(node == endSide && (!endSide.hasChildNodes() || !flag)) {
					done = true;
				}
			
				if(node instanceof HTMLScriptElement || node instanceof HTMLStyleElement ||	node instanceof HTMLSelectElement) {  //never parse their children
					flag = false;
				}
			
			
				if(flag && node.hasChildNodes()) {
					node = node.firstChild;  //dump("-> firstchild ");
				
				} else if(node.nextSibling != null) {
					node = node.nextSibling;  //dump("-> nextSibling ");
					flag = true;
				
				} else if(node.nextSibling == null) {
					node = node.parentNode;  //dump("-> parent ");
					flag = false;
				}
				//if(node == ancestor.parentNode)dump("\nHALT shouldn't face ancestor");
			} while(!done);	
			
			range.detach(); // detach range			 
			 
		}
	});
	rootNS.TextSelector = TextSelector;
})(jQuery,rangy);


/**
* Wrapper for the TILE.engine to load in plugin
*
* start() is the constructor
*/
var TS={
	id:"TS1000",
	name:'TextSelection',
	/**
	* start()
	* @constructor
	* @params mode {Object} - Mode object passed when TILE.engine calls start()
	*/
	start:function(mode){
		var self=this;
		self.textsel=new TextSelector();
		// append button HTML to the interface
		TILE.engine.insertModeButtons('<div class="menuitem"><ul><li><a id="getHLite" class="btnIconLarge getHLite" title="Activate Highlight Mode">Activate Highlight Mode</a></li></ul></div>','topleft',mode.name);
		
		// if no other active buttons, then this one is active
		if(!$("#tile_toolbar > .menuitem > ul > li > a").hasClass('active')){
			$("#getHLite").addClass('active');
		}
		
		self.manifest=[];
		self.activeSel="";
		self.curLink=null;
		var json=TILE.engine.getJSON();
		if(json){
			for(j in json){
				
				if(!(/jpg$|JPG$|PNG$|png$|gif$|GIF$/.test(j))) continue;
				if(!self.manifest[j]) self.manifest[j]=[];
				if(json[j].selections) self.manifest[j]=json[j].selections;
			}
		}
		
	
		// select a highlight and make the highlight
		// object active
		var selectHighlight=function(id){
			var self=this;
			var url=TILE.url;
			var h=null;
			for(var i in self.manifest[url]){
				if(self.manifest[url][i].id==id){
					h=self.manifest[url][i];
					break;
				}
			}
			if(!h) return;
			var handle="span."+h.id+":eq("+($("span."+h.id).length-1)+")";
			var disp=$("span."+h.id+":eq(0)").text().substring(0,10);
			return [disp,handle];
			// TILE.engine.updateData({id:h.id,type:'selections',display:disp,attachHandle:handle,obj:{id:id,type:'selections',jsonName:url}});
		};
		
		var lineClickHandle=function(e){
			
			self.clearHighlights();
			var sel=self.createHighlight();
			if(!sel.jsonName) sel.jsonName=TILE.url;
			TILE.engine.insertData(sel);
			var handle="span."+sel.id+":eq("+($("span."+sel.id).length-1)+")";
		
			TILE.engine.attachMetadataDialog(sel,handle);
		};
		
		// getText button
		var getHLite=function(e){
			e.preventDefault();
			$(".ui-dialog").hide();
			$(".shpButtonHolder").remove();
			// TILE.engine.setActiveObj(null);
			$(".line_selected").removeClass("line_selected");
			$(".menuitem > ul > li > .btnIconLarge").removeClass('active');
			$(this).addClass("active");
			// make active and stop all listeners of other objects
			$("#logbar_list > .line").unbind();
			$(".line").bind('mouseup',{obj:self},lineClickHandle);
		};
		
		// attach button listener
		$("#getHLite").live('click',getHLite);
		
		// listener for when PluginController sends data 
		// to change in current selection
		// $("body").live("ObjectChange",{obj:self},self._objChangeHandle);
		// listener for clicking on a highlight
		$("span[class^='anno']").live('mouseup',function(e){
			e.stopPropagation();
			// is user just turning this one off?
			if($(this).hasClass('selected')){
				return;
			}

			$("span[class^='anno']").removeClass("selected");
			var id=$(this).attr('class');
			$(this).addClass("selected");
			
			// select the highlight
			var o=self.selectHighlight(id);
			var h=o[0];
			if(!h.jsonName){
				h={
					id:o[0].id,
					type:'selections',
					jsonName:TILE.url,
					obj:o[0]
				};
			}
			
			// use data to attach metadata box
			if(o) TILE.engine.attachMetadataDialog(h,o[1]);
			
		});
		$("span[class^='anno']").live('mouseover',function(e){
			$('.line').unbind('mouseup');

		});	
		$("span[class^='anno']").live('mouseout',function(e){
			$('.line').bind('mouseup',{obj:self},lineClickHandle);

		});
		var loadItemsHandle=function(e,o){
			var self=e.data.obj;
			$("span[class^='anno']").each(function(e){
				$(this).children(".button").remove();
				$(this).children("div").remove();
			});
			self.textsel.removeHighlightMarkers();

			$(".line").unbind("mouseup");
			$(".line").mouseup(function(e){
				createHighlight();

			});
			if(!data||(data.length==0)) return;

			var url=TILE.url;
			var vd=[];
			for(x in self.manifest[url]){
				if($.inArray(self.manifest[url][x].id,data)>=0){
					vd.push(self.manifest[url][x]);
				}
			}
			if(vd.length==0) return;
			if(!$("#getHLite").hasClass("active")){
				$(".menuitem > ul > li > .btnIconLarge").removeClass('active');
				$("#getHLite").addClass('active');
				$("body:first").trigger(self.activeCall,[self.id]);
			}
			self.textsel.importSelections(vd);
			// attach buttons
			for(var v in vd){
				self.attachButtons(vd[v]);
			}
		};	
		
		// bind ENGINE events
		$("body").live("dataAdded",{obj:self},self.dataAddedHandle);
		$("body").live("newActive",{obj:self},self.newActiveHandle);
		$("body").live("newJSON",{obj:self},self.newJSONHandle);
		$("body").live("newPage",{obj:self},self.newPageHandle);		
		$("body").live("dataUpdated",{obj:self},self._objChangeHandle);
		$("body").live('deleteSel',function(e,sel){
			$(".ui-dialog").hide();
			// delete the selection in engine
			TILE.engine.deleteObj(sel);
		});
		
		
		// add TILE button
		var button={
			id:'getHLite',
			helptext:"Highlight a section of text",
			type:'mode'
		
		};
	},
	newJSONHandle:function(e,o){
		var self=e.data.obj;
		self.manifest=[];
		var json=TILE.engine.getJSON();
		if(json){
			for(j in json.pages){
				if(json.pages[j].selections){
					for(var sel in json.pages[j].selections){
						self.manifest.push(json.pages[j].selections[sel]);
					}
				}
			}
		}
	},
	// if the text selection button is active,
	// re-activate the listeners for text
	// selection
	newPageHandle:function(e,o){
		var self=e.data.obj;
		var engine=TILE.engine;
		if($("#getHLite").hasClass('active')){
			// reactivate the text selection mode 
			// in logbar_list
			$(".line_selected").removeClass("line_selected");
			// function for creating highlights
			var lineClickHandle=function(e){
				var self=e.data.obj;
				self.clearHighlights();
				var sel=self.createHighlight();
				TILE.engine.insertData(sel);
				var handle="span."+sel.id+":eq("+($("span."+sel.id).length-1)+")";
				TILE.engine.attachMetadataDialog(sel,handle);
			};
			// make active and stop all listeners of other objects
		
			$(".line").unbind();
			$(".line").bind('mouseup',{obj:self},lineClickHandle);
		}
	},
	dataAddedHandle:function(e,o){
		var self=e.data.obj;
		if(o.type!="selections") return;
		var data=[];
		$("span[class^='anno']").each(function(e){
			$("#logbar_list > .line > .button").remove();
			$("#logbar_list > .line > div").remove();
			
		});
		// self.textsel.removeHighlightMarkers();
		
		// check if selections are active
		// for(var x in TILE.activeItems){
		// 		if(!TILE.activeItems[x]) continue;
		// 		var id=TILE.activeItems[x].id;
		// 		// if already visible, don't add to stack
		// 		if($("span."+id).length) continue;
		// 		for(var item in self.manifest){
		// 			if(self.manifest[item].id==id){
		// 				data.push(self.manifest[item].obj);
		// 			}
		// 		}
		// 	}
		// nothing found - stop here
		if(data.length==0) return;
		self._loadItemsHandle(data);
	},
	newActiveHandle:function(e,o){
		var self=e.data.obj;
		if(o.type=='selections'){
			// load the passed selection object
			self._loadItemsHandle([o.obj]);
		} else {
			// erase markers
			$("span[class^='anno']").each(function(e){
				$(this).children(".button").remove();
				$(this).children("div").remove();
			});
			self.textsel.removeHighlightMarkers();
			var data=[];
			// check for selections within object
			for(var prop in o.obj){
				if(($.isArray(o.obj[prop]))&&(prop=='selections')){
					
					for(var id in o.obj[prop]){
						for(var item in self.manifest){
							if(self.manifest[item].id==o.obj[prop][id]){
								var sel=(self.manifest[item].obj)?self.manifest[item].obj:self.manifest[item];
								data.push(sel);
							}
						}
					}
					
				}
			}
			if(data.length) {
				$("#getHLite").trigger("click");
				self._loadItemsHandle(data);
			}
		}
	},
	// creates a TILE standard object and returns it
	createHighlight:function(){
		var url=TILE.url;
		var self=this;
		// de-select all transcript lines
		$(".line_selected").removeClass("line_selected");
		
		
		// clear all other highlights - will come back if they are saved
		// into the manifest
		$("span[class^=anno]").each(function(){
			$("#logbar_list > .line > .button").remove();
			$("#logbar_list > .line > div").remove();
			
		});

		self.textsel.removeHighlightMarkers();
		
		var sel=self.textsel.getSelectedText();
		
		if(sel==null) return;
		// make sure it's not highlighting the whole page
		if(!(/div\#line/.test(sel.StartParent))){
			self.textsel.clearSelections();
			if(TILE.experimental){
				TILE.engine.showError('Error drawing selection object. Startnode invalid.');
			}
			return;
		}

		// show on screen
		self.textsel.addSelection(sel);
		
		// find span tag and attach buttons
		self.attachButtons(sel);

		// make active
		self.activeSel=sel.id;
		// Make it so that the colorpicker is visible - otherwise hides behind .transcriptbar
		$("body > .colorpicker").css({"z-index":"9999"});
		// attach any current divs for references
		// self._attachLinkDiv(self.curLink);
		var o={jsonName:TILE.url,id:sel.id,type:"selections",display:"..."+$(sel.StartParent).text().substring(0,10)+"...",obj:sel};
		// add to manifest
		self.manifest.push(o);
		return o;
		
		
	},
	// clears highlights and all related buttons
	clearHighlights:function(){
		var self=this;
		self.textsel.clearSelections();
		$("span[class^=anno]").remove();
		$("span[class^=deleteHLite]").remove();
		
	},
	attachButtons:function(sel){
		var self=this;
		if(!sel) return;
		var id=sel.id;
		
		if($("#deleteHLite"+id).length){
			return;
		}
		// find span tag and attach buttons
		if($("span."+id).length>1){
			$("<span id=\"deleteHLite"+id+"\" class=\"button\">Delete</span>").appendTo($("span."+id+":eq("+($("span."+id).length-1)+")"));
		} else {
			$("<span id=\"deleteHLite"+id+"\" class=\"button\">Delete</span>").appendTo($("span."+id));
		}
	
		$("#deleteHLite"+id).bind("click",function(e){
			e.stopPropagation();
			$(this).parent().removeClass("active");
			
			$("span."+id+" > div").remove();
			$("span."+id+" > .button").remove();
			self.textsel.removeHighlightMarkers();
			
			$(this).remove();
			
			$("body:first").trigger("deleteSel",[sel]);
		});

		// attach any current divs for references
		// self._attachLinkDiv(self.curLink);
	},
	selectHighlight:function(id){
		var self=this;
		var url=$("#srcImageForCanvas").attr('src');
		var h=null;
		
		for(var i in self.manifest){
			if(self.manifest[i].id==id){
				h=(self.manifest[i].obj)?self.manifest[i].obj:self.manifest[i];
				break;
			}
		}
		if(!h) return null;
		
		var handle="span."+h.id+":eq("+($("span."+h.id).length-1)+")";
		var disp=$("span."+h.id+":eq(0)").text().substring(0,10);
		return [h,handle];
	},
	// e : {Event}
	// obj : {Object} - TILE object
	_objChangeHandle:function(e,obj){
		
		if(!(obj)||(obj.type!='selections')) return;
		var self=e.data.obj;
		// change passed reference's color
		
		for(var sel in self.manifest){
			if(self.manifest[sel].id==obj.id){
				self.manifest[sel]=obj.obj;
				// change if on display
				$("span[class^='anno']").each(function(i,o){
					
					if($(o).attr('class').replace(' selected','')==obj.id){
						$(o).css('background-color',obj.obj.color);
					}
				});
				break;
			}
		}
	
		
	
	},
	// e : {event}
	// data : {Object}
	_loadItemsHandle:function(data){
		var self=this;
		$("span[class^='anno']").each(function(e){
			$("#logbar_list > .line > .button").remove();
			$("#logbar_list > .line > div").remove();
		});
		self.textsel.removeHighlightMarkers();
		if(!data||(data.length==0)) return;
		
		self.textsel.importSelections(data);
		// attach buttons
		for(var v in data){
			self.attachButtons(data[v]);
		}
		
	},
	inputData:function(data){
		if(!data.obj) return false;
		if(!data.ref) return false;
		
		if(data.ref.type!='labels') return false;
		var self=this;
		self.addLinkHandle(data.ref,data.obj);
		return true;
	},
	getLink:function(){
		var self=this;
		if(!self.activeSel) return false;
		var url=$("#srcImageForCanvas").attr('src');
		var _sel=null;
		// make sure that the active ID actually exists in manifest
		for(var s in self.manifest[url]){
			if(!self.manifest[url][s]) continue;
			if(self.manifest[url][s].id==self.activeSel){
				_sel=self.manifest[url][s];
				break;
			}
		}
		if(!_sel) return false;
		// return data to the PluginController
		return {"id":_sel.id,"type":"selections","tool":self.id,display:"..."+$(_sel.StartParent).text().substring(0,10)+"..."};
	},
	// sel : {String} - ID for the selection to delete
	deleteSelf:function(sel){
		var self=this;
		if(!sel) return;
		var url=$("#srcImageForCanvas").attr('src');
		// remove the referenced selection
		for(var s in self.manifest[url]){
			if(self.manifest[url][s].id==sel){
				var ac=self.manifest[url].slice(0,s);
				var bc=self.manifest[url].slice((s+1));
				self.manifest[url]=ac.concat(bc);
			}
		}
	},
	removeData:function(data,sel){
		var self=this;
		
		var url=$("#srcImageForCanvas").attr('src');
		for(var s in self.manifest[url]){
			if(!self.manifest[url][s]) continue;
			if(self.manifest[url][s].id==sel.id){
				var ac=[];
				for(var x in self.manifest[url][s][data.type]){
					if(self.manifest[url][s][data.type][x]!=data.id){
						ac.push(self.manifest[url][s][data.type][x]);
					}
				}
				self.manifest[url][s][data.type]=ac;
			
				break;
			}
			
		}
		
	},
	unActive:function(){
		var self=this;
		
		$(".line").unbind("mouseup");
		$("span[class^='anno']").each(function(i,o){
			$(o).children("div").remove();
			$(o).children("span").remove();
			$(o).remove();
		});
	},
	close:function(){
		var self=this;
		$("body:first").trigger(self._close);
	},
	_close:"CloseSelector"
};
// register the plugin with TILE
TILE.engine.registerPlugin(TS);