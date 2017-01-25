//JS modules
var _ = require('lodash')
    , np = require('noteplayer')
    , parser = require('note-parser')
;

window.p = parser;

/**
* @author David B - laopunk 
* @class chordPlayer
* @classdesc A musical chord that can be played in a browser. Plays for however long it has been defined to.
* @param {string} chordName                 - name of the chord, i.e "Cmin7b5"
* @param {Object} [audioContext]            - WebAudio audioContext
* @example cp = new chordPlayer("Cmaj7")
* @property {number}  octave                - musical octave of the note forming the chord [1-8]
* @property {string}  name                  - Full name of the chord
* @property {number}  duration              - length of time the sound has to be played, in seconds
* @property {number}  volume                - volume [0-1]
* @property {Array}  notes                  - Array of notePlayer instances, these are the notes composing the chord
* @property {Bool}  isPlaying               - true if the sound is being played
* @property {Boolean}  verbose              - verbose mode (true/false)
* @property {Object} [audioContext]         - WebAudio audioContext. Created if not provided
* @property {Object} destinationNode        - WebAudio destinationNode
*/
function chordPlayer(chordName,audioContext){
    try{
        if ( chordName === void 0){
            throw "chordName not specified"
        }
        //properties
        this.octave = 4;
        this.name = chordName
        this.duration = _.random(0.5,3,true)
        this.volume = .5;
        this.notes = []
        this.isPlaying = false
        this.verbose = false

        //audio API
        this.audioContext = (audioContext === void 0) ? new (window.AudioContext || window.webkitAudioContext)() : audioContext;
        this.destinationNode = this.audioContext.destination
    }catch(err){
        console.error("CHORDPLAYER ERROR: "+err)
        console.warn("USAGE: new chordPlayer(chordName,[audioContext])")
        return null
    }
}

/**
 * @function buildChordPlayer
 * @description builds a chordPlayer from a specific chordName
 * @example buildChordPlayer("Cmin7b5")
 * @param {string} chordName                 - name of the chord, i.e "Cmin7b5"
 * @param {Object} [audioContext]            - The audioContext to render the sound. Created if not provided
 */
chordPlayer.buildChordPlayer = function(chordName,audioContext){
    try{
        if ( chordName === void 0 ){
            throw "chordName not specified"
        }
        if ( chordName.length <= 1 ){
            throw "invalid chordName"
        }
        return new chordPlayer(chordName,audioContext);
    }catch(err){
        console.error("CHORDPLAYER ERROR: "+err)
        console.warn("USAGE: chordPlayer.buildChordPlayer(chordName,[audioContext])")
        return null
    }
}

/**
 * @function play
 * @description plays the chord
 * @example play(function(){console.log("end play")})
 * @param {Function} [callback]         - callback function
 */
chordPlayer.prototype.play = function(callback) {
    if(this.verbose){
        console.log("Chord will play for a duration of "+this.duration)
    }

    //build gain
    this.gainNode = this.audioContext.createGain()
    this.gainNode.gain.value = this.volume

    //build notes
    t_cp = this
    this.notes = _(t_cp.getChordInfo()).map(function(noteName){
        n = np.buildFromName(noteName, t_cp.audioContext)
        n.setDestinationNode(t_cp.gainNode) 
        n.setDuration(t_cp.duration)
        n.setVerbose(t_cp.verbose)
        return n
    })
    .value()

    //connect to destination
    this.gainNode.connect(this.destinationNode)

    //play notes
    this.isPlaying = true
    this.notes.forEach(function(e){
        e.play(function(){
            //callback launch, synchronised with isPlaying, since this piece is run by all notes in the chord 
            if(t_cp.isPlaying){
                if(t_cp.verbose){console.log("Chord has finished playing")}
                t_cp.isPlaying = false
                if( callback ) { callback() }
            }
        })
    })

};


/**
 * @function getChordInfo
 * @description returns the notes present in the chord
 */
