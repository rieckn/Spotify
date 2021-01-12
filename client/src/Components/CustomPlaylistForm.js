import React, {useState} from 'react';

//Bootstrap
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import ListGroup from 'react-bootstrap/ListGroup'
import Modal from 'react-bootstrap/Modal'
import Table from 'react-bootstrap/Table'

//Component
import Selector from './Selector.js'

function CustomPlaylistForm (props) {
    /*State Variables*/
    //used for modal
    const [modalShow, setModalShow] = useState(false);

    //List containing the seed values for specific search. There are 3 types of seed values with 5 total
    const [searchList, setSearchList] = useState([[],[],[]])

    //Array of search Recommendations
    const [searchRecs, setSearchRecs] = useState([])

    //Count of seed values selected
    const [selectorCount, setSelectorCount] = useState(0);

    //Playlist creation parameters
    const [playlistName, setPlaylistName] = useState("Playlist")
    const [playlistDescription, setPlaylistDescription] = useState("")
    const [numberOfSongs, setNumberOfSongs] = useState(0)
    const [isPublic, setIsPublic] = useState(false)
    const [isCollab, setIsCollab] = useState(false)

    //Spotify song recommendation Parameters
    const [acousticness, setAcousticness] = useState(["","",""]);
    const [danceability, setDanceability] = useState(["","",""]);
    const [duration, setDuration] = useState(["","",""]);
    const [energy, setEnergy] = useState(["","",""]);
    const [instrumentalness, setInstrumentalness] = useState(["","",""]); 
    const [key, setKey] = useState(["","",""]);
    const [liveness, setLiveness] = useState(["","",""]);
    const [loudness, setLoudness] = useState(["","",""]);
    const [popularity, setPopularity] = useState(["","",""]); 
    const [speechiness, setSpeechiness] = useState(["","",""]); 
    const [tempo, setTempo] = useState([[],[],[]]);
    const [timesig, setTimesig] = useState(["","",""]); 
    const [valence, setValence] = useState(["","",""]);
    const [mode, setMode] = useState([""]); 

    const columnWidth = {
        width: '50%'
    }

    function handleSubmit () {
        const recommendationParams = {
            limit: numberOfSongs,
            //Used to house the maximum of 5 seed parameters for searching
            seed_artists: searchList[1].map((element) => element.split(';')[2]),
            seed_genres: searchList[2].map((element) => element.split(';')[0]),
            seed_tracks: searchList[0].map((element) => element.split(';')[2]),
            //Extra search parameters that can further customize song search.
            //Syntax allows to conditionally add to query parameters as long as the value of the string is not ""
            ...(acousticness[0] !== "" && {min_acousticness: parseFloat(acousticness[0])}),
            ...(acousticness[1] !== "" && {max_acousticness: parseFloat(acousticness[1])}),
            ...(acousticness[2] !== "" && {target_acousticness: parseFloat(acousticness[2])}),
            ...(danceability[0] !== "" && {min_danceability: parseFloat(danceability[0])}),
            ...(danceability[1] !== "" && {max_danceability: parseFloat(danceability[1])}),
            ...(danceability[2] !== "" && {target_danceability: parseFloat(danceability[2])}),
            ...(duration[0] !== "" && {min_duration_ms: parseInt(duration[0]) * 1000}),
            ...(duration[1] !== "" && {max_duration_ms: parseInt(duration[1]) * 1000}),
            ...(duration[2] !== "" && {target_acousticness: parseInt(duration[2]) * 1000}),
            ...(energy[0] !== "" && {min_energy: parseFloat(energy[0])}),
            ...(energy[1] !== "" && {max_energy: parseFloat(energy[1])}),
            ...(energy[2] !== "" && {target_energy: parseFloat(energy[2])}),
            ...(instrumentalness[0] !== "" && {min_instrumentalness: parseFloat(instrumentalness[0])}),
            ...(instrumentalness[1] !== "" && {max_instrumentalness: parseFloat(instrumentalness[1])}),
            ...(instrumentalness[2] !== "" && {target_instrumentalness: parseFloat(instrumentalness[2])}),
            ...(key[0] !== "" && {min_key: parseInt(key[0])}),
            ...(key[1] !== "" && {max_key: parseInt(key[1])}),
            ...(key[2] !== "" && {target_key: parseInt(key[2])}),
            ...(liveness[0] !== "" && {min_liveness: parseFloat(liveness[0])}),
            ...(liveness[1] !== "" && {max_liveness: parseFloat(liveness[1])}),
            ...(liveness[2] !== "" && {target_liveness: parseFloat(liveness[2])}),
            ...(loudness[0] !== "" && {min_loudness: parseFloat(loudness[0])}),
            ...(loudness[1] !== "" && {max_loudness: parseFloat(loudness[1])}),
            ...(loudness[2] !== "" && {target_loudness: parseFloat(loudness[2])}),
            ...(speechiness[0] !== "" && {min_speechiness: parseFloat(speechiness[0])}),
            ...(speechiness[1] !== "" && {max_speechiness: parseFloat(speechiness[1])}),
            ...(speechiness[2] !== "" && {target_speechiness: parseFloat(speechiness[2])}),
            ...(mode[0] !== "" && {target_mode: parseInt(mode[0])}),
            ...(popularity[0] !== "" && {min_popularity: parseInt(popularity[0])}),
            ...(popularity[1] !== "" && {max_popularity: parseInt(popularity[1])}),
            ...(popularity[2] !== "" && {target_popularity: parseInt(popularity[2])}),
            ...(tempo[0] !== "" && {min_tempo: parseFloat(tempo[0])}),
            ...(tempo[1] !== "" && {max_tempo: parseFloat(tempo[1])}),
            ...(tempo[2] !== "" && {target_tempo: parseFloat(tempo[2])}),
            ...(timesig[0] !== "" && {min_time_signature: parseInt(timesig[0])}),
            ...(timesig[1] !== "" && {max_time_signature: parseInt(timesig[1])}),
            ...(timesig[2] !== "" && {target_time_signature: parseInt(timesig[2])}),
            ...(valence[0] !== "" && {min_valence: parseFloat(valence[0])}),
            ...(valence[1] !== "" && {max_valence: parseFloat(valence[1])}),
            ...(valence[2] !== "" && {target_valence: parseFloat(valence[2])})
        }

        //Function that submits the search, recieves recommendations and creates the playlist
        props.spotify.getRecommendations(recommendationParams)  //gets recommendations based on parameters above
        .then((recommendations) => {
            //Set playlist parameters
            const playlistParams = {
                name: playlistName,
                public: isPublic,
                collaborative: isCollab,
                description: playlistDescription,
            }
            //create new playlist
            props.spotify.createPlaylist(props.current, playlistParams)
            .then(async (response) => {
                await props.spotify.getUserPlaylists(props.current, playlistParams)
                .then(playlists => {
                  console.log(playlists)
                  playlists.items.forEach(item => {
                    //Search each playlist in the users account and find the one that has the same name and is currently empty
                    if (item.name.toString() === playlistName && item.tracks.total === 0)
                    {
                        //Add each recommendation to the new playlist and reload the page
                        props.spotify.addTracksToPlaylist(item.id, recommendations.tracks.map((track) => track.uri))
                        .then((response) => {
                            window.location.reload()
                        })
                    }
                  })
                })
            })
        })
        .catch(error => {
            console.log(error)
        })
    }

    /*Set functions for state variables*/
    function handleName (name) {
        setPlaylistName(name);
    }

    function handleDescription (description) {
        setPlaylistDescription(description);
    }

    function handleNumber (number) {
        setNumberOfSongs(parseInt(number))
    }

    function handleCollab (boolVal) {
        setIsCollab(boolVal);
    }

    function handlePublic (boolVal) {
        setIsPublic(boolVal)
    }

    function handleChange (val, index, setFunction, original) {
        let newVal = [...original];
        newVal[index] = val;
        setFunction(newVal);
    }

    return (
        <div>
            <Form id="customForm">
                <Form.Group class="formGroup" controlId="playlistName">
                    <Form.Label class="formLabel">Playlist Name</Form.Label>
                    <Form.Control type="text" placeholder="Playlist" onBlur={(e) => handleName(e.target.value)}/>
                </Form.Group>

                {/* 3 Selectors that the users use to get seed values for recommendations */}
                <Form.Group class="formGroup" controlId="playlistName">
                    <h4>Select Up To 5 Of The Following</h4>
                    <ListGroup horizontal>
                        <ListGroup.Item>
                            <Selector   title="Song" 
                                        spotify={props.spotify}
                                        count={selectorCount} 
                                        setCount={setSelectorCount}
                                        list={searchList}
                                        setList={setSearchList}
                                        recs={searchRecs}
                                        setRecs={setSearchRecs}
                                        class="selectorObject"/>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <Selector   title="Artist"
                                        spotify={props.spotify} 
                                        count={selectorCount} 
                                        setCount={setSelectorCount}
                                        list={searchList}
                                        setList={setSearchList}
                                        recs={searchRecs}
                                        setRecs={setSearchRecs}
                                        class="selectorObject"/>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <Selector   title="Genre" 
                                        spotify={props.spotify} 
                                        count={selectorCount} 
                                        setCount={setSelectorCount}
                                        list={searchList}
                                        setList={setSearchList}
                                        recs={searchRecs}
                                        setRecs={setSearchRecs}
                                        class="selectorObject"/>
                        </ListGroup.Item>
                    </ListGroup>
                </Form.Group>

                <Form.Group class="formGroup" controlId="playlistName">
                    <Form.Label class="formLabel">Playlist Description</Form.Label>
                    <Form.Control as="textarea" rows="3" placeholder="Description" onBlur={(e) => handleDescription(e.target.value)}/>
                </Form.Group>

                <Form.Group class="formGroup" controlId="playlistName">
                    <Form.Label class="formLabel">Number Of Songs</Form.Label>
                    <Form.Control type="text" required placeholder="1-100" onBlur={(e) => handleNumber(e.target.value)}/>
                </Form.Group>

                <Button id="moreButton" variant="outline-secondary" onClick={() => setModalShow(true)}>
                    More Options
                </Button>

                {/* Form for more specialized search parameters */}
                <Modal
                        size="lg"
                        aria-labelledby="contained-modal-title-vcenter"
                        dialogClassName="dialogClass"
                        centered
                        show={modalShow}
                    >
                        <Modal.Header>
                        <Modal.Title id="contained-modal-title-vcenter">
                            More Options
                        </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form>
                            <ListGroup>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                    <th>Attribute</th>
                                    <th style={columnWidth}>Description</th>
                                    <th>Min Value</th>
                                    <th>Max Value</th>
                                    <th>Target Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                    <td>Acousticness</td>
                                    <td>A confidence measure from 0.0 to 1.0 of whether the track is acoustic. 1.0 represents high confidence the track is acoustic.</td>
                                    <td><Form.Control type="text" value={acousticness[0]} onChange={(e) => handleChange(e.target.value, 0, setAcousticness, acousticness)} placeholder="0.0-1.0"/></td>
                                    <td><Form.Control type="text" value={acousticness[1]} onChange={(e) => handleChange(e.target.value, 1, setAcousticness, acousticness)} placeholder="0.0-1.0"/></td>
                                    <td><Form.Control type="text" value={acousticness[2]} onChange={(e) => handleChange(e.target.value, 2, setAcousticness, acousticness)} placeholder="0.0-1.0"/></td>
                                    </tr>
                                    <tr>
                                    <td>Danceability</td>
                                    <td>Danceability describes how suitable a track is for dancing based on a combination of musical elements including tempo, rhythm stability, beat strength, and overall regularity. A value of 0.0 is least danceable and 1.0 is most danceable.</td>
                                    <td><Form.Control type="text" value={danceability[0]} onChange={(e) => handleChange(e.target.value, 0, setDanceability, danceability)} placeholder="0.0-1.0"/></td>
                                    <td><Form.Control type="text" value={danceability[1]} onChange={(e) => handleChange(e.target.value, 1, setDanceability, danceability)} placeholder="0.0-1.0"/></td>
                                    <td><Form.Control type="text" value={danceability[2]} onChange={(e) => handleChange(e.target.value, 2, setDanceability, danceability)} placeholder="0.0-1.0"/></td>
                                    </tr>
                                    <tr>
                                    <td>Energy</td>
                                    <td>Energy is a measure from 0.0 to 1.0 and represents a perceptual measure of intensity and activity. Typically, energetic tracks feel fast, loud, and noisy. For example, death metal has high energy, while a Bach prelude scores low on the scale. Perceptual features contributing to this attribute include dynamic range, perceived loudness, timbre, onset rate, and general entropy.</td>
                                    <td><Form.Control type="text" value={energy[0]} onChange={(e) => handleChange(e.target.value, 0, setEnergy, energy)} placeholder="0.0-1.0"/></td>
                                    <td><Form.Control type="text" value={energy[1]} onChange={(e) => handleChange(e.target.value, 1, setEnergy, energy)} placeholder="0.0-1.0"/></td>
                                    <td><Form.Control type="text" value={energy[2]} onChange={(e) => handleChange(e.target.value, 2, setEnergy, energy)} placeholder="0.0-1.0"/></td>
                                    </tr>
                                    <tr>
                                    <td>Instrumentalness</td>
                                    <td>Predicts whether a track contains no vocals. “Ooh” and “aah” sounds are treated as instrumental in this context. Rap or spoken word tracks are clearly “vocal”. The closer the instrumentalness value is to 1.0, the greater likelihood the track contains no vocal content. Values above 0.5 are intended to represent instrumental tracks, but confidence is higher as the value approaches 1.0.</td>
                                    <td><Form.Control type="text" value={instrumentalness[0]} onChange={(e) => handleChange(e.target.value, 0, setInstrumentalness, instrumentalness)} placeholder="0.0-1.0"/></td>
                                    <td><Form.Control type="text" value={instrumentalness[1]} onChange={(e) => handleChange(e.target.value, 1, setInstrumentalness, instrumentalness)} placeholder="0.0-1.0"/></td>
                                    <td><Form.Control type="text" value={instrumentalness[2]} onChange={(e) => handleChange(e.target.value, 2, setInstrumentalness, instrumentalness)} placeholder="0.0-1.0"/></td>
                                    </tr>
                                    <tr>
                                    <td>Liveness</td>
                                    <td>Detects the presence of an audience in the recording. Higher liveness values represent an increased probability that the track was performed live. A value above 0.8 provides strong likelihood that the track is live.</td>
                                    <td><Form.Control type="text" value={liveness[0]} onChange={(e) => handleChange(e.target.value, 0, setLiveness, liveness)} placeholder="0.0-1.0"/></td>
                                    <td><Form.Control type="text" value={liveness[1]} onChange={(e) => handleChange(e.target.value, 1, setLiveness, liveness)} placeholder="0.0-1.0"/></td>
                                    <td><Form.Control type="text" value={liveness[2]} onChange={(e) => handleChange(e.target.value, 2, setLiveness, liveness)} placeholder="0.0-1.0"/></td>
                                    </tr>
                                    <tr>
                                    <td>Speechiness</td>
                                    <td>Speechiness detects the presence of spoken words in a track. The more exclusively speech-like the recording (e.g. talk show, audio book, poetry), the closer to 1.0 the attribute value. Values above 0.66 describe tracks that are probably made entirely of spoken words. Values between 0.33 and 0.66 describe tracks that may contain both music and speech, either in sections or layered, including such cases as rap music. Values below 0.33 most likely represent music and other non-speech-like tracks.</td>
                                    <td><Form.Control type="text" value={speechiness[0]} onChange={(e) => handleChange(e.target.value, 0, setSpeechiness, speechiness)} placeholder="0.0-1.0"/></td>
                                    <td><Form.Control type="text" value={speechiness[1]} onChange={(e) => handleChange(e.target.value, 1, setSpeechiness, speechiness)} placeholder="0.0-1.0"/></td>
                                    <td><Form.Control type="text" value={speechiness[2]} onChange={(e) => handleChange(e.target.value, 2, setSpeechiness, speechiness)} placeholder="0.0-1.0"/></td>
                                    </tr>
                                    <tr>
                                    <td>Valence</td>
                                    <td>A measure from 0.0 to 1.0 describing the musical positiveness conveyed by a track. Tracks with high valence sound more positive (e.g. happy, cheerful, euphoric), while tracks with low valence sound more negative (e.g. sad, depressed, angry).</td>
                                    <td><Form.Control type="text" value={valence[0]} onChange={(e) => handleChange(e.target.value, 0, setValence, valence)} placeholder="0.0-1.0"/></td>
                                    <td><Form.Control type="text" value={valence[1]} onChange={(e) => handleChange(e.target.value, 1, setValence, valence)} placeholder="0.0-1.0"/></td>
                                    <td><Form.Control type="text" value={valence[2]} onChange={(e) => handleChange(e.target.value, 2, setValence, valence)} placeholder="0.0-1.0"/></td>
                                    </tr>
                                    <tr>
                                    <td>Duration (s)</td>
                                    <td>The duration of the track seconds.</td>
                                    <td><Form.Control type="text" value={duration[0]} onChange={(e) => handleChange(e.target.value, 0, setDuration, duration)}/></td>
                                    <td><Form.Control type="text" value={duration[1]} onChange={(e) => handleChange(e.target.value, 1, setDuration, duration)}/></td>
                                    <td><Form.Control type="text" value={duration[2]} onChange={(e) => handleChange(e.target.value, 2, setDuration, duration)}/></td>
                                    </tr>
                                    <tr>
                                    <td>Key</td>
                                    <td>The key the track is in. Integers map to pitches using standard Pitch Class notation. E.g. 0 = C, 1 = C♯/D♭, 2 = D, and so on.</td>
                                    <td><Form.Control type="text" value={key[0]} onChange={(e) => handleChange(e.target.value, 0, setKey, key)} placeholder="0-11"/></td>
                                    <td><Form.Control type="text" value={key[1]} onChange={(e) => handleChange(e.target.value, 1, setKey, key)} placeholder="0-11"/></td>
                                    <td><Form.Control type="text" value={key[2]} onChange={(e) => handleChange(e.target.value, 2, setKey, key)} placeholder="0-11"/></td>
                                    </tr>
                                    <tr>
                                    <td>Loudness</td>
                                    <td>The overall loudness of a track in decibels (dB). Loudness values are averaged across the entire track and are useful for comparing relative loudness of tracks. Loudness is the quality of a sound that is the primary psychological correlate of physical strength (amplitude). Values typical range between -60 and 0 db.</td>
                                    <td><Form.Control type="text" value={loudness[0]} onChange={(e) => handleChange(e.target.value, 0, setLoudness, loudness)} placeholder="-60-0"/></td>
                                    <td><Form.Control type="text" value={loudness[1]} onChange={(e) => handleChange(e.target.value, 1, setLoudness, loudness)} placeholder="-60-0"/></td>
                                    <td><Form.Control type="text" value={loudness[2]} onChange={(e) => handleChange(e.target.value, 2, setLoudness, loudness)} placeholder="-60-0"/></td>
                                    </tr>
                                    <tr>
                                    <td>Popularity</td>
                                    <td>The popularity of the track. The value will be between 0 and 100, with 100 being the most popular. The popularity is calculated by algorithm and is based, in the most part, on the total number of plays the track has had and how recent those plays are.</td>
                                    <td><Form.Control type="text" value={popularity[0]} onChange={(e) => handleChange(e.target.value, 0, setPopularity, popularity)} placeholder="0-100"/></td>
                                    <td><Form.Control type="text" value={popularity[1]} onChange={(e) => handleChange(e.target.value, 1, setPopularity, popularity)} placeholder="0-100"/></td>
                                    <td><Form.Control type="text" value={popularity[2]} onChange={(e) => handleChange(e.target.value, 2, setPopularity, popularity)} placeholder="0-100"/></td>
                                    </tr>
                                    <tr>
                                    <td>Tempo</td>
                                    <td>The overall estimated tempo of a track in beats per minute (BPM). In musical terminology, tempo is the speed or pace of a given piece and derives directly from the average beat duration.</td>
                                    <td><Form.Control type="text" value={tempo[0]} onChange={(e) => handleChange(e.target.value, 0, setTempo, tempo)}/></td>
                                    <td><Form.Control type="text" value={tempo[1]} onChange={(e) => handleChange(e.target.value, 1, setTempo, tempo)}/></td>
                                    <td><Form.Control type="text" value={tempo[2]} onChange={(e) => handleChange(e.target.value, 2, setTempo, tempo)}/></td>
                                    </tr>
                                    <tr>
                                    <td>Time Signature</td>
                                    <td>An estimated overall time signature of a track. The time signature (meter) is a notational convention to specify how many beats are in each bar (or measure). The time signature ranges from 3 to 7 indicating time signatures of “3/4”, to “7/4”.</td>
                                    <td><Form.Control type="text" value={timesig[0]} onChange={(e) => handleChange(e.target.value, 0, setTimesig, timesig)} placeholder="3-7"/></td>
                                    <td><Form.Control type="text" value={timesig[1]} onChange={(e) => handleChange(e.target.value, 1, setTimesig, timesig)} placeholder="3-7"/></td>
                                    <td><Form.Control type="text" value={timesig[2]} onChange={(e) => handleChange(e.target.value, 2, setTimesig, timesig)} placeholder="3-7"/></td>
                                    </tr>
                                    <tr>
                                    <td>Mode</td>
                                    <td>Mode indicates the modality (major or minor) of a track, the type of scale from which its melodic content is derived. Major is represented by 1 and minor is 0.</td>
                                    <td></td>
                                    <td></td>
                                    <td><Form.Control type="text" value={mode[0]} onChange={(e) => handleChange(e.target.value, 0, setMode, mode)} placeholder="0-1"/></td>
                                    </tr>
                                </tbody>
                                </Table>
                            </ListGroup>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                        <Button onClick={() => setModalShow(false)}>Close</Button>
                        </Modal.Footer>
                    </Modal>


                <Form.Group class="formGroup" controlId="playlistName">
                    <Form.Check label="Public Playlist" onChange={(e) => handlePublic(e.target.checked)}/>
                    <Form.Check label="Collaborative Playlist" onChange={(e) => handleCollab(e.target.checked)}/>
                </Form.Group>

                <Button variant="primary" type="button" onClick={() => handleSubmit()}>
                    Create Playlist
                </Button>
            </Form>
        </div>
    );
}

export default CustomPlaylistForm;