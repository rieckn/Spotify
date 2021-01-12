/*Selector is an element that takes input in a textbox and queries spotify for object with that name
and returns recommondations off of that. It then displays the previously selected objects*/

import React, {useState} from 'react';

//Bootstrap
import Button from 'react-bootstrap/Button'
import ListGroup from 'react-bootstrap/ListGroup'
import Form from 'react-bootstrap/Form'
import ListGroupItem from 'react-bootstrap/esm/ListGroupItem';

function Selector (props) {
    const [elements, setElements] = useState([])

    //Adds new blank textbox
    function addElement () {
        setElements(elements.concat([""]))
        props.setCount(props.count + 1)
    }

    //Removes focus from element on blur. Is mostly used to remove and reset the search 
    //recommendations when user clicks away from the textbox
    function changePlaceholder (newPlaceholder, index, id) {
        let newElements = [...elements];
        newElements[index] = newPlaceholder + ";false;" + id;
        setElements(newElements);
        setList(newElements);
        props.setRecs([]);
    }

    //Remove selected element
    function removeElement (index) {
        let newElements = [...elements];
        newElements.splice(index,1);
        setElements(newElements);
        setList(newElements)
        props.setCount(props.count - 1);
        props.setRecs([]);
    }

    //Handles change in input textbox. Change the element and the array that contains it. 
    //Conduct new recommendation query through Spotify API
    function changeValue (value, index, id) {
        let newElements = [...elements];
        newElements[index] = value + ";true;" + id;
        setElements(newElements);
        searchRecommendations(value);
    }

    //Handles changing the state of the List variable which the main list that contains the 3 lists
    //of different types of searchable objects
    function setList (newElements) {
        let newList = [...props.list]
        if (props.title === "Song") {
            newList[0] = newElements
            props.setList(newList)
        }
        else if (props.title === "Artist") {
            newList[1] = newElements
            props.setList(newList)
        }
        else if (props.title === "Genre") {
            newList[2] = newElements
            props.setList(newList)
        }
    }

    //Indicates within element string that it is in focus. Helps with the
    //determining if the search results should be displayed or not
    function setFocus (value, index, id) {
        let newElements = [...elements];
        newElements[index] = value + ";true;" + id;
        setElements(newElements);
        searchRecommendations(value);
    }

    //Returns the first part of the element String which should be the element's name
    function returnValue (element) {
        if (element !== "")
        {
            return element.split(';')[0];
        }
        else return element;
    }

    //Returns the Spotify ID of the object if it has already been appended to the element string
    function checkId (element) {
        if (element.split(';').length = 3) {
            return element.split(';')[2]        
        }
    }

    //Handles recommendation selection
    function handleSelection (value, index, id) {
        let newElements = [...elements];
        newElements[index] = value + ";true;" + id;
        setElements(newElements);
        props.setRecs([])
    }

    //Function that actually queryies spotify for search recommendations
    function searchRecommendations(searchVal) {
        if (searchVal !== "") {
            let resultArray = [];
            if (props.title === "Song")
            {
                const testParams = {
                    limit: 5
                }
                props.spotify.search(searchVal, ["track"], testParams)
                .then((response) => {
                    console.log(response)
                    response.tracks.items.map((item, index) => {
                        resultArray.push(item.name + " By: " + item.artists[0].name + ";" + item.id + ";" + (item.album.images.length > 0 ? item.album.images[0].url : ""))
                    })
                    props.setRecs(resultArray)
                })
            }
            else if (props.title === "Artist")
            {
                const testParams = {
                    limit: 5
                }
                props.spotify.search(searchVal, ["artist"], testParams)
                .then((response) => {
                    console.log(response)
                    response.artists.items.map((item, index) => {
                        resultArray.push(item.name + ';' + item.id + ';' + (item.images.length > 0 ? item.images[0].url : ""))
                    })
                    props.setRecs(resultArray)
                })
            }
            else if (props.title === "Genre")
            {
                props.spotify.getAvailableGenreSeeds()
                .then((response) => {
                    let genres = response.genres.filter((genre) => genre.includes(searchVal))
                    if (genres.length > 5) {
                        props.setRecs(genres.slice(0, 5))
                    }
                    else props.setRecs(genres)
                })
            }
        }
    }

    //Displays already selected objects
    function displayElements() {
        return (
            elements.map((element, index) => (
                <div>
                    <div class="input-group">
                        <Form.Control  type="text" 
                                class="form-control"
                                placeholder={props.title + " name"} 
                                value={returnValue(element)} 
                                aria-label="Recipient's username" 
                                aria-describedby="basic-addon2"
                                onChange={e => changeValue(e.target.value, index, checkId(element))}
                                onBlur={(e) => changePlaceholder(e.target.value, index, checkId(element))}
                                onFocus={(e) => setFocus(e.target.value, index), checkId(element)}
                                required/>
                        <div class="input-group-append">
                            <button class="btn btn-outline-secondary" type="button" onClick={() => removeElement(index)}>X</button>
                        </div>
                    </div>
                    { !(element === "" || element.split(';')[1] === "false") &&
                    <ListGroup>
                        {searchRecs(index)}
                    </ListGroup>
                    }
                </div>
            ))
        )
    }

    //Displays search recommendations based on what has been typed in the textbox
    function searchRecs(index) {
        if (props.recs !== [])
        {
            return (
                props.recs.map((element) => (
                    <ListGroupItem bsPrefix="rec-container">
                        <Button type="button" 
                                onClick={() => handleSelection(element.split(';')[0], index, element.split(';')[1])}
                                onMouseDown={(e) => e.preventDefault()}
                                bsPrefix="rec-button">
                                {
                                element.split(';').length >= 3 && 
                                <img class="albumImage" src={element.split(';')[2]} width="40px" height="40px"></img>
                                }
                                <t class="nameText">{element.split(" By: ")[0].split(';')[0]}</t>
                                <br />
                                {
                                element.split(" By: ").length > 1 && 
                                <t class="artistText">{"Artist: " + element.split(" By: ")[1].split(';')[0]}</t>
                                }
                        </Button>
                    </ListGroupItem>  
                ))
            )
        }
    }

    return (
        <div>
            <label class="selectorLabel">{props.title + 's'}</label>
            {displayElements()}
            <br />
            {
            //Only display add button if there are less than 5 elements because the API doesn't allow for more than 5 seed values
            props.count < 5 && 
            <Button type="button" class="btn btn-default btn-circle btn-lg" onClick={() => addElement()}>+</Button>
            }
        </div>
    );
}

export default Selector;