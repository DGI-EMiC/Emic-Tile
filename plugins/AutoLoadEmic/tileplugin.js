/*
* AutoLoadEmic
*
* @author Alan Stanley
* 
* Wrapper for TILE engine to automatically load
* JSON data from Fedora Repository, based on the PID from the url
*
*/
var AutoLoadEmic={
  id:"Auto1000101",
  name:'AutoLoad',
  /*
	* start()
	* @constructor
	* @params mode {Object} - Mode object passed to method
	*/
  start:function(mode){
    var PID = $.urlParam('PID');

    TILE.preLoad='http://localhost/Development/emic/getTILE/' + PID;
  }
};

// register the plugin with TILE
TILE.engine.registerPlugin(AutoLoadEmic);