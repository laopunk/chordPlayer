CHORDPLAYER.JS
===

## Installation:
You may import the code into an existing node.js project or import it directly into your HTML code
- Node module import
```shell
# local install to your project
npm install --save-dev chordPlayer
```
```javascript
// import module into your js code
var np = require('chordPlayer') 
```
- plain JS import
```html
<!-- minified version, not human friendly, 55kb-->
<script type="text/javascript" src="https://cdn.rawgit.com/laopunk/chordPlayer/master/lib/chordPlayer.min.js"></script>
<!-- uncompressed version, human friendly, 416kb -->
<script type="text/javascript" src="https://cdn.rawgit.com/laopunk/chordPlayer/master/lib/chordPlayer.js"></script>
```
The module is instanciated in the object cp, which you can use right away
```javascript
cp.buildChordPlayer("Cmin7b5").play()
```

## Constructors
There are several ways to instanciate the class:
- `buildChordPlayer(chordName,[audioContext])`

 Builds a chordPlayer from a specific name. 
 audioContext is created if not provided.
 ```javascript
 c = cp.buildChordPlayer("Cmin7b5");     //will return a chord with 4 notes ("C", "D#", "F#", "A#")
 c = cp.buildChordPlayer("Cdim");        //will return a chord with 3 notes ("C", "D#", "F#")
 c = cp.buildChordPlayer("A#maj");       //will return a chord with 3 notes ("A#", "D", "F")
 c = cp.buildChordPlayer("Bbmaj");       //will return a chord with 3 notes ("A#", "D", "F")
 ```


## Methods
- `play([callback])`

  Plays the chord
 ```javascript
 c = cp.buildChordPlayer("Amaj")
 c.play(function(){
   console.log("end play")
 })
 ```

- `getChordInfo()`

  Returns the notes present in the chord
 ```javascript
 cp.buildChordPlayer("Bbmaj").getChordInfo()
 ```

Setters: 
- `setAudioContext(audioContext)`
- `setDestinationNode(node)`
- `setDuration(duration)`
- `setOctave(octaveNb)`
- `setVolume(volume)`
