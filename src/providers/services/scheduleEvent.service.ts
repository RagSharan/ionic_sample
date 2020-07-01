import { Injectable } from '@angular/core';
//import { Observable } from 'rxjs/Observable';
import firebase from 'firebase';
import { IEvent } from '../interfaces';


@Injectable()
export class ScheduleEventService {
    eventsRef: any = firebase.database().ref('scheduleEvents');
    eventsUserRef: any = firebase.database().ref('eventUser');
    statisticsRef: any = firebase.database().ref('statistics');
    groupRef: any = firebase.database().ref('groupsPerUser')


    defaultImageUrl: string;
    connected: boolean = false;

    constructor() {
    
    }


    isFirebaseConnected() {
        return this.connected;
    }

    scheduleEvent(newEvent: IEvent) {
        var newEventRef = this.eventsRef.push();
        var eventKey = newEventRef.key;
        return newEventRef.set({
                        evntKey: eventKey,
                        selectedGroups: newEvent.selectedGroups,
                        title: newEvent.title,
                        dateCreated: newEvent.dateCreated,
                        user: newEvent.user,
                        location: newEvent.location,
                        startTime: newEvent.startTime,
                        endTime: newEvent.endTime
              })

    }   
    
    getEvents(snapshot: any): Array<IEvent> {
        let eventArray: Array<IEvent> = [];
        if (snapshot.val() == null)
            return eventArray;
        let list = snapshot.val();

        Object.keys(snapshot.val()).map((key: any) => {
            let thread: any = list[key];

            eventArray.push({
                evntKey: key,
                selectedGroups: thread.selectedGroups,
                title: thread.title,
                dateCreated: thread.dateCreated,
                user: thread.user,
                location: thread.location,
                startTime: thread.startTime,
                endTime: thread.endTime

            });
        });

        return eventArray;
    }

    getEvent(snapshot: any, key: string): IEvent {

        let events: IEvent = {
            evntKey: key,
            selectedGroups: snapshot.selectedGroups,
            title: snapshot.title,
            dateCreated: snapshot.dateCreated,
            user: snapshot.user,
            location: snapshot.location,
            startTime: snapshot.startTime,
            endTime: snapshot.endTime

        };

        return events;
    }

    getStatisticsRef() {
        return this.statisticsRef;
    }
   

    getUserEvents(userUid: string, cb) {
        let eventDataRef = this.eventsRef.orderByChild('user/uid').equalTo(userUid);
        eventDataRef.once('value', cb)
    }
    /*
    getPersonalEvents(userId, cb) {
        var self = this;
        let assignment = self.eventsRef.orderByChild('selectedGroups').equalTo(userId);
        assignment.once('value', cb);
    }*/
    getScheduleEvents(userId: string, cb) {
        var self = this;
        this.groupRef.child(userId).on('child_added', snap => {
            let assignment = self.eventsRef.orderByChild('selectedGroups').equalTo(snap.key);
            assignment.once('value', cb);
        })
    }

    getGroupEvents(groupId: string, cb) {
        let groupEventRef = this.eventsRef.orderByChild('selectedGroups').equalTo(groupId);
        groupEventRef.once('value', cb);

    }

    /*
    addEventUser(eventKey: string, userKey: string, status) {
        if (status) {
           return this.eventsUserRef.child( eventKey + '/' + userKey).set(true);
        }
        else {
           return this.eventsUserRef.child( eventKey + '/' + userKey).set(false);
        }
    }
    getUserEventStatus(eventKey: string, userKey: string) {
        let eventStatus = this.eventsUserRef.child(eventKey).child(userKey);
        return eventStatus.once('value');
    }*/
}