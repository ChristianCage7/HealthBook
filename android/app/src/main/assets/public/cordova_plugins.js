
  cordova.define('cordova/plugin_list', function(require, exports, module) {
    module.exports = [
      {
          "id": "cordova-plugin-navigationbar-color.navigationbar",
          "file": "plugins/cordova-plugin-navigationbar-color/www/navigationbar.js",
          "pluginId": "cordova-plugin-navigationbar-color",
        "clobbers": [
          "window.NavigationBar"
        ]
        },
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
      "cordova-plugin-customurlscheme": "5.0.2",
      "cordova-plugin-navigationbar-color": "0.0.8"
    };
    // BOTTOM OF METADATA
    });
    