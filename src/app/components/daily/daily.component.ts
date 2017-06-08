import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { SharerService } from '../../services/sharer.service';
import { Subscription } from 'rxjs/Subscription';


@Component({
    selector: 'sc-daily',
    templateUrl: './daily.view.html',
    styleUrls: [
        '../../../assets/css/main.css',
        '../../../assets/css/spinner.css',
        '../../../assets/css/data.css',
        '../../../assets/css/icons.css',
        './daily.styles.css'
    ],
})

export class DailyComponent implements OnInit, OnDestroy{
    // Weather information
    @Input() weatherData;
    cityName: string;
    wd_current_temperature: string = "";
    wd_currently: any = [];
    wd_hourly: any = [];
    wd_daily: any = [];
    wd_timezone: string;
    wd_currently_icon: string = "clear-day";
    maxTemperature: number;
    minTemperature: number;

    private subscription: Subscription;

    tipData: string;


  constructor(private _s: SharerService) {

  }

  ngOnInit() {
    this.subscription = this._s.notifyObservable$.subscribe((res) => {
        if (res.hasOwnProperty('currently')) this.onWeatherGet(res);
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onWeatherGet(res){
    this.weatherData = res;
    this.wd_timezone = this.weatherData.timezone.replace(/_/g," ");

    this.wd_currently = this.weatherData.currently;
    this.wd_hourly = this.weatherData.hourly;
    this.wd_daily = this.weatherData.daily;

    this.wd_currently_icon = this.weatherData.currently.icon.trim();

    // Format current temperature
    this.wd_current_temperature = this.wd_currently.temperature.toString().split(".")[0];
  }
}