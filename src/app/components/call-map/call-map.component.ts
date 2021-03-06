import { Component, Input, OnInit, AfterViewInit, ViewContainerRef, ViewRef, ViewChild, ElementRef } from '@angular/core';

import { SocketConnectionService, CoordinatesConverterService, MapService } from '../../shared';
import { WsCallNotification, CallNoteDescription } from '../../core';

@Component({
  selector: 'jlm-call-map',
  templateUrl: './call-map.component.html',
  styleUrls: ['./call-map.component.scss']
})
export class CallMapComponent implements OnInit, AfterViewInit {
  @ViewChild('svgDocument') svgRef: ElementRef;
  notifications: { call: WsCallNotification, options: any}[] = [];
  shouldAnimate = false;

  @Input() timeout = 3000;

  constructor(
    private scs: SocketConnectionService,
    private mapService: MapService,
    private coordsCvrtr: CoordinatesConverterService) {}

  ngOnInit() {
    this.shouldAnimate = this.mapService.firstTime;
    this.scs.room.addEventListener('message', (event) => this.onCallNotification(event), false);
  }

  ngAfterViewInit() {
      this.mapService.firstTime = false;
  }

  getSvgDimensions(): {width: number, height: number} {
    const natel = this.svgRef;
    return {width: 1366, height: 768};
  }

  onCallNotification(event: MessageEvent) {
    const parsed = JSON.parse(event.data);
    switch (parsed.type) {
      case 'call':
        this.pushCall(parsed.value as CallNoteDescription);
      break;
      case 'achievement':
      break;
    }

  }

  pushCall(rawNotification: CallNoteDescription) {
    const call: WsCallNotification = {
      caller: {
        gps: {
            lat: +rawNotification.call.caller.lat,
            lng: +rawNotification.call.caller.lng
        }
      },
      callee: {
          gps: {
            lat: +rawNotification.call.target.lat,
            lng: +rawNotification.call.target.lng
          }
      }
    };
    const callerSvgCoords = this.coordsCvrtr.getSvgLocation(call.caller.gps.lat, call.caller.gps.lng);
    const calleeSvgCoords = this.coordsCvrtr.getSvgLocation(call.callee.gps.lat, call.callee.gps.lng);
    const {width: mapWidth, height: mapHeight} = this.getSvgDimensions();
    call.caller.svg = {x: callerSvgCoords.x * mapWidth, y: callerSvgCoords.y * mapHeight};
    call.callee.svg = {x: calleeSvgCoords.x * mapWidth, y: calleeSvgCoords.y * mapHeight};
    const notifRef = {call, options: {removeStart: false}};
    this.notifications.push(notifRef);
    setTimeout(
      () => {
        notifRef.options.removeStart = true;
        setTimeout(() => this.notifications.splice(this.notifications.indexOf(notifRef), 1), 1100);
      }, this.timeout);
  }

}
