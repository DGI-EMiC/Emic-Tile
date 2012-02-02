/**
* Transcript.js
* 
* @copyright MITH 
* @author Grant Dickie
* @author Doug Reside
* 
* Displays transcript lines that are decoded from JSON data
* Functions:
* 
* _drawText : displays the text that is contained in the lineArray variable
* _addLines(data,{optional} url) : takes a JSON-based array (data) and optional parameter url (if this data belongs
* 	to a new image) and changes the text display
* _shapeDrawnHandle : handler for the VectorDrawer shapeDrawn event. adds the drawn shape to the currently selected line
* _deleteItemHandle : handler for the deleteItem event from ActiveBox
* _updateItemHandle : handler for the shapeChanged event from VectorDrawer
* _lineSelected(index) : takes the argument index and sets the current line to the lineArray index matching index
* _lineDeSelected(index) : the opposite of _lineSelected
* exportLines : returns the lineArray
* bundleData(manifest) : takes argument manifest, which is the manifest for TILE_ENGINE, modifies/updates the TILE_ENGINE
* 							manifest data, then sends modified manifest back. 
*/	
(function ($, R, _) {
	var rootNS = this;
	
	rootNS.Transcript = Transcript;
	// Constructor
	// Takes {Object} args
	/*
	 * args:
	 * 	text = newLine delimited text file
	 *  loc = element to receive transcript Editor 
	 */
	function Transcript(args){
	
		var self = this;
		// format for array item: {"text":(args.text||[]),"info":[],"shapes":[]};
		this.lineArray = args.text;
		
		this.loc = $("#"+args.loc);
		this.infoBox = $("#"+args.infoBox);
		this.manifest=[];
	
		this.knownIds=[];
		// parse together all JSON data for the entire session
		// here
		if(this.lineArray){
			for(url in this.lineArray){	
				if(!(/jpg$|JPG$|gif$|GIF$|png$|PNG$/.test(url))) continue;
				if(!self.manifest[url]) self.manifest[url]=[];
				for(var l in this.lineArray[url].lines){
					var line=$.extend(true,{},this.lineArray[url].lines[l]);
					self.manifest[url][l]=line;
					if(!self.manifest[url][l].id){
						
						var id="line_"+Math.floor(Math.random()*560);
						while($.inArray(id,self.knownIds)>=0){
							id="line_"+Math.floor(Math.random()*560);
						}
						self.knownIds.push(id);
						self.manifest[url][l].id=id;
					}
				}
			}
			self.lineArray=self.manifest[$("#srcImageForCanvas").attr('src')];
			
		}
		this.curLine=0;
		this.curUrl=null;
	}
	Transcript.prototype={};
	$.extend(Transcript.prototype, {
		_newPageLoadedHandle:function(e,url){
			var self=e.data.obj;
			self._changeLines(url);
		},
		_insertLines:function(data){
			var self=this;
		
			
			
			self.lineArray=data;
		},
		_changeLines:function(url){
			var self=this;
			// has url been passed?
			if(url&&(self.curUrl!=url)){
				self.manifest[self.curUrl]=self.lineArray;
				self.curUrl=url;
				
			}
			// if(!data) return;
			
			self.lineArray=self.manifest[self.curUrl];
			
			// reset curLine
			self.curLine=0;
			// check for auto-recognized lines      
			// self._setAutoLines();
			// self.manifest[self.curUrl]=self.lineArray;
			self.loc.empty();
			self._drawText();
		},
		// Takes new JSON data and applies this to 
		// the lineArray and manifest variables
		// data : {Object} JSON data that is to be fed
		// url : {String} Optional url to be given - if given, a new manifest
						// object is created and fed into the manifest array
		_addLines:function(data,url){
			var self=this;
			// has url been passed?
			if(url&&(self.curUrl!=url)){
				self.manifest[self.curUrl]=self.lineArray;
				self.curUrl=url;
				
			}
			
			if((!(data))||(!($.isArray(data)))) return;
			// parse out the data
			for(var d in data){
				if(data[d]){
					
					// find id in manifest
					for(var x in self.manifest[self.curUrl]){
						if(self.manifest[self.curUrl][x].id==data[d].id){
							self.manifest[self.curUrl][x]=data[d];
							break;
						}
					}
				}
			}
			
			
			self.lineArray=self.manifest[self.curUrl];
			
			// reset curLine
			self.curLine=0;
			
			self.loc.empty();
			self._drawText();			
		},
		// Fills in the Transcript box with transcript lines, 
		// as received from the JSON data put into lineArray
		_drawText: function(){
			var self=this;
			
			for (var i in self.lineArray) {
				if(!this.lineArray[i]) continue;
				var uid=this.lineArray[i].id;
				if(typeof this.lineArray[i].id=='string'){
					uid = this.lineArray[i].id.replace(/\.|\:/g,'');
				}
				if (!(this.lineArray[i].shapes)){
					this.lineArray[i].shapes=[];
				}
				if(!(this.lineArray[i].info)){
					this.lineArray[i].info=[];
				}
				$("<div id='" + uid + "' class='line'>" + this.lineArray[i].text + "</div>").appendTo($("#logbar_list")).mouseover(function(e){
					$(this).addClass("trans_line_hover");
				}).mouseout(function(e){
					$(this).removeClass("trans_line_hover");
				});
				var n=i;
				// attach data for index value 
				$("#"+uid).data("index",n);
			}
			
			$("#logbar_list > .line").bind("click",function(e){
				e.preventDefault();

				$(this).removeClass("trans_line_hover");
				// var index = parseInt($(this).attr("id").substring($(this).attr("id").lastIndexOf("_")+1),10);
				if ($(this).hasClass("line_selected")){
					// de-select the line
					// var id=$(".line_selected").attr('id').replace("TILE_Transcript_","");
					$(".line_selected").removeClass("line_selected");
					$(this).trigger("lineDeselected");
				} else{
					$(".line_selected").removeClass("line_selected");
					// 						var n=$(this).attr('id').indexOf("_");
					// 						
					// 						var index=parseInt($(this).attr('id').substring(0,n),10);
					$(this).addClass("line_selected");
					$(this).trigger("TranscriptLineSelected",[$(this).attr('id')]);
					// self._lineSelected($(this).attr('id'));
				}

			});
			
			// check if the page has no transcript lines associated with it
			if($("#"+self.loc.attr('id')+" > .line").length==0){
				// no lines 
				self.loc.append($("<div class=\"line\">No Transcript Lines Were Found For This Image</div>"));
			}
			
		},
		// Warning: can cause recursion since lblSelected fires the bound event
		_loadItemsHandle:function(e,data){
			var self=e.data.obj;
			if(!self.lineArray) return;
			$(".line_selected").removeClass("line_selected");
			for(s in self.lineArray){
				if($.inArray(self.lineArray[s].id,data)>=0){
					$("#TILE_Transcript_"+self.lineArray[s].id).addClass("line_selected");
				}
				
				
			}
		},
		_addLinkHandle:function(ref,line){
			if(ref.type=='lines') return;
			// if(!$(".line_selected").length) return;
			var self=this;
			for(x in self.lineArray){
				if(self.lineArray[x].id==line.id){
					self.curLine=x;
					break;
				}
			}
			
			
			if(self.curLine==null) return;
			// deactivate self
			// $(".line_selected").removeClass("line_selected");
			
			if(self.lineArray[self.curLine][ref.type]){
				for(x in self.lineArray[self.curLine][ref.type]){
					var item=self.lineArray[self.curLine][ref.type][x];
					if(item&&(item.id==ref.id)){
						
						return;
						break;
					}
				}
			} else {
				self.lineArray[self.curLine][ref.type]=[];
			}
		
			self.lineArray[self.curLine][ref.type].push(ref);
			// self._addLinkDiv(self.lineArray[self.curLine].id,ref);
			// $("#TILE_Transcript_"+self.lineArray[self.curLine].id).append($("<div id=\""+ref.id+"\" class=\"button\">"+ref.type+": "+ref.id+"</div><span id=\"delete_"+ref.id+"\" class=\"button\">X</span>"));
			// 			$("#TILE_Transcript_"+self.lineArray[self.curLine].id+" > #delete_"+ref.id).click(function(e){
			// 				e.stopPropagation();
			// 				
			// 				$("body:first").trigger("deleteLink",[{id:ref.id,type:ref.type}]);
			// 				$(this).remove();
			// 				$("#"+ref.id).remove();
			// 			});
		
		},
		_addLinkDiv:function(id,ref){
			if(ref==null) return;
			var self=this;
			
			$("#Transcript_Line_"+id).append();
			$("#TILE_Transcript_"+id).append($("<div id=\""+ref.id+"\" class=\"button\">"+ref.type+": "+ref.id+"</div><span id=\"delete_"+ref.id+"\" class=\"button\">X</span>"));
			$("#TILE_Transcript_"+id+" > #delete_"+ref.id).click(function(e){
				e.stopPropagation();
				
				$("body:first").trigger("removeTransLink",[{id:ref.id,type:ref.type,parentObj:id,parentType:"lines"}]);
				$(this).remove();
				$("#"+ref.id).remove();
			});
		},
		// ref : {Object} - [id: {String}, type: {String}]
		// line : {String}
		_deleteLinkHandle:function(ref,line){
			
			if(ref.type=="lines") return;
			// if(!$(".line_selected").length) return;
			var self=this;
			if(!line){
				//  delete from every instance
					for(var n in self.lineArray){
						if(self.lineArray[n][ref.type]){
							for(var x in self.lineArray[n][ref.type]){
								var item=self.lineArray[n][ref.type][x];

								if(item&&(item.id==ref.id)){
									// delete the referenced item
									if(self.lineArray[n][ref.type].length>1){
										// var ac=self.lineArray[n][ref.type].slice(0,x);
										// 							var bc=self.lineArray[n][ref.type].slice((x+1));
										// 							self.lineArray[n][ref.type]=ac.concat(bc);
										var narray=[];
										for(sh in self.lineArray[n][ref.type]){
											if(self.lineArray[n][ref.type][sh].id!=ref.id){
												narray.push(self.lineArray[n][ref.type][sh]);
											}
										}
										self.lineArray[n][ref.type]=narray;
									} else {
										self.lineArray[n][ref.type]=[];

									}
									// $("#"+ref.id).remove();
									// $("#delete_"+ref.id).remove();
									break;
								}
							}
						} else {
							continue;
						}	
					}
			
			
			} else {
				// delete only from the line referenced
				
				for(x in self.lineArray){
					if(self.lineArray[x].id==line){
						self.curLine=x;
						break;
					}
				}
				// self.curLine=parseInt($(".line_selected").attr('id').substring(0,($(".line_selected").attr('id').indexOf("_"))),10);
				if(self.curLine==null) return;
		
				if(self.lineArray[self.curLine][ref.type]){
					for(x in self.lineArray[self.curLine][ref.type]){
						var item=self.lineArray[self.curLine][ref.type][x];
					
						if(item&&(item.id==ref.id)){
							// delete the referenced item
							if(self.lineArray[self.curLine][ref.type].length>1){
								// var ac=self.lineArray[self.curLine][ref.type].slice(0,x);
								// 							var bc=self.lineArray[self.curLine][ref.type].slice((x+1));
								// 							self.lineArray[self.curLine][ref.type]=ac.concat(bc);
								var narray=[];
								for(sh in self.lineArray[self.curLine][ref.type]){
									if(self.lineArray[self.curLine][ref.type][sh].id!=ref.id){
										narray.push(self.lineArray[self.curLine][ref.type][sh]);
									}
								}
								self.lineArray[self.curLine][ref.type]=narray;
							} else {
								self.lineArray[self.curLine][ref.type]=[];
							
							}
							break;
						}
					}
				} else {
					return;
				}
			}
			return;
			
		},
		//called when a user changes something on an item attached to a line 
		//right now only works for shapes
		// e : {Event}
		// shapes : {Object} Array of JSON objects representing VectorDrawer Shapes
		_updateItemHandle:function(e,shapes){
			var self=e.data.obj;
			if(!$(".line_selected").length) return;
			$(".line_selected").removeClass("line_selected");
			$("#TILE_Transcript_"+self.curLine).addClass("line_selected");
			
			
			if(!self.lineArray[self.curLine]){
				//we hopefully don't get here
				for(v in shapes){
					var shape=shapes[v];
					$("body:first").trigger("VD_REMOVESHAPE",[shape]);
				}
				return;
			}
		
			self.lineArray[self.curLine].shapes=shapes;
		
			$("body:first").trigger("TranscriptLineSelected",self.lineArray[self.curLine].id);
		},
		// Updates all lines with given data
		// 
		_updateAllItemsHandle:function(e,data){
			var self=e.data.obj;
			if(data.shapes){
				
				for(sh in data.shapes){
					var id=data.shapes[sh].old;
					for(l in self.lineArray){
						var p=$.inArray(id,self.lineArray[l].shapes);
						if(p>=0){
							self.lineArray[l].shapes[p]=data.shapes[sh].curr;
						}
					}
				}
			}
			
		},
		//called when a line object is selected
		//users can select on or multiple lines
		// id : {String} represents id in lineArray
		_lineSelected:function(id){
			var self=this;
			var index=null;
			for(x in self.lineArray){
				if(id==self.lineArray[x].id){
					index=x;
					break;
				}
			}
			if(self.lineArray[index]) {
				//clear all shapes
				$("body:first").trigger("clearShapes");
				// change curLine
				self.curLine=index;
				//load any shapes from curLine
				if(!self.lineArray[self.curLine].shapes) self.lineArray[self.curLine].shapes=[];
				// if(self.lineArray[self.curLine].shapes.length>0){
					// prepare shapes 
					var shps=[];
				
					for(var s in self.lineArray[self.curLine].shapes){
						if(!self.lineArray[self.curLine].shapes[s]) continue;
						shps.push(self.lineArray[self.curLine].shapes[s]);
					}
				$("body:first").trigger("loadItems",[shps]);
				// }
				$("body:first").trigger("TranscriptLineSelected",[id]);
				// $("body:first").trigger("addLink",[{id:self.lineArray[self.curLine].id,type:"lines"}]);
			} else {
				// hopefully won't reach this
				return;
			}
			
		},
		// called when a line Object is no longer active - resets ActiveBox
		// index : {Integer} represents index in lineArray
		_lineDeSelected:function(index){
			var self=this;
			self.curLine=null;
			$("body:first").trigger("TranscriptLineSelected",[null]);
		},
		// Returns the current lineArray - not full manifest
		// return: lineArray : {Object}
		exportLines:function(){
			var self=this;
			return self.lineArray;
		},
		// Returns full manifest of lineArrays
		//getting manifest from TILE_ENGINE
		// manifest : {Object} passed manifest object from TILE_ENGINE
		bundleData:function(manifest){
			var self=this;
			//take manifest and merge with Transcript manifest
			for(url in manifest){
				if(self.manifest[url]){
					
					// if(__v) console.log("bundleData in Transcript: TR.manifest[url]: "+JSON.stringify(self.manifest[url]));
					
					manifest[url].lines=self.manifest[url];
					// if(__v) console.log("bundleData in Transcript: manifest[url]: "+JSON.stringify(manifest[url].lines));
				}
			}		
			return manifest;
		}
		
	}
	
	);})(jQuery, Raphael, _);

	/**
	* Plugin Wrapper for the TILE.engine object to activate
	* the plugin
	*
	* start() method is the constructor
	*/ 
	var Trans={
		id:"Transcript1000",
		name:'Transcript',
		/**
		* start()
		* @constructor
		* @params mode {Object} - Mode object passed when TILE.engine calls start()
		*/
		start:function(mode){
			var self=this;
			
			
			var clickTrans=function(e){
				e.preventDefault();
				$(".ui-dialog").hide();
				$(".shpButtonHolder").remove();
				
				if($(this).hasClass('active')) return;
				
				$(".menuitem > ul > li > .btnIconLarge").removeClass('active');
				$(this).addClass('active');
				self.restart();
			};
			
			// var text=data.lines;
			self.transcript=new Transcript({text:[],loc:'logbar_list'});
			// insert the HTML into the interface
			var html='<div id="tile_toolbar" class="toolbar"><div class="menuitem pluginTitle">Transcript Lines</div></div><div id="logbar_list" class="az"></div>';
			TILE.engine.insertModeHTML(html,'topleft',mode.name);
			// insert button
			TILE.engine.insertModeButtons('<div class="menuitem"><ul><li><a id="L579" class="btnIconLarge getTrans" title="Activate Transcript Mode">Activate Transcript Mode</a></li></ul></div>','topleft',mode.name);
			
			// if no other active buttons, then this one is active
			if(!$("#tile_toolbar > .menuitem > ul > li > a").hasClass('active')){
				$("#L579").addClass('active');
			}
			
			$("#L579").live('click',clickTrans);
			
		
			
			// trnsClick handler
			var _trnsClickHandle=function(e,id){
				var obj={id:id,type:'lines',jsonName:TILE.url,display:$("#"+id).text().substring(0,10),obj:{id:id,type:'lines'}};
				TILE.engine.setActiveObj(obj);
			};
			
			
			$("body").live("TranscriptLineSelected",{obj:self},_trnsClickHandle);
			// listens for when a user de-selects a line
			$("body").bind("lineDeselected",{obj:self},function(e,obj){
				// send a blank array - thus deleting all items on canvas
				TILE.engine.setActiveObj(null);
				// $("body:first").trigger("loadItems",[[]]);
			});
			$("body").bind("removeTransLink",{obj:self},function(e,data){
				data.parentTool=self.id;
				
				// find link in manifest
				var url=TILE.url;
				for(var x in self.linkManifest[url][data.parentObj]){
					if(data.id==self.linkManifest[url][data.parentObj][x].id){
						data.tool=self.linkManifest[url][data.parentObj][x].tool;
					}
				}
				
				$("body:first").trigger(self.deleteCall,[data]);
			});
			
			// insert title into plugin area
			$("#tile_toolbar > .pluginTitle").text("Transcript Lines");
			
			// bind ENGINE events
			$("body").live("dataAdded",{obj:self},self.dataAddedHandle);
			$("body").live("newActive",{obj:self},self.newActiveHandle);
			$("body").live("newJSON newPage",{obj:self},self.newJSONHandle);
			$("body").live("dataUpdated", {obj:self}, self.dataUpdatedHandle);
			$("body").live("dataDeleted", {obj:self}, self.dataDeletedHandle);
			$("body").live("dataLinked", {obj:self}, self.dataLinkedHandle);
			// $("body").live("newPage",{obj:self},self.newJSONHandle);
			

			
			// check to see if data already loaded
			var data=TILE.engine.getJSON(true);
			if(data){
				var text=[];
				if(data&&(data.lines)){
					// parse out data
					for(var line in data.lines){
						if((!(data.lines[line]))||(typeof(data.lines[line])=='undefined')) continue;
						text.push(data.lines[line]);
					}
				}
				self.transcript.loc.empty();
				// insert new page into Transcript
				self.transcript._insertLines(text);

				self.transcript._drawText();
			}
		},
		dataAddedHandle:function(e, obj){
			var self=e.data.obj;
			if(obj.type == 'lines') {
				// check for attached data
				var refs = false;
				
				$.each(obj, function (i, o) {
					if($.isArray(o)) {
						refs = true;
					}
				});
				
				if(refs) {
					// attach style to line
					$("#logbar_list > #"+obj.id).addClass('data_attached');
				}
			} else {
				// verify attached data 
				//  and add attached data class to line
				// element
				var refs = [];
				$.each(obj, function (i, o) {
					if(i == 'lines') {
						$.each(o[i], function (n, id) {
							refs.push(id);
						});
					}
				});
				
				$.each(refs, function (x, y) {
					// attach style to line
					$("#logbar_list > #"+y).addClass('data_attached');
				});
				
			}
			
		},
		newActiveHandle:function(e,o){
			var self=e.data.obj;
			if(o.type != 'lines'){
				// all lines deactivated
				$(".line_selected").removeClass("line_selected");
			}
		},
		newJSONHandle:function(e){
			var self=e.data.obj;
			// get current page
			var data=TILE.engine.getJSON(true);
			var text=[];
			if(data&&(data.lines)){
				// parse out data
				for(var line in data.lines){
					
					if((!(data.lines[line]))||(typeof(data.lines[line])=='undefined')) continue;
					text.push(data.lines[line]);
				}
			}
			$("#az_log > div > #logbar_list").empty();
			// insert new page into Transcript
			self.transcript._insertLines(text);
			self.transcript._drawText();

			// for(var a in TILE.activeItems){
			// 				var id=TILE.activeItems[a].id;
			// 				if($("#"+id+".line").length){
			// 					$("#"+id+".line").addClass('line_selected');
			// 				}
			// 			}
		},
		dataLinkedHandle: function (e, args) {
			var self = e.data.obj;
			if(!args) return;
			if(args[0].type != "lines" && args[1].type != "lines") {
				return;
			}
			
			var line = (args[0].type == 'lines') ? args[0] : args[1];
			
			$("#logbar_list > #"+line.id).addClass("data_attached");
			
			
		},
		dataUpdatedHandle:function (e, obj) {
			var self = e.data.obj;
			
			if(obj.type == 'lines') {
				// check for attached data
				var refs = false;
				
				$.each(obj, function (i, o) {
					if($.isArray(o)) {
						refs = true;
					}
				});
				
				if(refs) {
					// attach style to line
					$("#logbar_list > #"+obj.id).addClass('data_attached');
				}
			} else {
				// verify attached data 
				//  and add attached data class to line
				// element
				var refs = [];
				$.each(obj, function (i, o) {
					if(i == 'lines') {
						$.each(o[i], function (n, id) {
							refs.push(id);
						});
					}
				});
				
				$.each(refs, function (x, y) {
					// attach style to line
					$("#logbar_list > #"+y).addClass('data_attached');
				});
				
			}
		},
		dataDeletedHandle: function (e, obj) {
			var self = e.data.obj;
			if(obj.type == 'lines') return; // shouldn't happen
			var refs = [];
			// find line references
			$.each(obj.obj, function (i, o) {
				if(i == 'lines'){
					$.each(o, function (n, id) {
						refs.push(id);
					});
				}
			});
			
			// verify that the lines on the page 
			// have connected data
			var json = TILE.engine.getJSON(true);
			
			$.each(json['lines'], function(i, line) {
				if($.inArray(line.id, refs)>=0) {
					var f = false;
					
					$.each(line, function(n, prop) {
						if($.isArray(prop[n])){
							f = true;
						}
					});
					if(f == false) {
						$("#logbar_list > #"+line.id).removeClass("data_attached");
					}
				}
			});
			
			
		},
		// being passed a copy of the engine
		loadJSON:function(engine,activeItems){
			var self=this;
			// get current page
			var data=TILE.engine.getJSON(true);
			
			var text=[];
			if(data&&(data.lines)){
				// parse out data
				for(var line in data.lines){
					if((!(data.lines[line]))||(typeof(data.lines[line])=='undefined')) continue;
					text.push(data.lines[line]);
				}
			}
			self.transcript.loc.empty();
			// insert new page into Transcript
			self.transcript._insertLines(text);
			
			self.transcript._drawText();
			
			for(var a in activeItems){
				var id=activeItems[a].id;
				if($("#"+id+".line").length){
					$("#"+id+".line").addClass('line_selected');
				}
			}
			
		},
		unActive:function(){
			var self=this;
			// $("#transcript_toolbar > p").remove();
			// $("#transcript_toolbar").append("<p>Double Click Here to Activate Lines Again.</p>");
			// remove span tags
			$(".line").children("span").remove();
			self.transcript.loc.empty();
			self.transcript._drawText();
			$(".line").each(function(i,o){
				// $(o).children("span").children(".button").hide();
				$(o).unbind("mousedown");
				$(o).unbind("mouseover");
				
				
			}).removeClass("line_selected");
		},
		_trnsClickHandle:function(e,id){
			var self=e.data.obj;
			$("body:first").trigger(self.activeCall,[self.id,{id:id,type:'lines',jsonName:$("#srcImageForCanvas").attr('src'),display:$("#"+id).text().substring(0,10),obj:{id:id,type:'lines'}}]);
			
		},
		getLink:function(){
			var self=this;
			// get selected line, if none selected, stop
			if(!($(".line_selected").length)) return false;
			
			var line=$(".line_selected").attr("id");
			var txt=$("#"+line).text().substring(0,10)+"...";
			// return the currently selected line
			return {"type":"lines","id":line,jsonName:$("#srcImageForCanvas").attr('src'),display:txt,obj:{id:line,type:'lines'}};
		},
		inputData:function(data){
			var self=this;
			
			var url=$("#srcImageForCanvas").attr('src');
		
			if(!self.linkManifest[url]) self.linkManifest[url]=[];
			if(data.lines){
				// adding an array of lines
				self.transcript._addLines(data.lines);
				return;
			} else if($(".line_selected").length){
				if(!self.linkManifest[url][data.obj.id]){
					self.linkManifest[url][data.obj.id]=[data.ref];
				} else {
					for(var x in self.linkManifest[url][data.obj.id]){
						if(data.ref.id==self.linkManifest[url][data.obj.id][x].id){
							return;
							break;
						}
					}
					self.linkManifest[url][data.obj.id].push(data.ref);
				}
				
				self.transcript._addLinkHandle(data.ref,data.obj);
				return true;
			} else {
				return;
			}
		},
		removeData:function(data,line){
			var self=this;
			
			if(data.type=='lines') return;
			if(line.id) line=line.id;
			self.transcript._deleteLinkHandle(data,line);
		},
		restart:function(){
			var self=this;
			$(".line").unbind();
			$("#az_transcript_area > #logbar_list").empty();
			self.transcript._drawText();
			
			if(!$("#getTrans").hasClass('active')) $("#getTrans").addClass('active');
		},
		close:function(){
			var self=this;
			// $("body:first").trigger(self._close);
		},
		bundleData:function(json){
			var self=this;
			// Make a copy of the passed JSON
			var jcopy=$.extend(true,{},json);
					
			json=self.transcript.bundleData(jcopy);
			return json;
		}
	};
	// register the plugin with TILE
	TILE.engine.registerPlugin(Trans);