/**
* Labels
* Manages metadata in Label window - hides and shows
* Labels that are present on the page
* 
* 
*/

/**
* @constructor
* @params args {Object}
*/
var Label=function(args){
	var self=this;
	
	self.DOM=$("#az_LabelBox");
	self.clearTextArea=$("#clearTextArea");
	self.addLabelText=$("#filterLabelText");
	self.labelList=$("#az_activeBox > div > div#labelList");
	self.manifest=[];
	self.checkIds=[];
	self.clearTextArea.click(function(e){
		self.addLabelText.val("");		
		self._textTypeHandle();
	
	});
	self.addLabelText.keypress(function(e){
		// wait a second and see what we're typing
		setTimeout(function(){
			self._textTypeHandle();
		},650);
		
	});
	$("#az_LabelBox > .toolbar > .menuitem > ul").bind("blur",function(e){
		self._textLoseFocusHandle();
	});
	
	// global listener for all labelitems in .az .labelList
	$("#labelList > .labelItem").live("click",function(e){
		e.preventDefault();
		
		$(".az > #labelList > .labelItem").removeClass("active");
		$(this).addClass("active");
		// get id for label
		var id=$(this).attr('id').replace("lbl_","");
		// $("body:first").trigger("labelSelected",[{type:"labels",id:id}]);
		$("body:first").trigger("labelSelected",[{name:$(this).text(),id:id}]);
	});
	
	// essential global listeners
	// $("body").bind("addLink",{obj:self},self._addLinkHandle);
	// $("body").bind("labelClick",{obj:self},self.lblSelected);
	
	// self.labelData=(args.data)?args.data.labels:null;
	// 	if(self.labelData){self.loadLabels(self.labelData);}
	
	
};
Label.prototype={
	// Loads labels from JSON data
	// New labels are added in bundleData() and sortOutput()
	loadLabels:function(data){
		var self=this;
		$("#labelList").empty();
		// each label receives an li tag that has a click
		// event attached
		for(d in data){
			if(!data[d]) continue;
			// get rid of duplicates
			if($("#labelList > #"+data[d].id).length==0){
				var lbl=data[d].obj;
				$("<div id=\""+lbl.id+"\" class=\"labelItem\">"+lbl.name+"</div>").appendTo("#labelList");
			}
			self.manifest.push(data[d]);
			self.checkIds.push(data[d].id);
		}
	
	},
	lblSelected:function(e,data){
		
		var self=e.data.obj;
		// deactivate other labels and activate this label
		// $(".labelItem").removeClass("active");
		self.addLabelText.val($("#lbl_"+data.id).text());
		// var url=$("#srcImageForCanvas").attr('src');
		// $("#lbl_"+data.id).addClass("active");
		
		self.curId=data.id;
		
		// show all references associated with this object
		for(x in self.manifest){
			
			if(self.manifest[x].id==self.curId){
				if(!self.manifest[x].refs) self.manifest[x].refs=[];
				$("body:first").trigger("labelSelected",[self.manifest[x]]);
				break;
			}
		}
	},
	_textTypeHandle:function(){
		var self=this;
		var txt=self.addLabelText.val();
		if(txt.length>0){
		var regex=new RegExp("^"+txt);
		self.labelList.children("div").each(function(i,o){
			if(!regex.test($(o).text())){
				$(o).hide();
			} else {
				$(o).show();
			}
		});
		} else {
			self.labelList.children('div').each(function(i,o){
				$(o).show();
			});
		}
	},
	_textLoseFocusHandle:function(){
		var self=this;
		self.labelList.children("div").each(function(i,o){
			$(o).show();
		});
	},
	_addLabelClickHandle:function(){
		var self=this;
		// find item
		var id=null;
		var txt=self.addLabelText.val();
		for(x in self.manifest){
			if(self.manifest[x].name==txt){
				id=self.manifest[x].id;
				break;
			}
		}
		if(!id) {
			// new user-generated label 
			// create manifest record
			id=Math.floor(Math.random()*560);
			while($.inArray(id,self.checkIds)>=0){
				id=Math.floor(Math.random()*560);
			}
			
			var rec={
				id:id,
				name:txt,
				refs:[]
			};
			self.checkIds.push(id);
			$("<div id=\"lbl_"+id+"\" class=\"labelItem\">"+txt+"</div>").appendTo(self.labelList);
			$("#lbl_"+id).bind("click",function(e){
				if($(this).hasClass("active")) {
					$(this).removeClass("active");
					return;
				}
				$(".labelItem").removeClass("active");
				$(this).addClass("active");
				// get id for label
				var id=$(this).attr('id').replace("lbl_","");
				// $("body:first").trigger("labelSelected",[{type:"labels",id:id}]);
				
				$("body:first").trigger("labelSelected",[{name:$(this).text(),id:id}]);
			});
			self.manifest.push(rec);
			
		}
		// $(".labelItem").removeClass("active");
		// $("#lbl_"+id).addClass("active");
		// fire event for applying metadata
		// $("body:first").trigger("addLink",[{type:'labels',id:id}]);
		
	},
	// Function that answers the addLink Custom Event call
	// e : {Event}
	// ref : {Object} : Referenced object, contains:  id: {String}, type: {String}
	// label : {Object} : label object to attach ref to
	_addLinkHandle:function(ref,label){
		
		if(ref.type=="labels") return;
		var self=this;
		// put focus on labels if no transcript line is selected
		if(!$(".line_selected").length){ 
			self.addLabelText[0].focus();
			
		};
		
		if(($.inArray(label.id,self.checkIds)<0)){ 
			
			self.manifest.push({id:label.id,display:label.name,name:(label.name)?label.name:"Area of interest",refs:[]});
			
			self.checkIds.push(label.id);
			$("<div id=\"lbl_"+label.id+"\" class=\"labelItem\">"+label.name+"</div>").click(function(e){
				if($(this).hasClass("active")) {
					$(this).removeClass("active");
					return;
				}
				$(".labelItem").removeClass("active");
				$(this).addClass("active");
				// get id for label
				var id=$(this).attr('id').replace("lbl_","");
				// $("body:first").trigger("labelSelected",[{type:"labels",id:id}]);
				
				$("body:first").trigger("labelClick",[{name:$(this).text(),id:id}]);
			}).appendTo(self.labelList);
			// $("#lbl_"+id).addClass("active");
			
		} else {
			id=label.id.replace("lbl_","");
		}
		
	
		// deactivate active state
		// $(".labelItem.active").removeClass("active");
		for(x in self.manifest){
			if(self.manifest[x].id==label.id){
				// see if it has refs
				if(self.manifest[x].refs){
					if($.inArray(ref.id,self.manifest[x].refs)>=0){
						return;
					}
					// for(it in self.manifest[x][ref.type]){
					// 						if(self.manifest[x][ref.type][it]==ref.id){
					// 							// already in ref array, cancel operation
					// 							return;
					// 							break;
					// 						}
					// 					}
				} else {
					self.manifest[x].refs=[];
				}
				self.manifest[x].refs.push(ref.id);
				
				break;
			}
		}
	},
	_deleteLinkHandle:function(ref,lbl){
		
 		if(ref.type=='labels') return;
		var self=this;
		if(!lbl){
			// delete from every instance
			for(x in self.manifest){
				if(self.manifest[x]){
					for(r in self.manifest[x].refs){
						if(self.manifest[x].refs[r]==ref.id){

							// re-parse the ref array
							if(self.manifest[x].refs.length>1){
								var ac=self.manifest[x].refs.slice(0,r);
								var bc=self.manifest[x].refs.slice((r+1));
								self.manifest[x].refs=ac.concat(bc);

							} else {
								self.manifest[x].refs=[];
								
							}
						}
					}
				}
			}
			
		}
		
		
		// if($(".labelItem.active").length==0) return;
		// var id=$(".labelItem.active").attr('id').replace("lbl_","");
		for(x in self.manifest){
			if(self.manifest[x].id==lbl){
				
				for(r in self.manifest[x].refs){
					if(self.manifest[x].refs[r]==ref.id){
						
						// re-parse the ref array
						if(self.manifest[x].refs.length>1){
							var ac=self.manifest[x].refs.slice(0,r);
							var bc=self.manifest[x].refs.slice((r+1));
							self.manifest[x].refs=ac.concat(bc);
							
						} else {
							self.manifest[x].refs=[];
							
						}
					}
				}
				break;
			}
		}
		
	},
	sortOutputData:function(){
		var self=this;
		// get rid of null pointers
		var cleanManifest=[];
		for(var l in self.manifest){
			if(self.manifest[l]) cleanManifest.push(self.manifest[l]);
		}
		self.manifest=cleanManifest;
		return cleanManifest;
	}
	
};

