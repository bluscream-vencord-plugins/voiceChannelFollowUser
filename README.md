# FollowUser

Adds a follow option in the user context menu to always be in the same VC as them.

![Screenshot](./screenshot.png)

## Features

- Follow a user to automatically join the same voice channel as them
- Automatically leave when the followed user leaves (optional)
- Auto-move back if you get moved while following
- Manual trigger option for more control
- Visual indicator in the toolbar showing who you're following







## Installation 

### 🪄 Installation Wizard
The easiest way to install this plugin is to use the **[Plugin Installer Generator](https://bluscream-vencord-plugins.github.io)**. 
Simply select this plugin from the list and download your custom install script.

### 💻 Manual Installation (PowerShell)
Alternatively, you can run this snippet in your Equicord/Vencord source directory:
```powershell
$ErrorActionPreference = "Stop"
winget install -e --id Git.Git
winget install -e --id OpenJS.NodeJS
npm install -g pnpm
git clone https://github.com/Equicord/Equicord Equicord
New-Item -ItemType Directory -Force -Path "Equicord\src\userplugins" | Out-Null
git clone https://github.com/bluscream-vencord-plugins/vc-followUser.git -b "master" "Equicord\src\userplugins\vc-followUser"
cd "Equicord"
npm install -g pnpm
pnpm install --frozen-lockfile
pnpm build
pnpm buildWeb
pnpm inject
```
