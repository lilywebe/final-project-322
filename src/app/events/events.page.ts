import { Router } from '@angular/router';
import { AlertController, LoadingController, IonList } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { EventsService } from '../services/events.service';
import { LilyEvent } from '../interfaces/event';

@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
})
export class EventsPage implements OnInit {
  @ViewChild(IonList, { static: false }) slidingList: IonList;
  public events: any[] = [];
  constructor(
    public authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private eventsService: EventsService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    (await this.eventsService.getAllEventsByUser()).subscribe((events) => {
      this.events = events;
      this.cdr.detectChanges();
      console.log('made it to event', events);
    });
  }

  async addEventAlert() {
    const alert = await this.alertController.create({
      header: 'New Event',
      message: 'Enter the information related to your new event below',
      inputs: [
        {
          type: 'text',
          name: 'name',
        },
        {
          type: 'date',
          name: 'date',
        },
        {
          type: 'text',
          name: 'description',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
        },
        {
          text: 'Save',
          handler: async (data) => {
            await this.uploadEvent(data);
          },
        },
      ],
    });

    alert.present();
  }

  async uploadEvent(eventObject) {
    if (eventObject) {
      const loading = await this.loadingController.create();
      await loading.present();

      const result = await this.eventsService.addEvent(eventObject);
      loading.dismiss();

      if (!result) {
        const alert = await this.alertController.create({
          header: 'upload failed',
          message: 'There was a problem lol',
          buttons: ['ok'],
        });

        await alert.present();
      }
    }
  }
  async updateEvent(event: LilyEvent): Promise<void> {
    //console.log(event.eventDescription);
    const alert = await this.alertController.create({
      header: 'Update event ' + event.eventName,
      message: 'Enter the new information about your event below',
      inputs: [
        {
          type: 'date',
          name: 'date',
          value: event.eventDate,
        },
        {
          type: 'text',
          name: 'description',
          value: event.eventDesc,
        },
      ],
      buttons: [
        {
          text: 'Cancel',
        },
        {
          text: 'Save',
          handler: async (data) => {
            await this.eventsService.updateEvent(event.eventName, data);
            this.slidingList.closeSlidingItems();
          },
        },
      ],
    });

    alert.present();
  }

  async removeEvent(event: LilyEvent): Promise<void> {
    await this.slidingList.closeSlidingItems();
    this.eventsService.removeEvent(event.eventName);
  }
}