chordPlayer.prototype.getChordInfo = function() {
    const t_cp = this;
    
    //note should be Ab, C#, D
    function normalizeNote(note){
        if(note.length === 2 && note.slice(-1) === 'b'){
            const translations = {
                "Cb": "B",
                "Db": "C#",
                "Eb": "D#",
                "Fb": "E",
                "Gb": "F#",
                "Ab": "G#",
                "Bb": "A#"
            };
            return translations[note];
        }
        if(note === 'E#'){
            return 'F';
        }
        if(note === 'B#'){
            return 'C';
        }
        return note;
    };

    const DICT_KEYS = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]

    const DICT_INTERVALS = {
          "maj": [0,4,7]
        , "min": [0,3,7]
        , "min7b5": [0,3,6,10]
        , "dim": [0,3,6]
        , "aug": [0,4,8]
        , "maj7": [0,4,7,11]
        , "min7": [0,3,7,10]
        , "7": [0,4,7,10]
        , "minmaj7": [0,3,7,11]
        , "maj7#5": [0,4,8,11]
        , "dim7": [0,3,6,9]
    }
    try{
        if(Array.isArray(this.name)){
            
            // commented with example: ['Ab4', 'C', 'E'];
            // note that order matters! ['A', 'C'] is different than ['C', 'A']! (assuming the default octave is 4, the C will be a C5 in the first case)
            const noteArray = this.name;    

            //e.g. 'Ab4' -> ['Ab4', 'Ab', '4'];
            const REGEX_NOTE = /^([A-G][#,b]?)(.*$)/;  
            const noteNames = [];
            let lastNoteIndex;
            let lastOctave;
            for(let i = 0; i < noteArray.length; i++){
    
                const matches = REGEX_NOTE.exec(noteArray[i]);
                if(matches.length !== 3){
                    console.log(`error parsing note name: ${noteArray[0]} -> ${matches}`);
                    return;
                }   

                const note = normalizeNote(matches[1]);
                const noteIndex = DICT_KEYS.indexOf(note);
                let noteOctave = matches[2];
                if(!noteOctave || noteOctave === ''){
                    if(i === 0){
                        noteOctave = t_cp.octave;
                    }
                    else {
                        noteOctave = lastOctave;
                        if(noteIndex < lastNoteIndex){
                            noteOctave++;                            
                        }
                    }
                }

                noteNames.push(note + noteOctave);

                lastNoteIndex = noteIndex;
                lastOctave = noteOctave;
            }

            //returns [ 'Ab4', 'C5', 'E5']
            return noteNames;

        }else{
            // commented with example: Abmaj7

            //e.g. Abmaj7 -> ['Abmaj7', 'Ab', 'maj7'];
            const REGEX_CHORD = /^([A-G][#,b]?)(.*$)/;  

            const matches = REGEX_CHORD.exec(this.name);
            if(matches.length !== 3){
                console.log(`error parsing chord name: ${this.name} -> ${matches}`);
                return;
            }   
            //e.g. G#
            const rootNote = normalizeNote( matches[1] );
            const rootIndex = DICT_KEYS.indexOf(rootNote);
            const rootOctave = t_cp.octave;

            // e.g. maj7
            const chordBody = matches[2];
            const intervals = DICT_INTERVALS[chordBody];

            const noteNames = [];
            for(let i = 0; i < intervals.length; i++){
                
                let noteIndex = rootIndex + intervals[i];
                let noteOctave = rootOctave;

                if(noteIndex >= DICT_KEYS.length){
                    noteIndex -= 12;
                    noteOctave++;
                }
                const name = DICT_KEYS[noteIndex];
                noteNames.push(name + noteOctave);
            }

            // returns [G#4, C5, D#5, G5]
            return noteNames;
        }
    }catch(err){
        console.error("CHORDPLAYER ERROR: "+err)
    }
};

/**
 * @function setAudioContext
 * @description assigns a specific audiocontext to the chord
 * @example setAudioContext(ac)
 * @param {Object} ac       - Web Audio audioContext
 */
chordPlayer.prototype.setAudioContext = function(ac) {
    this.audioContext = (ac == void 0) ? this.audioContext : ac;    
};

/**
 * @function setDestinationNode
 * @description assigns a specific destination node to the chord (any connectable audioNode)
 * @example setDestinationNode(audioContext.destination)
 * @param {Object} dn       - Web Audio destinationNode
 */
chordPlayer.prototype.setDestinationNode = function(dn) {
    this.destinationNode = (dn === void 0) ? this.audiocontext.destination : dn;
};

/**
 * @function setOctave
 * @description assigns a specific octave to play the chord at
 * @example setOctave(4)
 * @param {number} o       - musical octave of the note forming the chord [1-8]
 */
chordPlayer.prototype.setOctave = function(o) {
    this.octave = (o === void 0) ? this.octave : o;
};

/**
 * @function setVolume
 * @description changes the volume
 * @example setVolume(0.5)
 * @param {Number} v        - Volume level
 */
chordPlayer.prototype.setVolume = function(v) {
    this.volume = (v === void 0) ? this.volume : v;
};

/**
 * @function setDuration
 * @description changes the time the note has to be played for
 * @example setDuration(2.3)
 * @param {Number} d        - Time to play the note for, in second
 */
chordPlayer.prototype.setDuration = function(d) {
    this.duration = (d === void 0) ? this.duration : d;
};

/**
 * @function setVerbose
 * @description switches verbose mode on/ff
 * @example setVerbose(); setVerbose(false)
 * @param {Number} [v]         - True or false, default is true
 */
chordPlayer.prototype.setVerbose = function(v) {
    this.verbose = (v === void 0 || v === true) ? true : false;
};

module.exports = chordPlayer