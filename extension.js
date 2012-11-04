/* -*- mode: js; js-basic-offset: 4; indent-tabs-mode: nil -*- */

const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const SCHEMA = 'org.gnome.desktop.session';
const KEY = 'idle-delay';
const EnabledIcon = 'preferences-desktop-screensaver-symbolic';
const DisabledIcon = 'action-unavailable-symbolic';

let text, button, _lastval, _settings;

function _hideMsg() {
    if (text != null)
        Main.uiGroup.remove_actor(text);
    text = null;
}

function _showMsg(msg) {
    _hideMsg();
    if (!text) {
        text = new St.Label({ style_class: 'helloworld-label', text: msg });
        Main.uiGroup.add_actor(text);
    }

    text.opacity = 255;

    let monitor = Main.layoutManager.primaryMonitor;

    text.set_position(Math.floor(monitor.width / 2 - text.width / 2),
                      Math.floor(monitor.height / 2 - text.height / 2));

    Tweener.addTween(text,
                     { opacity: 0,
                       time: 2,
                       transition: 'easeOutQuad',
                       onComplete: _hideMsg });
}

function _toggle() {
	let cur = _settings.get_uint(KEY);
    if (cur == 0 || cur == undefined) {
        if (_lastval == 0 || _lastval == undefined)
            _lastval = 600;
        _showMsg("Set idle to " + _lastval);
        _settings.set_uint(KEY, _lastval);
        button.get_child(0).icon_name = EnabledIcon;
    }
    else {
        _lastval = cur;
        _showMsg("Disable idle ");
        _settings.set_uint(KEY, 0);
        button.get_child(0).icon_name = DisabledIcon;
    }
}

function init() {
    _settings = Convenience.getSettings(SCHEMA);

    button = new St.Bin({ style_class: 'panel-button',
                          reactive: true,
                          can_focus: true,
                          x_fill: true,
                          y_fill: false,
                          track_hover: true });
    let iname = EnabledIcon;
    if (_settings.get_uint(KEY) == 0)
        iname = DisabledIcon;

    let icon = new St.Icon({ icon_name: iname, style_class: 'system-status-icon' });

    button.set_child(icon);
    button.connect('button-press-event', _toggle);
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
    Main.panel._rightBox.remove_child(button);
}
