import React, {useState} from 'react';
import SpotifyWebApi from 'spotify-web-api-js';

//Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Button from 'react-bootstrap/Button'
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'

//Components
import CustomPlaylistForm from './Components/CustomPlaylistForm.js'

function App() {
  /* Initialize spotify API */
  const spotifyApi = new SpotifyWebApi();
  const params = getHashParams()
  const token = params.access_token;
  if (token) {
    spotifyApi.setAccessToken(token);
  }
  
  const loggedIn = useState(token ? true : false);
  const [topTracks, setTopTracks] = useState([]);
  
  function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    e = r.exec(q)
    while (e) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
       e = r.exec(q);
    }
    return hashParams;
  }

  //Creates a playlist of songs similar to a users most listened to songs that are not liked by the user
  function getTopTracks() {
    const topOptions = {
      limit: 50
    }
    let newPlaylistId = "";

    const options = {
      public: false,
      name: "Generated Playlist"
    }
    //Create new empty playlist
    spotifyApi.createPlaylist(params.current_user, options)
    .then(async () => {
      let i = 0;
      while (newPlaylistId === "")
      {
        let playlistOptions = {
          limit: 50,
          offset: i*50 
        }
        i++;
        //Get the id of the newly generated playlist
        await spotifyApi.getUserPlaylists(params.current_user, playlistOptions)
        .then(playlists => {
          console.log(playlists)
          playlists.items.forEach(item => {
            console.log(item.name)
            if (item.name.toString() === "Generated Playlist" && item.tracks.total === 0)
            {
              newPlaylistId = item.id;
              console.log(item.id)
            }
          })

        })
        console.log(newPlaylistId)
      }
    //Get the users top tracks from spotify
    spotifyApi.getMyTopTracks(topOptions)
      .then(async (response) => {
        console.log("test")
        console.log(response)
        setTopTracks(response.items)
        let i = 0;
        let tracksToAdd = [];
        //For every 5 tracks in the users top tracks use them as a seed value to get 5 songs similar to them
        for (i; i < 50; i += 5)
        {
          const tracks = {
            limit: 50,
            seed_tracks: [response.items[i].id, response.items[i + 1].id, response.items[i + 2].id, response.items[i + 3].id, response.items[i + 4].id]
          }
          await spotifyApi.getRecommendations(tracks)
          .then(async (recommendations) => {
            console.log(recommendations)
            let trackNames = []

            recommendations.tracks.forEach((element) => {
              trackNames.push(element.id.toString())
            })
            
            //Check that the recommended song is not already liked by the user
            await spotifyApi.containsMySavedTracks(trackNames)
            .then((isSaved) => {
              console.log(isSaved)
              let newTracks = 0;
              let i = 0;
              for (i; i < isSaved.length; i++) {
                if (!isSaved[i] && newTracks < 5 && !tracksToAdd.includes(recommendations.tracks[i].uri))
                {
                  tracksToAdd.push(recommendations.tracks[i].uri)
                  newTracks++;
                }
              }
            })
            .catch(error => {
              console.log(error)
            })
          })
        }
        //Add all the tracks to the newly created playlist
        await spotifyApi.addTracksToPlaylist(newPlaylistId, tracksToAdd)
        .then((response) => {
          window.location.reload();
        })
        .catch(error => {
          console.log(error)
        })
      })
    })

    console.log(topTracks[0])
  }

  return (
    <div className="App">
      <div>
        <h1 id="pageHeader">Create A Spotify Playlist</h1>
        <a id="loginButton" href='http://localhost:8888' > Login to Spotify </a>
      </div>
      <br />
      {loggedIn &&
        <div>
          <Accordion id="accordian">
            <Card>
              <Card.Header>
                <Accordion.Toggle className="accordionButton" as={Button} variant="link" eventKey="0">
                  Create A Playlist Based Off Your Top Songs
                </Accordion.Toggle>
              </Card.Header>
              <Accordion.Collapse eventKey="0">
                <Card.Body>
                  <Button variant='primary' type="submit" onClick={() => getTopTracks()}>
                    Create Playlist
                  </Button>
                </Card.Body>
              </Accordion.Collapse>
            </Card>
            <Card>
              <Card.Header>
                <Accordion.Toggle className="accordionButton" as={Button} variant="link" eventKey="1">
                  Customize Your Own Playlist
                </Accordion.Toggle>
              </Card.Header>
              <Accordion.Collapse eventKey="1">
                <Card.Body>
                  <CustomPlaylistForm spotify={spotifyApi} current={params.current_user}/>
                </Card.Body>
              </Accordion.Collapse>
            </Card>
          </Accordion>
        </div>
      }
    </div>
  );
}

export default App;
