
  cordova.define('cordova/plugin_list', function(require, exports, module) {
    module.exports = [
      {
          "id": "cordova-plugin-customurlscheme.LaunchMyApp",
          "file": "plugins/cordova-plugin-customurlscheme/www/android/LaunchMyApp.js",
          "pluginId": "cordova-plugin-customurlscheme",
        "clobbers": [
          "window.plugins.launchmyapp"
        ]
        }
    ];
    module.exports.metadata =
    // TOP OF METADATA
    {
      "cordova-plugin-customurlscheme": "5.0.2"
    };
    // BOTTOM OF METADATA
    });
    