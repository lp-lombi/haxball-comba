const API = require("node-haxball")();
const Comba = require("./plugins/lmbComba");
const Commands = require("./plugins/lmbCommandsLite");
require("dotenv").config();

API.Utils.getGeo()
    .then((geo) => {
        const createParams = {
            name: process.env.roomName,
            password: process.env.roomPassword,
            showInRoomList: true,
            geo: geo,
            maxPlayerCount: process.env.maxPlayers,
            token: process.env.token,
        };

        // ROOM
        var client = API.Room.create(createParams, {
            plugins: [new Commands(API), new Comba(API)],
            storage: {
                player_name: process.env.botName,
            },
            onSuccess: (room) => {
                r = room;
                room.getPlayer();
                console.log("\nPlugins activos: ");
                room.plugins.forEach((p) => {
                    console.log(" - " + p.name);
                });
                console.log("");

                room.onAfterRoomLink = (roomLink) => {
                    console.log("Link de la sala:", roomLink);
                };
            },
        });

        client.room;

        client.onRequestRecaptcha = () => {
            console.log(
                "### EL TOKEN EXPIRÓ. CAMBIALO EN .env Y REINICIÁ EL SERVIDOR ###"
            );
        };
    })
    .catch((err) => {
        console.log(err);
    });
