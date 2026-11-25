/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { NavContextMenuPatchCallback } from "@api/ContextMenu";
import { ChannelToolbarButton } from "@api/HeaderBar";
import ErrorBoundary from "@components/ErrorBoundary";
import definePlugin from "@utils/types";
import type { Channel, User } from "@vencord/discord-types";
import {
    AuthenticationStore,
    ChannelActions,
    ChannelStore,
    lodash,
    Menu,
    PermissionsBits,
    PermissionStore,
    SelectedChannelStore,
    showToast,
    UserStore,
    VoiceStateStore
} from "@webpack/common";
import type { SVGProps } from "react";

import { pluginInfo } from "./info";
import { settings } from "./settings";
export { pluginInfo };

const PATTERNS = {
    /** Id of the item added to the user context menu. */
    menuItemId: "vc-follow-user",
    /** Wait for the followed user to settle before joining, so channel hopping sends one join. */
    followDebounceMs: 750,
    /** At most one automatic move back per this many milliseconds. */
    moveBackCooldownMs: 5000
};

interface OwnVoiceState {
    userId: string;
    sessionId?: string;
    channelId?: string | null;
    oldChannelId?: string | null;
}

interface UserContextProps {
    channel: Channel;
    guildId?: string;
    user: User;
}

let lastSelectedChannelId: string | null = null;
let ownChannelId: string | null = null;
let lastMoveBack = 0;

function FollowIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg role="img" width={24} height={24} viewBox="0 -960 960 960" {...props}>
            <path fill="currentColor" d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Zm0-108q96-86 158-147.5t98-107q36-45.5 50-81t14-70.5q0-60-40-100t-100-40q-47 0-87 26.5T518-680h-76q-15-41-55-67.5T300-774q-60 0-100 40t-40 100q0 35 14 70.5t50 81q36 45.5 98 107T480-228Zm0-273Z" />
        </svg>
    );
}

function UnfollowIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg role="img" width={24} height={24} viewBox="0 -960 960 960" {...props}>
            <path fill="currentColor" d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Z" />
        </svg>
    );
}

function followedChannelId() {
    const { followUserId } = settings.store;
    return followUserId ? VoiceStateStore.getVoiceStateForUser(followUserId)?.channelId ?? null : null;
}

function isFull(channel: Channel) {
    const count = Object.keys(VoiceStateStore.getVoiceStatesForChannel(channel.id)).length;
    return channel.userLimit > 0 && count >= channel.userLimit && !PermissionStore.can(PermissionsBits.MOVE_MEMBERS, channel);
}

function followInto(channelId: string, manual: boolean) {
    const channel = ChannelStore.getChannel(channelId);
    if (!channel) return;
    const fail = (text: string) => manual && showToast({ text, variant: "critical" });

    if (channelId === SelectedChannelStore.getVoiceChannelId()) return fail("You're already in the same channel.");
    if (channel.isPrivate()) {
        if (!settings.store.followIntoCalls) return fail("Following into DM calls is turned off.");
    } else if (!PermissionStore.can(PermissionsBits.VIEW_CHANNEL | PermissionsBits.CONNECT, channel)) {
        return fail("You don't have permission to join that voice channel.");
    }
    if (isFull(channel)) return fail("That voice channel is full.");

    ChannelActions.selectVoiceChannel(channelId);
}

function canAutoFollow() {
    const { followUserId, onlyManualTrigger, joinFromIdle } = settings.store;
    return !!followUserId && !onlyManualTrigger && (!!SelectedChannelStore.getVoiceChannelId() || joinFromIdle);
}

const scheduleFollow = lodash.debounce(() => {
    const channelId = followedChannelId();
    if (channelId && canAutoFollow()) followInto(channelId, false);
}, PATTERNS.followDebounceMs);

function triggerFollow() {
    const channelId = followedChannelId();
    if (channelId) followInto(channelId, true);
    else showToast({ text: "The followed user isn't in a voice channel.", variant: "critical" });
}

function unfollow() {
    scheduleFollow.cancel();
    settings.store.followUserId = "";
}

function toggleFollow(userId: string) {
    if (settings.store.followUserId === userId) return unfollow();
    settings.store.followUserId = userId;
    if (settings.store.executeOnFollow) triggerFollow();
}

