# rhythmeet-streamOverlay
The main repository for the overlay of o!MY @ Rhythmeet 2024, meant to be ran on tosu.

## Examples of projected scenes
### Starting Soon
![alt text](_setup/image.png)

All text are manually adjusted, including the Coming Up Text, and timeslot.

### Player Intro
![alt text](_setup/image-1.png)

### Mappool Scene
![alt text](_setup/image-3.png)

### Match Scene
![alt text](_setup/image-4.png)

Client backgrounds can be found in `_shared_assets/client`. Just drag each bg respectively into each client

### Winner Scene
![alt text](_setup/image-5.png)

To switch to the next scene, you need to click the `ACTIVATE FINAL SCORE` button by interacting with the `Winner Overlay` Element in OBS

![alt text](_setup/image-6.png)

![alt text](_setup/image-7.png)

## NOTE FOR MODE SWITCHING
As there are different calculations in SR for different modes, you need to adjust your `osu!.[username].cfg` file to show that your last gamemode is the current division you are streaming.

Find the `LastPlayMode = ` row in your .cfg file and set it one of the following:
- `LastPlayMode = Standard`
- `LastPlayMode = CatchTheBeat`
- `LastPlayMode = Mania`
- `LastPlayMode = Taiko`

Make sure that your tournament client isn't open at this time and upon saving the .cfg file relaunch it to see if the star rating is calculating properly. 

To show the appropriate stats in the `MATCH` scene, you can interact with the `Match Overlay` element in OBS to switch between the modes. Additionally you can find which player is on which client at that current moment.

![alt text](_setup/image-8.png)