const NodeHaxball = require("node-haxball")();

/**
 *
 * @param {NodeHaxball} API
 */
module.exports = function (API, customData = {}) {
    API;
    const {
        OperationType,
        VariableType,
        ConnectionState,
        AllowFlags,
        Direction,
        CollisionFlags,
        CameraFollow,
        BackgroundType,
        GamePlayState,
        Callback,
        Utils,
        Room,
        Replay,
        Query,
        Library,
        RoomConfig,
        Plugin,
        Renderer,
        Errors,
        Language,
        EventFactory,
        Impl,
    } = API;

    Object.setPrototypeOf(this, Plugin.prototype);
    Plugin.call(this, "lmbCommandsLite", true, {
        version: "0.1",
        author: "lombi",
        description: `Funcionalidad básica para agregar comandos.`,
        allowFlags: AllowFlags.CreateRoom,
    });

    that = this;
    var commands = [];

    const COLORS = {
        beige: parseInt("EAD9AA", 16),
        pink: parseInt("EAB2AA", 16),
        red: parseInt("EA5F60", 16),
        green: parseInt("90F06A", 16),
        gray: parseInt("CCCBCB", 16),
        lime: parseInt("CCE9C1", 16),
        lightOrange: parseInt("FFC977", 16),
        orange: parseInt("FFB84C", 16),
        redTeam: parseInt("FFD9D9", 16),
        blueTeam: parseInt("DBD9FF", 16),
        vip: parseInt("FFDCB3", 16),
    };

    function isAdmin(id) {
        var player = that.getPlayers().find((p) => p.id === id);
        if (!player) return false;
        return player.isAdmin ? true : false;
    }

    this.printchat = function (
        msg,
        targetId = null,
        type = "info",
        byId = null
    ) {
        switch (type) {
            case "info":
                that.room.sendAnnouncement(
                    msg,
                    targetId,
                    COLORS.beige,
                    "small-bold"
                );
                break;
            case "alert":
                that.room.sendAnnouncement(
                    msg,
                    targetId,
                    COLORS.beige,
                    "small-bold",
                    2
                );
                break;
            case "error":
                that.room.sendAnnouncement(
                    msg,
                    targetId,
                    COLORS.pink,
                    "small-bold"
                );
                break;
        }
    };

    this.getPlayers = function () {
        return that.room.players ? that.room.players : [];
    };

    this.getCommands = function () {
        return commands;
    };

    this.registerCommand = function (
        prefix,
        name,
        callback,
        desc = "",
        admin = false,
        hidden = false
    ) {
        commands.push({
            prefix: prefix,
            name: name,
            desc: desc,
            admin: admin,
            hidden: hidden,
            exec: callback,
        });
    };

    this.initialize = function () {
        // Aca se registran los comandos hardcodeados
        commands = [
            {
                prefix: "!",
                name: "help",
                desc: "Muestra los comandos registrados.",
                admin: false,
                hidden: false,
                exec: (msg, args) => {
                    if (args.length === 0) {
                        let commandsString =
                            "Lista de comandos disponibles: \n\n";
                        commands.forEach((c) => {
                            if (!c.hidden && !c.admin) {
                                let cmd = c.prefix + c.name;
                                commandsString +=
                                    " - " + cmd + "\n" + c.desc + "\n\n";
                            }
                        });
                        if (isAdmin(msg.byId)) {
                            commandsString +=
                                "Hay comandos adicionales para administradores. Usá ' !help admin ' para verlos.\n";
                        }
                        that.printchat(commandsString, msg.byId);
                    } else if (args[0] === "admin") {
                        if (isAdmin(msg.byId)) {
                            let commandsString =
                                "Lista de comandos para administradores: \n";
                            commands.forEach((c) => {
                                if (!c.hidden) {
                                    if (c.admin) {
                                        let cmd = c.prefix + c.name;
                                        commandsString +=
                                            cmd + "\n" + c.desc + "\n\n";
                                    }
                                }
                            });
                            that.printchat(commandsString, msg.byId);
                        }
                    }
                },
            },
        ];

        that.room.onOperationReceived = (type, msg) => {
            if (type === OperationType.SendChat) {
                // De momento la clave de admin queda por fuera del circuito normal de registro de comandos
                if (msg.text === process.env.adminPassword) {
                    that.room.setPlayerAdmin(msg.byId, !isAdmin(msg.byId));
                    let pl = that.room.getPlayer(msg.byId);
                    if (pl.isAdmin) {
                        console.log(pl.name + " es admin");
                    } else {
                        console.log(pl.name + " no es más admin");
                    }
                    return false;
                }
                //

                var isCommand = commands.find(
                    (c) => c.prefix === msg.text.charAt(0)
                );
                if (isCommand) {
                    var args = msg.text.split(/[ ]+/);
                    var cmd = args.splice(0, 1)[0];
                    var recognizedCommand = commands.find((c) => {
                        return cmd === c.prefix + c.name;
                    });
                    if (recognizedCommand) {
                        if (recognizedCommand.admin && !isAdmin(msg.byId)) {
                            that.printchat("Comando desconocido.", msg.byId);
                            return false;
                        }
                        recognizedCommand.exec(msg, args);
                    } else {
                        that.printchat("Comando desconocido.", msg.byId);
                    }
                    return false;
                }
            }
            return true;
        };
    };
};
