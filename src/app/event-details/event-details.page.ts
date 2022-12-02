import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, IonList } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { LilyEvent } from '../interfaces/event';

import { EventsService } from '../services/events.service';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.page.html',
  styleUrls: ['./event-details.page.scss'],
})
export class EventDetailsPage implements OnInit {
  public singleevent: LilyEvent = {
    eventName: '',
    eventDate: '',
    eventDesc: '',
  };
  constructor(
    private route: ActivatedRoute,
    private eventsService: EventsService
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log(id);
    this.singleevent = await this.eventsService.getEvent(id);
    console.log('event gets ran');
  }
}