const UserContext: NavContextMenuPatchCallback = (children, { user }: UserContextProps) => {
    if (!user || user.id === UserStore.getCurrentUser().id) return;
    const isFollowed = settings.store.followUserId === user.id;

    children.splice(-1, 0, (
        <Menu.MenuGroup>
            <Menu.MenuItem
                id={PATTERNS.menuItemId}
                label={isFollowed ? "Unfollow User" : "Follow User"}
                action={() => toggleFollow(user.id)}
                icon={isFollowed ? UnfollowIcon : FollowIcon}
            />
        </Menu.MenuGroup>
    ));
};

const FollowIndicator = ErrorBoundary.wrap(() => {
    const { followUserId } = settings.use(["followUserId"]);
    if (!followUserId) return null;
    const name = UserStore.getUser(followUserId)?.username ?? followUserId;
    return (
        <ChannelToolbarButton
            icon={UnfollowIcon}
            tooltip={`Following ${name}. Click to join them, right-click to unfollow.`}
            onClick={triggerFollow}
            onContextMenu={unfollow}
        />
    );
}, { noop: true });

function onOwnState(channelId: string | null) {
    const previous = ownChannelId;
    ownChannelId = channelId;
    if (!channelId || !previous || channelId === previous) return;

    const movedByOthers = channelId !== lastSelectedChannelId;
    lastSelectedChannelId = channelId;
    if (!settings.store.autoMoveBack || !movedByOthers || !canAutoFollow()) return;
    if (Date.now() - lastMoveBack < PATTERNS.moveBackCooldownMs) return;
    lastMoveBack = Date.now();
    scheduleFollow();
}

function onFollowedState(channelId: string | null, oldChannelId: string | null) {
    if (channelId) {
        if (canAutoFollow()) scheduleFollow();
        return;
    }
    scheduleFollow.cancel();
    const mine = SelectedChannelStore.getVoiceChannelId();
    if (settings.store.followLeave && !settings.store.onlyManualTrigger && oldChannelId && mine === oldChannelId) {
        ChannelActions.disconnect();
    }
}

function onOtherLeft(oldChannelId: string) {
    const { followUserId } = settings.store;
    if (!settings.store.channelFull || oldChannelId === SelectedChannelStore.getVoiceChannelId()) return;
    if (!VoiceStateStore.getVoiceStatesForChannel(oldChannelId)[followUserId]) return;
    if (canAutoFollow()) scheduleFollow();
}

function reset() {
    scheduleFollow.cancel();
    settings.store.followUserId = "";
    lastSelectedChannelId = ownChannelId = null;
    lastMoveBack = 0;
}

export default definePlugin({
    name: pluginInfo.name,
    description: pluginInfo.description,
    authors: pluginInfo.authors,
    settings,

    contextMenus: {
        "user-context": UserContext
    },

    headerBarButton: {
        icon: UnfollowIcon,
        location: "channeltoolbar",
        render: () => <FollowIndicator />
    },

    start() {
        reset();
        ownChannelId = lastSelectedChannelId = SelectedChannelStore.getVoiceChannelId() ?? null;
    },

    stop: reset,

    flux: {
        VOICE_CHANNEL_SELECT({ channelId }: { channelId: string | null; }) {
            lastSelectedChannelId = channelId;
        },

        VOICE_STATE_UPDATES({ voiceStates }: { voiceStates: OwnVoiceState[]; }) {
            const { followUserId } = settings.store;
            if (!followUserId) return;
            const me = UserStore.getCurrentUser()?.id;
            if (followUserId === me) return unfollow();
            const sessionId = AuthenticationStore.getSessionId();

            for (const { userId, sessionId: stateSession, channelId = null, oldChannelId = null } of voiceStates) {
                if (userId === me) {
                    if (stateSession === sessionId) onOwnState(channelId);
                } else if (userId === followUserId) {
                    if (channelId !== oldChannelId) onFollowedState(channelId, oldChannelId);
                } else if (!channelId && oldChannelId) {
                    onOtherLeft(oldChannelId);
                }
            }
        },

        LOGOUT: reset
    }
});
