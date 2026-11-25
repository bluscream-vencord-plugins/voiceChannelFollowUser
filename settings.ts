/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { OptionType } from "@utils/types";

export const settings = definePluginSettings({
    executeOnFollow: {
        type: OptionType.BOOLEAN,
        description: "Join the user's voice channel right away when you start following them.",
        default: true
    },
    onlyManualTrigger: {
        type: OptionType.BOOLEAN,
        description: "Only follow when you click the indicator in the channel toolbar.",
        default: false
    },
    followLeave: {
        type: OptionType.BOOLEAN,
        description: "Leave voice when the followed user leaves the channel you share with them.",
        default: false
    },
    autoMoveBack: {
        type: OptionType.BOOLEAN,
        description: "Move back to the followed user when someone else moves you to another channel.",
        default: false
    },
    channelFull: {
        type: OptionType.BOOLEAN,
        description: "Join the followed user's channel as soon as a slot frees up.",
        default: true
    },
    joinFromIdle: {
        type: OptionType.BOOLEAN,
        description: "Also follow while you're not in voice. When off, leaving voice yourself stops automatic joins until you join a channel again.",
        default: false
    },
    followIntoCalls: {
        type: OptionType.BOOLEAN,
        description: "Also follow into DM and group DM calls.",
        default: false
    },
    followUserId: {
        type: OptionType.STRING,
        description: "The user you're following this session.",
        hidden: true,
        default: ""
    }
});
