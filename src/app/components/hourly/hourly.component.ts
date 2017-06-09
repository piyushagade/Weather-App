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
        './hourly.styles.css',
        '../../../assets/css/main.css'
    ],
    providers: [ GeolocationService, WeatherService, GeocoderService ]
})


export class HourlyComponent implements OnInit, OnDestroy{
    // Weather information
    @Input() weatherData;
    @Input() weatherHistory;
    
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

    barChartData_temperature: any[] = [
        {data: [], label: 'Hourly'},
    ];
    barChartData_humidity: any[] = [
        {data: [], label: 'Hourly'},
    ];
    barChartData_windSpeed: any[] = [
        {data: [], label: 'Hourly'},
    ];
    barChartData_pressure: any[] = [
        {data: [], label: 'Hourly'},
    ];

    historyChartData: any[] = [
        {data: [], label: 'History'},
    ];

    historyChartLabels: any[] = [];

    historyChartData_temperature: any[] = [
        {data: [], label: 'History'},
    ];
    historyChartData_humidity: any[] = [
        {data: [], label: 'History'},
    ];
    historyChartData_windSpeed: any[] = [
        {data: [], label: 'History'},
    ];
    historyChartData_pressure: any[] = [
        {data: [], label: 'History'},
    ];

    barChartIcons = [];

    private subscription: Subscription;

    mode: string = "hourly";
    metric: string = "temperature";


  constructor(private _s: SharerService) {

  }

  ngOnInit() {
    this.subscription = this._s.notifyObservable$.subscribe((res) => {
        if (res.hasOwnProperty('currently')) this.onWeatherGet(res);
        else if (res.length > 0 && res[0].hasOwnProperty('time')) this.onWeatherHistoryGet(res);
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

    let _newChartData_temperature:Array<any> = new Array(this.barChartData.length);
    let _newChartData_humidity:Array<any> = new Array(this.barChartData.length);
    let _newChartData_windSpeed:Array<any> = new Array(this.barChartData.length);
    let _newChartData_pressure:Array<any> = new Array(this.barChartData.length);

    for (let i = 0; i < this.barChartData.length; i++) {
      _newChartData_temperature[i] = {data: new Array(12), "label": 'Hourly'};
      _newChartData_humidity[i] = {data: new Array(12), "label": 'Hourly'};
      _newChartData_windSpeed[i] = {data: new Array(12), "label": 'Hourly'};
      _newChartData_pressure[i] = {data: new Array(12), "label": 'Hourly'};

      for (let j = 0; j < 12; j++) {
        _newChartData_temperature[i].data[j] = this.wd_hourly.data[j].temperature;
        _newChartData_humidity[i].data[j] = this.wd_hourly.data[j].humidity;
        _newChartData_windSpeed[i].data[j] = this.wd_hourly.data[j].windSpeed;
        _newChartData_pressure[i].data[j] = this.wd_hourly.data[j].pressure;
      }
    }

    this.barChartData_temperature = _newChartData_temperature;
    this.barChartData_humidity = _newChartData_humidity;
    this.barChartData_windSpeed =  _newChartData_windSpeed;
    this.barChartData_pressure = _newChartData_pressure;

    
    if(this.metric == 'temperature') this.barChartData = _newChartData_temperature;
    else if(this.metric == 'humidity') this.barChartData = _newChartData_humidity;
    else if(this.metric == 'windSpeed') this.barChartData = _newChartData_windSpeed;
    else if(this.metric == 'pressure') this.barChartData = _newChartData_pressure;



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
    maintainAspectRatio: false,
    scales: {
        yAxes: [{
            ticks: {
                fontColor: '#333'

            },
            scaleLabel: {
                display: true,
                labelString: ''
            }
        }], 
        xAxes: [{
            ticks: {
                fontColor: '#333',

            },
            gridLines: {
                    display: false,
                },
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

  public barChartColors:Array<any> = [
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

  changeMode(mode){
    this.mode = mode;
  }


  changeMetric(metric){
    this.metric = metric;
    
    if(this.metric == 'temperature') this.barChartData = this.barChartData_temperature;
    else if(this.metric == 'humidity') this.barChartData = this.barChartData_humidity;
    else if(this.metric == 'windSpeed') this.barChartData = this.barChartData_windSpeed;
    else if(this.metric == 'pressure') this.barChartData = this.barChartData_pressure;

    if(this.metric == 'temperature') this.historyChartData = this.historyChartData_temperature;
    else if(this.metric == 'humidity') this.historyChartData = this.historyChartData_humidity;
    else if(this.metric == 'windSpeed') this.historyChartData = this.historyChartData_windSpeed;
    else if(this.metric == 'pressure') this.historyChartData = this.historyChartData_pressure;
  }



  onWeatherHistoryGet(res){
    this.weatherHistory = res;
    
    if(this.weatherHistory.length == 8){
      
        let _newChartData_temperature:Array<any> = new Array(1);
        let _newChartData_humidity:Array<any> = new Array(1);
        let _newChartData_windSpeed:Array<any> = new Array(1);
        let _newChartData_pressure:Array<any> = new Array(1);

        _newChartData_temperature[0] = {data: new Array(this.historyChartData[0].data.length), label: "Temperature"};
        _newChartData_humidity[0] = {data: new Array(this.historyChartData[0].data.length), label: "Humidity"};
        _newChartData_windSpeed[0] = {data: new Array(this.historyChartData[0].data.length), label: "Wind speed"};
        _newChartData_pressure[0] = {data: new Array(this.historyChartData[0].data.length), label: "Pressure"};

          for (let j = 0; j < this.weatherHistory.length; j++) {
            _newChartData_temperature[0].data[j] = this.weatherHistory[j].temperature;
            _newChartData_humidity[0].data[j] = this.weatherHistory[j].humidity;
            _newChartData_windSpeed[0].data[j] = this.weatherHistory[j].windSpeed;
            _newChartData_pressure[0].data[j] = this.weatherHistory[j].pressure;
          }
        
        this.historyChartData_temperature = _newChartData_temperature;
        this.historyChartData_humidity = _newChartData_humidity;
        this.historyChartData_windSpeed =  _newChartData_windSpeed;
        this.historyChartData_pressure = _newChartData_pressure;

        
        if(this.metric == 'temperature') this.historyChartData = _newChartData_temperature;
        else if(this.metric == 'humidity') this.historyChartData = _newChartData_humidity;
        else if(this.metric == 'windSpeed') this.historyChartData = _newChartData_windSpeed;
        else if(this.metric == 'pressure') this.historyChartData = _newChartData_pressure;

        this.historyChartLabels = ["A day ago", "A week ago", "A month ago", "6 months ago", "A year ago", "5 years ago", "A decade ago", "20 years ago"];
        
      }    
  }

}