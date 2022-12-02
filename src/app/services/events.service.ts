import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  Firestore,
  addDoc,
  setDoc,
  collection,
  query,
  where,
  docData,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import {
  Storage,
  ref,
  getDownloadURL,
  uploadString,
} from '@angular/fire/storage';
import { EventType } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { LilyEvent } from '../interfaces/event';

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  private event$: BehaviorSubject<LilyEvent[]> = new BehaviorSubject<
    LilyEvent[]
  >([]);
  private events: LilyEvent[] = [];
  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private storage: Storage
  ) {}

  getUserProfile() {
    const user = this.auth.currentUser;
    const userDocRef = doc(this.firestore, `users/${user.uid}`);
    return docData(userDocRef, { idField: 'id' });
  }

  async addEvent(eventObj) {
    const user = this.auth.currentUser;
    //create event object
    let events = this.event$.getValue();
    events.push(eventObj);
    this.event$.next(events);
    //this.event$.next(eventObj);
    console.log(this.event$);
    try {
      // Add a new document with a generated id.
      const docRef = await addDoc(collection(this.firestore, 'events'), {
        userid: user.uid,
        eventName: eventObj.name,
        eventDate: eventObj.date,
        eventDesc: eventObj.description,
      });
      console.log('Document written with ID: ', docRef.id);
      return true;
    } catch (e) {
      console.log('upload error', e);
      return null;
    }
  }

  async getEvent(eventNameInput) {
    const user = this.auth.currentUser;
    const eventsRef = collection(this.firestore, 'events');
    const q = query(
      eventsRef,
      where('userid', '==', user.uid),
      where('eventName', '==', eventNameInput)
    );
    const querySnapshot = await getDocs(q);
    let returndata = {
      eventName: '',
      eventDate: '',
      eventDesc: '',
    } as LilyEvent;
    querySnapshot.forEach((doc) => {
      returndata.eventName = doc.data().eventName;
      returndata.eventDate = doc.data().eventDate;
      returndata.eventDesc = doc.data().eventDesc;
    });
    return returndata;
  }

  async getAllEventsByUser() {
    const user = this.auth.currentUser;
    const eventsRef = collection(this.firestore, 'events');
    const q = query(eventsRef, where('userid', '==', user.uid));

    const eventsData = [];

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      console.log(doc.id, ' => ', doc.data());
      eventsData.push(doc.data());
    });
    this.events = eventsData;
    this.event$.next(this.events);
    return this.event$;
  }

  async updateEvent(eventName, newData) {
    const user = this.auth.currentUser;
    const eventsRef = collection(this.firestore, 'events');
    const q = query(
      eventsRef,
      where('userid', '==', user.uid),
      where('eventName', '==', eventName)
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (docnr) => {
      const docRef = doc(this.firestore, 'events', docnr.id);

      await updateDoc(docRef, {
        eventDate: newData.date,
        eventDesc: newData.description,
      });
    });
  }

  async removeEvent(eventName) {
    const user = this.auth.currentUser;
    const eventsRef = collection(this.firestore, 'events');
    const q = query(
      eventsRef,
      where('userid', '==', user.uid),
      where('eventName', '==', eventName)
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (docnr) => {
      await deleteDoc(doc(this.firestore, 'events', docnr.id));
    });
  }
}
