<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>TILE: Text-Image Linking Environment</title>

    <link rel="stylesheet" href="skins/default/css/floatingDiv.css" type="text/css" media="screen, projection" charset="utf-8">
      <link rel="stylesheet" href="skins/default/css/style.css" type="text/css" media="screen, projection" charset="utf-8">
        <link rel="stylesheet" href="skins/default/css/dialog.css" type="text/css" media="screen, projection" charset="utf-8">
          <link rel="stylesheet" href="lib/jquery/jquery-ui-1.8.5.custom/css/ui-lightness/jquery-ui-1.8.5.custom.css" type="text/css" media="screen, projection" charset="utf-8">
            <link rel="stylesheet" href="skins/default/css/autorec.css" type="text/css" media="screen, projection" charset="utf-8">
              <link rel="stylesheet" href="lib/jquery/plugins/colorpicker/css/colorpicker.css" type="text/css" />
              <link rel="shortcut icon" href="skins/default/images/favicon.ico" />

              <script type="text/javascript" language="javascript" src="lib/jquery/jquery-1.6.2.min.js"></script>
              <script type="text/javascript" language="javascript" src="lib/jquery/jquery-ui-1.8.5.custom/js/jquery-ui-1.8.5.custom.min.js"></script>
              <script type="text/javascript" language="javascript" src="lib/jquery/jquery-ui-1.8.5.custom/development-bundle/ui/jquery.ui.mouse.js"></script>
              <script type="text/javascript" language="javascript" src="lib/islandora/startup.js"></script>
              <script type="text/javascript" language="javascript" src="lib/jquery/plugins/DataTables-1.7.6/media/js/jquery.dataTables.min.js"></script>
              <script type="text/javascript" language="javascript" src="lib/jquery/plugins/jgcharts/jgcharts.pack.js"></script>
              <script src="lib/jquery/plugins/jquery.pngFix.pack.js" type="text/javascript"></script>
              <script type="text/javascript" src="lib/jquery/jquery.xmlns.js"></script>
              <script src="lib/jquery/plugins/raphael-min.js" type="text/javascript" charset="utf-8"></script>
              <script type="text/javascript" language="javascript" src="lib/rangy/plugins/rangy.googleCode/rangy.js"></script>
              <script type="text/javascript" src="lib/jquery/plugins/underscore.js"></script>
              <script type="text/javascript" src="lib/VectorDrawer_1.0/VectorDrawer.js"></script>
              <script type="text/javascript" src="tile.js"></script>


              <script type="text/javascript" src="lib/jquery/plugins/colorpicker/js/colorpicker.js"></script>
              <script type="text/javascript" src="lib/jquery/plugins/colorpicker/js/eye.js"></script>
              <script type="text/javascript" src="lib/jquery/plugins/colorpicker/js/utils.js"></script>
              <script type="text/javascript" src="lib/rangy/getPath.js"></script>
              <script type="text/javascript" src="plugins/CoreData/uploadplugin/jquery.form.js"></script>
              <script type="text/javascript" src="plugins/CoreData/exportJSONXML.js"></script>
              </head>
              <body>
                <script type ="text/javascript">
                  PID = "<?php echo $_POST['PID']; ?>";             
                </script>
                <div class="az header"><div class="az logo"></div>
                  <div id="azglobalmenu" class="az globalmenu">
                    <div class="globalbuttons">
                      <div class="modeitems"></div>
                      <div class="dataitems"></div>
                
                    </div>
                  </div>
                </div>

                <!-- Submit Form for saving progress-->
                <form id="inv_SaveProgress_Form" class="submitFormHidden" method="POST" action="">
                  <input id="uploadData" name="uploadData" class="submitFormHidden" type="text"/>
                  <input id="uploadData2" name="extraData" class="submitFormHidden" type="text"/>
                  <input id="uploadFileName" name="uploadFileName" class="submitFormHidden" type="text" />
                </form>

                <!-- Hidden iframe that handles the LoadDialog's Local File submits -->
                <iframe id="import_iframe" name="import_iframe" src="plugins/CoreData/importDataScript.php" style="visibility:hidden"></iframe>
                <!-- Main area -->
                <div class="az main twocol">
                  <div id="az_log" class="az log"></div>
                  <div id="az_activeBox" class="az activeBox"></div>
                  <div id="azcontentarea" class="az content"></div>
                  <script type="text/javascript">
                    doc = $('document');
                    var engine=null;

                    // set verbose mode either true (on) or false (off)
                    __v=false;
                    

                    $(function(){

                      // Initialize Core Functions and Objects:
                      engine=new TILE_ENGINE({});
                     

                      // Image Annotation Mode
                      //engine.insertMode('Image Annotation');
                      // Auto Line Recognizer Mode
                      //engine.insertMode('Auto Line Recognizer');

                      // Image Tagger Plugin
                      engine.insertModePlugin('Image Annotation','ImageTagger');

                      // Transcript Lines Plugin
                      engine.insertModePlugin('Image Annotation','Transcript');
                      // Text Selection Plugin
                      engine.insertModePlugin('Image Annotation','TextSelection');
                      // Labels Plugin
                      engine.insertModePlugin('Image Annotation','Labels');
                      // Auto recognizer
                      //engine.insertModePlugin('Auto Line Recognizer','AutoLineRecognizer');
                      // CoreData plugin

                      // CoreData Plugin
                      engine.insertPlugin('CoreData');
                      // AutoLoad Plugin
                      engine.insertPlugin('AutoLoadEmic');

                      // Welcome Dialog Plugin (not loaded by default)
                      // engine.insertPlugin('WelcomeDialog');
                      // Activate Image Annotation Mode By Default
                      engine.activate('Image Annotation');
                    });
                  </script>

              </body>
              </html>