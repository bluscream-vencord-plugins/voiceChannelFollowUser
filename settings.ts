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
        description: "Make sure to be in the same VC when following a user",
        restartNeeded: false,
        default: true
    },
    onlyManualTrigger: {
        type: OptionType.BOOLEAN,
        description: "Only trigger on indicator click",
        restartNeeded: false,
        default: false
    },
    followLeave: {
        type: OptionType.BOOLEAN,
        description: "Also leave when the followed user leaves",
        restartNeeded: false,
        default: false
    },
    autoMoveBack: {
        type: OptionType.BOOLEAN,
        description: "Automatically move back to the VC of the followed user when you got moved",
        restartNeeded: false,
        default: false
    },
    followUserId: {
        type: OptionType.STRING,
        description: "Followed User ID",
        restartNeeded: false,
        hidden: true,
        default: "",
    },
    channelFull: {
        type: OptionType.BOOLEAN,
        description: "Attempt to move you to the channel when is not full anymore",
        restartNeeded: false,
        default: true,
    }
});
