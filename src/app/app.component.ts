import { Component, OnInit, isDevMode } from '@angular/core';
import { MdSnackBar, MdSnackBarConfig, MdSnackBarRef } from '@angular/material';
import { Http, Response } from '@angular/http';
import { NotificationsService } from 'angular2-notifications';
import 'rxjs/add/operator/toPromise';

import { Store } from '@ngrx/store';

import { RootState, reducer } from './rx/reducers';
import { AddCallAction } from './rx/actions/call';

import {
  SocketConnectionService,
  AuthenticationService,
  BasicService,
  BasicInformationApiData,
  Achievement,
  AchievementNotification,
  WebSocketCallMessage
} from './shared';

import {
  AchievementComponent
} from './components';

@Component({
  selector: 'jlm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  entryComponents: [ AchievementComponent ]
})
export class AppComponent implements OnInit {
  get goal() {
    return this.chooseCallGoal(this.basic.infos.dailyCalls || 0);
  }
  public notificationConfig = {
    position: ['bottom', 'right'],
    timeOut: 2000,
    maxStack: 4,
    lastOnBottom: true,
    animate: 'fromRight',
    showProgressBar: false
  };

  constructor(
    private scs: SocketConnectionService,
    public auth: AuthenticationService,
    private http: Http,
    public basic: BasicService,
    private snack: MdSnackBar,
    private notificationService: NotificationsService,
    private rootStore: Store<RootState>
  ) {}

  ngOnInit() {
    this.auth.getProfile()
      .catch(err => console.error(err.json()));
    this.scs.room.addEventListener('message', (event) => this.onNotif(event) , false);
    this.basic.getBasicInfo()
      .then(infos => this.basic.infos = infos)
      .catch(err => console.trace(err));
  }

  onNotif(message: MessageEvent) {
    const parsed: any = JSON.parse(message.data);
    switch (parsed.type) {
      case 'call':
        const notif: WebSocketCallMessage = parsed.value;
        const callActionPayload = {
          call: notif,
          agentUsername: notif.call.caller.agentUsername
        };
        this.rootStore.dispatch(new AddCallAction(callActionPayload));
        this.basic.infos = notif.updatedData;
        // if (
        //   this.auth.currentUser !== null
        //   && this.auth.currentUser.agentUsername === notif.call.caller.agentUsername
        // ) {
        //   this.auth.getExtendedInfo()
        //     .then((info) => {
        //       this.auth.currentUser.phi = info.phi;
        //     });
        // }
      break;
      case 'achievement':
        const trophyMessage = parsed as AchievementNotification;
        const {agentUsername, achievement} = trophyMessage.value;

        const template = `
          <div class="trophy-notification">
            <img class="trophy-picture" src="assets/img/achievements/${achievement.codeName}.png">
            <div class="trophy-content">
              <h4 class="trophy-title">
                <span class="username">${agentUsername}</span>
                a débloqué le trophée<br/>
                <span class="trophy-name">${achievement.name}</span>
              </h4>
              <p class="trophy-condition">(${achievement.condition})</p>
            </div>
          </div>
        `;

        this.notificationService.html( template, 'bare' );
      break;
    }
  }

  triggerAchievement() {
    if (! isDevMode) {
      return;
    }
    this.http.post('/api/simulate_achievement', {})
        .toPromise()
        .then(res => console.log(res.json()));
  }

  chooseCallGoal(callCount) {
    const sizes = [10, 50, 100, 250, 500, 1000, 2000, 5000, 10000, 50000];
    for (const value of sizes) {
      if (callCount < 0.95 * value) {
          return value;
      }
    }
    return (10 ** 10);
  }

}