/**
* Plugin Wrapper that TILE.engine uses to load in plugin
* start() method is constructor
*
*/
var LB={
	name:"Labels",
	/**
	* start()
	* @constructor
	* @params mode {Object} - Mode object passed when TILE.engine calls start()
	*/
	start:function(mode){
		
		var self=this;
		self.lbls=[];
		// manipulate DOM space
		var html='<div class="toolbar" id="addLabelToolbar"><div class="menuitem pluginTitle">Labels</div><div class="menuitem"><ul><li><input id="filterLabelText" class="" type="text" value="" /></li></ul></div></div><div id="labelList" class="az"></div>';
	
		// add HTML content to interface
		TILE.engine.insertModeHTML(html,'bottomleft',mode.name);
		
		// create new label instance
		self.LBL=new Label({data:[]});
		
		$("body").bind("labelSelected",function(e,obj){
			// send obj to the engine
			var lbl={id:obj.id,type:'labels',jsonName:'labels'};
			
			TILE.engine.setActiveObj(lbl);
		});
		
		
		if(self.lbls.length) {
			TILE.engine.insertTags(self.lbls);
			self.LBL.loadLabels(self.lbls);
		}
		
		// insert title into plugin area
		$("#addLabelToolbar > .pluginTitle").text("Labels");
		// attach global listeners
		$("body").live("newJSON newPage",{obj:self},self.newJSONHandle);
		$("body").live("dataAdded",{obj:self},self.dataAddedHandle);
		$("body").live("newActive",{obj:self},self.activeObjHandle);
		$("body").live("dataDeleted",{obj:self},self.dataDeletedHandle);
		$("body").live("dataLinked",{obj:self},self.dataLinkedHandle);
		$("body").live("dataUpdated",{obj:self},self.dataUpdatedHandle);
		// check to see if json data is already loaded
		var data=TILE.engine.getJSON(true);
		if(data){
			// data loaded - start labels
			if(!data.labels) return;
			var vd=[];
			var newLbls=[];
			// parse labels
			for(var d in data.labels){
				if(!self.lbls[data.labels[d].id]){
					self.lbls[data.labels[d].id]={id:data.labels[d].id,type:'labels',jsonName:'labels',obj:data.labels[d]};
					newLbls.push({id:data.labels[d].id,type:'labels',jsonName:'labels',obj:data.labels[d]});
				}

			}
			vd=self.findLabelsOnPage(data);

			// for(var d in self.lbls){
			// 		vd.push(self.lbls[d]);
			// 	}
			self.LBL.loadLabels(vd);
			if(newLbls.length){
				TILE.engine.insertTags(newLbls);
			}
			
		}
	},
	newJSONHandle:function(e){
		var self=e.data.obj;
		if(e.type=='newPage'){
			// clear the label area
			$("#labelList").empty();
		}
		$(".labelItem").removeClass('active');
		var data=TILE.engine.getJSON();

		if(!data.labels) return;
		var vd=[];
		var newLbls=[];
		// parse labels
		for(var d in data.labels){
			if(!self.lbls[data.labels[d].id]){
				self.lbls[data.labels[d].id]={id:data.labels[d].id,type:'labels',jsonName:'labels',obj:data.labels[d]};
				newLbls.push({id:data.labels[d].id,type:'labels',jsonName:'labels',obj:data.labels[d]});
			}
			
		}
		vd=self.findLabelsOnPage(data);
		
		self.LBL.loadLabels(vd);
		if(newLbls.length){
			TILE.engine.insertTags(newLbls);
		}
	},
	// handles whenever two objects are attached 
	// within the JSON
	dataLinkedHandle:function(e,args){
		if(!args) return;
		if((args[0].type!='labels')&&(args[1].type!='labels')){
			// no labels attached - no need to update
			return;
		}
		
		var self=e.data.obj;
		var data=TILE.engine.getJSON();
		vd=self.findLabelsOnPage(data);
		self.LBL.loadLabels(vd);
	},
	dataAddedHandle:function(e){
		var self=e.data.obj;
		var check=false;
		
		var data=TILE.engine.getJSON();
		
		// deactivate labels
		// $(".labelItem").removeClass('active');
		// check if any labels were added
		var vd=[];
		var newLbls=[];
		// parse labels
		for(var d in data.labels){
			if(!self.lbls[data.labels[d].id]){
				self.lbls[data.labels[d].id]={id:data.labels[d].id,type:'labels',jsonName:'labels',obj:data.labels[d]};
				newLbls.push({id:data.labels[d].id,type:'labels',jsonName:'labels',obj:data.labels[d]});
			}
		}
		vd=self.findLabelsOnPage(data);
		
		self.LBL.loadLabels(vd);
		
		
		if(newLbls.length){
			TILE.engine.insertTags(newLbls);
		}
		
		self.createWordle(data);
	},
	dataDeletedHandle:function(e,obj){
		var self=e.data.obj;
		if(!obj) return;
		if(obj.type.toLowerCase()=='labels'){
			var data=[];
			
			for(var x in self.lbls){
				if(x!=obj.id){
					data[x]=self.lbls[x];
				} 
			}
			
			self.lbls=data;
			var data=TILE.engine.getJSON();
			var vd=self.findLabelsOnPage(data);
			
			self.LBL.loadLabels(vd);
		} else {
			// find the labels inside the non-label 
			// object
			// var data=[];
			// 			var lblids=[];
			// 			for(var prop in obj.obj){
			// 				if(($.isArray(obj.obj[prop]))&&(/labels/.test(prop))){
			// 					for(var x in obj.obj[prop]){
			// 						lblids.push(obj.obj[prop][x]);
			// 					}
			// 				}
			// 			}
			// 			// make sure all ids are present in self.lbls
			// 			for(var id in lblids){
			// 				if($.inArray(lblids[id],self.lbls)<0){
			// 					self.lbls.push(lblids[id]);
			// 				}
			// 			}
			// get JSON data for page
			var data=TILE.engine.getJSON();
			// find label objects
			var vd=self.findLabelsOnPage(data);
			// load into label interface
			self.LBL.loadLabels(vd);
		}
		
	},
	dataUpdatedHandle:function(e,obj){
		var self=e.data.obj;
		
		// get JSON data for page
		var data=TILE.engine.getJSON();
		// find label objects
		var vd=self.findLabelsOnPage(data);
		// load into label interface
		self.LBL.loadLabels(vd);
		
	},
	activeObjHandle:function(e,obj){
		var self=e.data.obj;
		
		if(obj.type!='labels'){
			$("#labelList > .labelItem").removeClass("active");
			return;
		}
		
		// deactivate labels
		$("#labelList > .labelItem").removeClass('active');
		if($("#labelList > #"+obj.id).length){
			$("#labelList > #"+obj.id).addClass("active");
		}
	},
	// finds labels referenced in engine JSON
	// returns array of active labels
	findLabelsOnPage:function(data){
		var self=this;
		var vd=[];
		// find the labels referenced on this page
		for(var p in data.pages){
			if(data.pages[p].url==TILE.url){
				// current page - find label refs
				var page=data.pages[p];
				for(var prop in page){
					// if prop is a list of items, go through them
					if((!(/url|lines|info/i.test(prop)))&&($.isArray(page[prop]))){
						for(var item in page[prop]){
							if((page[prop][item]['labels'])&&($.isArray(page[prop][item]['labels']))){
								for(var lbl in page[prop][item]['labels']){
									
									if(self.lbls[page[prop][item]['labels'][lbl]]){
										vd.push(self.lbls[page[prop][item]['labels'][lbl]]);
									}
								}
							}
						}
					}
				}
				break;
			}
		}
		return vd;
	},
	// develop a wordle to be put into the Dashboard plugin
	createWordle:function(data){
		var self=this;
		
		var idCount=[];
		for(var x in self.lbls){
			idCount[x]=1;
		}
		// data is either a page or entire JSON coredata
		if(data.pages){
			// entire session
			for(var p in data.pages){
				var page=data.pages[p];
				for(var prop in page){
					// if prop is a list of items, go through them
					if((!(/url|lines|info/i.test(prop)))&&($.isArray(page[prop]))){
						for(var item in page[prop]){
							if((page[prop][item]['labels'])&&($.isArray(page[prop][item]['labels']))){
								for(var lbl in page[prop][item]['labels']){
									// if an id of a label is referenced, put a tic into that
									// label's id count
									if(self.lbls[page[prop][item]['labels'][lbl]]){
										if(!idCount[page[prop][item]['labels'][lbl]]){
											idCount[page[prop][item]['labels'][lbl]]=1;
										}
										idCount[page[prop][item]['labels'][lbl]]++;
									}
								}
							}
						}
					}
				}
			}
		}
		// create HTML for wordle
		var html='<div class="label Wordle"><h3>TILE LABELS</h3><br/><p>';
		for(var id in idCount){
			// calculate the height for the label name
			var h=10*parseInt(idCount[id],10);
			html+='<span class="labelName" style="font-size:'+h+'px;">'+self.lbls[id].obj.name+'</span><br/>';
		}
		html+='</p></div>';
		
		// add to the dashboard
		$("body:first").trigger("displayOnDashboard",[{mode:'Labels',html:html}]);
		
	},
	_lblClickHandle:function(e,refs){
		var self=e.data.obj;
		// send reference out to tile-engine
		// $("body:first").trigger(self.activeCall,[self.id]);
		
		$(".line_selected").removeClass("line_selected");
		$("body:first").trigger("loadItems",[refs]);
		
	}
};
// register the plugin with TILE
TILE.engine.registerPlugin(LB);
