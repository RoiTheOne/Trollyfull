import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Route, Router, Switch, withRouter } from 'react-router-dom'
import { loadTrip, addTrip, addTripFast } from '../store/actions/tripActions'
import { closeModal, showModal } from '../store/actions/modalActions'
// import { TripRoute } from '../cmps/TripRoute'
import { tripService } from '.././services/tripService'
import { TripAssembly } from '../cmps/TripAssembly/TripAssembly'
import { TripNavBar } from '../cmps/TripApp/TripNavBar'
import { TripRoute } from '../cmps/TripRoute/TripRoute'
import { utils } from '../services/utils'
import { logDOM } from '@testing-library/react'
import { Chat } from '../cmps/TripApp/Chat'
import { socketService } from '../services/socketService'
import { MapContainer } from '../cmps/MainCmps/Map';
// import locationCevtorRed from 'https://res.cloudinary.com/roidinary/image/upload/v1600377967/locationVectorRed_vzufx4.png'


class _TripApp extends Component {

    state = {
        chatOpen: false,
        settingsOpen: false,
        isSocketSetup: false
    }

    async componentDidMount() {
        socketService.setup();
        // socketService.on('tripUpdated', this.loadTrip());
        const { id } = this.props.match.params
        try {
            await this.props.loadTrip(id)
            if (this.props.match.params.openSignup === 'true') {
                this.props.showModal('signup', id)
            }
            this.setState({ isSocketSetup: true })
        }
        catch (err) {
        }
    }
    componentWillUnmount() {
        // socketService.off('tripUpdated', this.loadTrip());
    }

    async componentDidUpdate(prevProps, prevState) {

    }


    changeDates(newTrip, direction, newDest, by) {
        const constant = 1000 * 60 * 60 * 24 * (by - 1)
        if (direction) {
            newDest.startDate -= (constant)
            newDest.endDate -= (constant)
            if (newTrip.activities) {
                newTrip.activities = newTrip.activities.map(act => {
                    if (act.destination === newDest.name) act.at -= constant
                    return act
                })
            }
        } else {
            newDest.startDate += (constant)
            newDest.endDate += (constant)
            if (newTrip.activities) {
                newTrip.activities = newTrip.activities.map((act, idx) => {
                    if (act.destination === newDest.name) act.at += constant
                    return act
                })
            }
        }
        if (!newTrip) return { newDest }
        return { newDest, newTrip }
    }


    swapDestinations(dests, newTrip) {
        const swapped = []
        const temp = { ...newTrip }
        const ans = this.changeDates(temp, false, dests[0], utils.calculateDays(dests[1].startDate, dests[1].endDate))
        swapped.push(ans.newDest)
        const ans2 = this.changeDates(ans.newTrip, true, dests[1], utils.calculateDays(dests[0].startDate, dests[0].endDate))
        swapped.unshift(ans2.newDest)
        return { swapped, newTrip: ans2.newTrip }
    }

    changeOrder = (dest, direction) => {
        const destinations = [...this.props.trip.destinations]
        if (direction) {
            const destinationsToSwap = destinations.splice(dest - 1, 2)
            const ans = this.swapDestinations(destinationsToSwap, this.props.trip)
            ans.newTrip.destinations[dest - 1] = ans.swapped[0]
            ans.newTrip.destinations[dest] = ans.swapped[1]
            this.props.addTrip(ans.newTrip)

        }
        else {
            const destinationsToSwap = destinations.splice(dest, 2)
            const ans2 = this.swapDestinations(destinationsToSwap, this.props.trip)
            ans2.newTrip.destinations[dest] = ans2.swapped[0]
            ans2.newTrip.destinations[dest + 1] = ans2.swapped[1]
            this.props.addTrip(ans2.newTrip)
        }
    }

    updateTripAct = async (activities) => {
        let newTrip = { ...this.props.trip, activities }
        await this.props.addTrip(newTrip)
        // socketService.emit('tripToUpdate', this.state.trip);

    }

    toggleChat = () => {
        this.setState({ chatOpen: !this.state.chatOpen })
    }
    toggleSettings = () => {
        this.setState({ settingsOpen: !this.state.settingsOpen })
    }
    getMarkers() {
        return this.props.trip.destinations.map(dest => {
            return { location: dest.location, name: dest.name }
        })
    }

    addDestination = (newDest) => {
        const {destinations} = {...this.props.trip}
        newDest.startDate = destinations[destinations.length-1].endDate
        // console.log(+newDest.days);

    }

    render() {
        const { trip } = this.props
        if (!trip) return <div>Loading....</div>
        return (
            <div className="trip-app  ">
                {/* <Switch>
                    <Route path="/trip/:id/triproute">
                        <img className="trip-main-img full" src={trip.imgUrl}></img>
                        <TripNavBar trip={trip} settingsOpen={this.state.settingsOpen} toggleSettings={this.toggleSettings} showModal={this.props.showModal}/>
                        <TripRoute trip={trip} changeOrder={this.changeOrder}></TripRoute>
                    </Route>
                    <Route path="/trip/:id/tripassembly">
                        <TripNavBar trip={trip} settingsOpen={this.state.settingsOpen} toggleSettings={this.toggleSettings} showModal={this.props.showModal}/>
                        <TripAssembly trip={trip} updateTripAct={this.updateTripAct} showModal={this.props.showModal} closeModal={this.props.closeModal}></TripAssembly>
                    </Route>
                </Switch> */}
                <div className="trip-app-area flex ">
                    <div className="trip-side-bar flex column ">
                        <TripRoute trip={trip} changeOrder={this.changeOrder} addDestination={this.addDestination}></TripRoute>
                    </div>
                    <div className="trip-app-main full">
                        <MapContainer markers={this.getMarkers()} />
                        <TripAssembly trip={trip} updateTripAct={this.updateTripAct} showModal={this.props.showModal} closeModal={this.props.closeModal}></TripAssembly>
                    </div>
                </div>
                {this.state.isSocketSetup && <Chat chatOpen={this.state.chatOpen} trip={trip} />}
                <button className="chat-button styled-button" onClick={this.toggleChat}>C</button>
            </div >
        )
    }
}


const mapStateToProps = state => {
    return {
        trip: state.tripReducer.currTrip
    }
}
const mapDispatchToProps = {
    loadTrip,
    showModal,
    closeModal,
    addTrip,
    addTripFast
}
export const TripApp = connect(mapStateToProps, mapDispatchToProps)(withRouter(_TripApp))