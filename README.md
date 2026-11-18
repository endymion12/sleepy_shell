# Sleepy Shell
Sleepy Shell: An Android-inspired touch-friendly shell designed for maximum focus. Made with AGS v3 / Astal

**This is my personal setup designed for my own usecase only. There is no settings or config file, and many standard shell features are missing. Sections of the code may not be portable beyond the specifics of my own devices and software. Use at own risk.**

## Screenshots
The widgets adapt to the active GTK theme - screenshots are taken with Materia Dark Compact and Breeze Dark (last screenshot).

<img width="1920" height="1200" alt="20261118_22h29m06s_grim" src="https://github.com/user-attachments/assets/b7b593c1-6158-4f31-96d3-118ee71deec3" />
<img width="1920" height="1200" alt="20261118_22h29m10s_grim" src="https://github.com/user-attachments/assets/a4b18b9a-3729-4b64-9f64-a151f23c95d1" />
<img width="1920" height="1200" alt="20261118_22h31m48s_grim" src="https://github.com/user-attachments/assets/bdd0c638-5cec-4c61-84de-d3d7406d628c" />
<img width="1920" height="1200" alt="20261118_22h35m33s_grim" src="https://github.com/user-attachments/assets/8a942e1e-357a-4c47-b6d8-b5bc4f2ab6c3" />

## Design Principles
I created this shell because I wanted something that would prompt me to choose one task and focus on that, rather than making it easy to switch tasks frequently. I took inspiration from the Android UI because I rarely find myself multitasking on my Android phone. Hence the desktop with the app drawer, and no overlaid app runner. 

I also wanted to optimise the experience for my 2-in-1 14" laptop. One of the issues I had with desktop environments is the insistence that I must have a dock or taskbar. I found that, since I didn't want to be switching tasks often, they just took up valuable screen real estate. Again, I looked to phones with their narrow status bar at the top of the screen, and have decided to implement that as a top bar, with other controls appearing as popups as needed. Furthermore, everything should be touch-friendly. Hence, the app drawer has both a search function, which I almost exclusively use when using the keyboard, and large icons, for use in tablet mode. Additionally, I have an Android-inspired navigation bar which I have configured lisgd to reveal on swipe up. 

## Components
* Clock desktop widget
* App drawer
* Top bar
    * Wifi applet
        * See active network at a glance
        * Toggle wifi on and off
        * Connect to access points using network-manager
    * Battery applet
        * See battery percentage + charging at a glance
        * Click to see time remaining
        * Select power plan
    * Clock
    * Musical Instrument Tuner
        * Change the pitch of A4 in a dropdown
        * Very basic support for .scl scales
    * Take screenshot
    * Record screen
    * Power button menu
        * Lock
        * Sleep
        * Logout
        * Power off
        * Restart
     
## Installation
### Dependencies
* AGS v3
* Astal
    * AstalApps
    * AstalBattery
    * AstalNetwork
    * AstalPowerProfiles
    * AstalRiver
* network-manager-cli to connect to access points
* arecord and aubio-pitch for the tuner
* grim and wf-recorder for screenshots and screen recording respectively

### Steps to install
* Clone the repository to `$HOME/.config/ags`
* Run with `ags run`

### External programs that will need to be removed from code to use without:
* app drawer currently launches apps using UWSM (easy enough to change to use `AstalApps.App.launch()` )
* Lock command in power menu launches `nwg-hello`

### Other modifications
* I use lisgd to launch my navbar
* My `status_colour_listener.sh` script listens to sway IPC to change the colour of the top bar as the focus moves

