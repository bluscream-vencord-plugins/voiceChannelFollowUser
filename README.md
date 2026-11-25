# VoiceChannelFollowUser

Equicord user plugin: adds "Follow User" to the user context menu, so you end up in the same voice channel as them.

![Screenshot](./screenshot.png)

## How it behaves

- Following lasts for this session only. It's cleared when the plugin stops, Discord restarts or you log out.
- While you follow someone, an indicator in the channel toolbar shows who. Click it to join them, right-click it to unfollow.
- Only this Discord window counts. Your other devices joining or leaving voice don't trigger anything.
- Leaving voice yourself is never blocked or delayed. By default it also stops automatic joins until you join a channel again.
- When the followed user hops channels quickly, you join once, after they settle.

## Settings

| Setting | Default | Meaning |
| --- | --- | --- |
| Join right away | on | Join their channel as soon as you start following. |
| Only manual | off | Only follow when you click the toolbar indicator. |
| Follow leave | off | Leave voice when they leave the channel you share. |
| Move back | off | Move back to them when someone else moves you, at most once every 5 seconds. |
| Channel full | on | Join their channel as soon as a slot frees up. |
| Join from idle | off | Also follow while you're not in voice. |
| Follow into calls | off | Also follow into DM and group DM calls. |

## Install

```sh
cd src/userplugins
git clone https://github.com/bluscream-vencord-plugins/voiceChannelFollowUser
```

Rebuild Equicord and enable VoiceChannelFollowUser. Update with `git pull`.
