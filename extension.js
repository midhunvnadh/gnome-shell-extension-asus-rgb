import St from "gi://St";
import GObject from "gi://GObject";
import Gio from "gi://Gio";

import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

import colors from "./colors.js";
import brightnessOptions from "./brightnessOptions.js";
import rgbOptions from "./rgbOptions.js";

import GLib from "gi://GLib";

const Indicator = GObject.registerClass(
  class Indicator extends PanelMenu.Button {
    _init() {
      const IconPath = GLib.Uri.resolve_relative(
        import.meta.url,
        "icon.svg",
        GLib.UriFlags.NONE
      );
      console.log("Icon Path: ", IconPath);
      super._init(0.0, _("My Indicator"));

      let icon = new St.Icon({
        gicon: Gio.icon_new_for_string(IconPath),
        style_class: "system-status-icon",
      });

      this.add_child(icon);

      // Create submenus and menus

      const brightnessControl = new PopupMenu.PopupSubMenuMenuItem(
        "Keyboard Brightness"
      );

      const colorControl = new PopupMenu.PopupSubMenuMenuItem("Keyboard Color");

      const RBGControl = new PopupMenu.PopupSubMenuMenuItem("RGB Mode");

      brightnessOptions.forEach(({ label, cmd }) => {
        const option = new PopupMenu.PopupMenuItem(label);
        option.connect("activate", () => {
          this._setBrightness(cmd);
        });
        brightnessControl.menu.addMenuItem(option);
      });

      colors.forEach(({ label, color }) => {
        const option = new PopupMenu.PopupMenuItem(label);
        option.connect("activate", () => {
          this._setColor(color);
        });
        colorControl.menu.addMenuItem(option);
      });

      rgbOptions.forEach(({ name, cmd }) => {
        const option = new PopupMenu.PopupMenuItem(name, {
          reactive: true,
          can_focus: true,
          style_class: "menu-item",
        });

        option.connect("activate", () => {
          this._setRGBMode(cmd);
        });
        RBGControl.menu.addMenuItem(option);
      });

      this.menu.addMenuItem(brightnessControl);
      this.menu.addMenuItem(RBGControl);
      this.menu.addMenuItem(colorControl);
    }

    _setColor(color) {
      GLib.spawn_command_line_async(`asusctl led-mode static -c ${color}`);
    }

    _setRGBMode(mode) {
      GLib.spawn_command_line_async(`asusctl led-mode ${mode}`);
    }

    _setBrightness(value) {
      GLib.spawn_command_line_async(`asusctl -k ${value}`);
    }
  }
);

export default class IndicatorExampleExtension extends Extension {
  enable() {
    this._indicator = new Indicator();
    Main.panel.addToStatusArea(this.uuid, this._indicator);
  }

  disable() {
    this._indicator.destroy();
    this._indicator = null;
  }
}
