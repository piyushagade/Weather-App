import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { GeolocationService } from '../../services/location.service';
import { WeatherService } from '../../services/weather.service';
import { GeocoderService } from '../../services/geocoder.service';
import { SharerService } from '../../services/sharer.service';
import { AngularFire, AuthProviders, AuthMethods, FirebaseListObservable } from 'angularfire2';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'sc-hourly',
    templateUrl: './hourly.view.html',
    styleUrls: [
        '../../../assets/css/main.css',
        '../../../assets/css/spinner.css',
        '../../../assets/css/data.css',
        '../../../assets/css/icons.css',
        './hourly.styles.css'
    ],
    providers: [ GeolocationService, WeatherService, GeocoderService ]
})


export class HourlyComponent implements OnInit, OnDestroy{
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

    barChartData: any[] = [
        {data: [], label: 'Hourly forecast'},
    ];

    barChartIcons = [];

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

    // Build chart data
    for (let j = 0; j < 12; j++) {
        this.barChartData[0].data[j] = this.wd_hourly.data[j].temperature;

        if(this.minTemperature < parseInt(this.wd_hourly.data[j].temperature)) this.minTemperature = parseInt(this.wd_hourly.data[j].temperature);
        if(this.maxTemperature < parseInt(this.wd_hourly.data[j].temperature)) this.maxTemperature = parseInt(this.wd_hourly.data[j].temperature);
    }

    let _newChartData:Array<any> = new Array(this.barChartData.length);
    for (let i = 0; i < this.barChartData.length; i++) {
      _newChartData[i] = {data: new Array(this.barChartData[i].data.length), label: this.barChartData[i].label};
      for (let j = 0; j < this.barChartData[i].data.length; j++) {
        _newChartData[i].data[j] = this.wd_hourly.data[j].temperature;
      }
    }
    this.barChartData = _newChartData;

    //Build chart x labels
    for(let i = 0; i < 12; i++){
        let hours = new Date(this.wd_hourly.data[i].time * 1000).getHours();
        let ampm = "";

        if(hours === 0){
            ampm = " AM";
            hours = 12;
        }
        else{
            hours = new Date(this.wd_hourly.data[i].time * 1000).getHours() > 12 ? hours - 12 : hours;
            ampm = new Date(this.wd_hourly.data[i].time * 1000).getHours() >= 12 ? " PM" : " AM";
        }

      this.barChartLabels[i] = hours.toString() + ampm ;
    }

    //Build chart x icons
    for(let i = 0; i < 12; i++){
      this.barChartIcons[i] = this.wd_hourly.data[i].icon;
    }
    
  }

  // Chart
  public barChartOptions:any = {
    scaleShowVerticalLines: false,
    scaleShowGridLines : false,
    responsive: true,
    scales: {
        yAxes: [{
            margin: 10,
            ticks: {
                padding: 20,

            },
            scaleLabel: {
                display: true,
                labelString: ''
            }
        }], 
    }
  };

  public barChartLabels:string[] = [];
  public barChartType:string = 'line';
  public barChartLegend:boolean = false;




  // events
  public chartClicked(e:any):void {
    console.log(e);
  }
 
  public chartHovered(e:any):void {
    console.log(e);
  }

  public lineChartColors:Array<any> = [
    {  // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];

  showTip(data){
    this.tipData = data;
  }

}