import React from 'react';
import './map.css';
import PinFormContainer from '../pin/pin_form_container';
import { style, gradient } from './map_style'

class Map extends React.Component {
    constructor(props){
        super(props);
        this.logContainer = React.createRef();
        this.markers = [];
        this.HeatMarkers = [];
        this.state = {
            formOpen: false
        }
        this.toggleReportListener = this.toggleReportListener.bind(this);
        this.placeMarker = this.placeMarker.bind(this);
        this.changeGradient = this.changeGradient.bind(this);
        this.setMarkers = this.setMarkers.bind(this);
        this.clearMarkers = this.clearMarkers.bind(this);

    }

    componentDidMount(){

        // Center is San Francisco
        const center = { lat: 37.777652, lng: -122.437503 };
        const zoom = 12;
        this.map = new window.google.maps.Map(document.getElementById("map"), {
            center,
            zoom,
            disableDefaultUI: true,
            zoomControl: true,
        });
        this.map.setOptions({styles: style})

        // adds listener for when zoom is clicked
        this.map.addListener('zoom_changed', () => {
            this.changeMapType();
        });

        this.props.fetchPins()
            .then(() => this.generateMarkers())
            .then(() => this.generateHeatMap())
            .then(() => this.heatmap.setMap(this.map));

        document
            .getElementById("change-gradient")
            .addEventListener("click", () => this.changeGradient());
    }

    UNSAFE_componentWillReceiveProps(nextProps){
        if (nextProps.pins.length !== this.props.pins.length) {
            this.setState({ formOpen: false });
            if(this.marker){
                this.marker.setMap(null);
            }
        }
    }

    changeMapType(){
        if(!this.map) return;
        let zoomLevel = this.map.getZoom();
        if (zoomLevel > 13) {
            this.setMarkers();
            this.heatmap.setMap(null);
        } else {
            this.clearMarkers();
            this.heatmap.setMap(this.map);
        }
    }

    regenerateMap(){
        // early return if no new pins added or removed
        if(this.props.pins.length === this.markers.length) return;
        this.generateMarkers();
        this.generateHeatMap();
        this.changeMapType();
    }

    generateMarkers() {
        if (!this.props.pins) return;
        if (this.props.pins.length === this.markers.length) return;
        let newPins = this.props.pins;
        let length = this.markers.length;
        for(let i = newPins.length-1; i >= length; i--){
            let marker = new window.google.maps.Marker({
                position: {lat: newPins[i].lat, lng: newPins[i].long},
                title: newPins[i].category
            })
            let date = new Date(parseInt(newPins[i]._id.substring(0, 8), 16) * 1000);
            let pinDate = date.toString().slice(3, 15);
            let infoWindow = new window.google.maps.InfoWindow({
                content: `<div>${pinDate}</div>` + `<a href="http://localhost:3000/#/pins/${newPins[i]._id}">See More</a>`
            })
            marker.addListener('click', () => {
                infoWindow.open({
                    anchor: marker,
                    map: this.map,
                    shouldFocus: false,
                })
            })
            this.markers.push(marker);
        }
    }

    setMarkers(){
        for (let i = 0; i < this.markers.length; i++) {
            this.markers[i].setMap(this.map);
        };
    }

    clearMarkers() {
        for (let i = 0; i < this.markers.length; i++) {
            this.markers[i].setMap(null);
        };
    };

    generateHeatMap(){
        if (!this.props.pins) return;
        if (this.props.pins.length === this.HeatMarkers.length) return;

        let newPins = this.props.pins;
        let length = this.HeatMarkers.length;
        for(let i = newPins.length-1; i >= length; i--){
            this.HeatMarkers.push(new window.google.maps.LatLng(newPins[i].lat, newPins[i].long))
        }

        if (this.heatmap) {
            this.heatmap.setMap(null)
        }

        this.heatmap = new window.google.maps.visualization.HeatmapLayer({
            data: this.HeatMarkers
        }); 
    }

    placeMarker(location) {
        this.marker = new window.google.maps.Marker({
            position: location, 
            map: this.map
        });
        
        this.setState({
            formOpen: true,
            lat: location.lat(),
            lng: location.lng(),
        })
        document.addEventListener("mousedown", this.handleClickOutsideForm);
        window.google.maps.event.removeListener(this.map_key);
        this.map_key = null;
    }

    toggleReportListener(e){
        if (this.map_key) return;
        this.map_key = window.google.maps.event.addListener(this.map, 'click', (event) => {
            this.placeMarker(event.latLng);
        });
        if(this.marker){
            this.marker.setMap(null);
        }
    }

    handleClickOutsideForm = (event) => {
        if (this.logContainer.current && !this.logContainer.current.contains(event.target)) {
            this.setState({
                formOpen: false,
            });
            this.marker.setMap(null);
        }
    }

    changeGradient() {
        this.heatmap.set("gradient", this.heatmap.get("gradient") ? null : gradient);
    }

    render(){
        // if(!this.props.pins) return null;
        this.regenerateMap();

        return(
            <div>
                {this.state.formOpen && (
                    <div ref={this.logContainer} className='pinForm'>
                        <PinFormContainer lat={this.state.lat} long={this.state.lng}/>
                    </div>
                )}
                <div id="floating-panel">
                    <button id="toggle-heatmap">Toggle Heatmap</button>
                    <button id="change-gradient">Change gradient</button>
                    <button id="change-radius">Change radius</button>
                    <button id="change-opacity">Change opacity</button>
                    <button id="add-incident" onClick={this.toggleReportListener}>Report Incident</button>
                </div>
                <div id="map" />
            </div>
        )
    }

    errors(Status){
        if (Status === Status.LOADING) return <h3>{Status} ..</h3>;
        if (Status === Status.FAILURE) return <h3>{Status} ...</h3>;
        return null;
    };

}

export default Map;