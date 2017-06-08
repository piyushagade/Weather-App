import { Component, Output, EventEmitter } from '@angular/core';

import { AngularFire, AuthProviders, AuthMethods, FirebaseListObservable } from 'angularfire2';

import { GeolocationService } from '../../services/location.service';
import { WeatherService } from '../../services/weather.service';
import { GeocoderService } from '../../services/geocoder.service';
import { SharerService } from '../../services/sharer.service';
import * as $ from 'jquery';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: [
    '../../../assets/css/main.css',
    '../../../assets/css/spinner.css',
    '../../../assets/css/custom_components.css',
    '../../../assets/css/data.css',
    '../../../assets/css/icons.css'
  ],
  providers: [ GeolocationService, WeatherService, GeocoderService, SharerService ]
})

export class HomeComponent {
  isBusy: boolean = false;
  showChangeLocationTip = false;
  items;
  message: string;
  custom_city = "";

  // Weather information
  weatherData: any;
  cityName: string;
  wd_current_temperature: string = "";
  wd_currently: any = [];
  wd_hourly: any = [];
  wd_daily: any = [];
  wd_timezone: string;
  wd_icon: string;

  wd_currently_icon: string = "clear-day";

  // Location data
  current_lat: string;
  current_lng: string;
  location_lat: string;
  location_lng: string;
  location_cityName: string;

  barChartData: any[] = [
    {data: [], label: 'Hourly forecast'},
  ];

  @Output() weatherReceived = new EventEmitter();
  
  constructor(public af: AngularFire, private _gl: GeolocationService, private _ws: WeatherService, private _gc: GeocoderService, private _s: SharerService) {
    this.items = af.database.list('/users', {
      query: {
        limitToLast: 500
      }
    });

    // Get current coordinates using Geolocation API
    this._gl.getCurrentPosition().forEach(
                (position: Position) => {
                   // Get the name of the place using Google's geocoder API
                   this.current_lat = position.coords.latitude.toString();
                   this.current_lng = position.coords.longitude.toString();
                   this.location_lat = this.current_lat;
                   this.location_lng = this.current_lng;

                   this.getCityName(this.current_lat, this.current_lng);

                   // Get weather data for current coordinates
                  this._ws.getCurrentWeather(this.current_lat, this.current_lng)
                    .subscribe(
                      response => this.weatherData = response,
                      error => console.log("Error while getting weather data"),
                      () => this.onWeatherGet()
                    );    
                }
            )
            .then(() => console.log('Coordinates acquired.'))
            .catch(
                (error: PositionError) => {
                    if (error.code > 0) {
                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                this.message = 'permission denied';
                                break;
                            case error.POSITION_UNAVAILABLE:
                                this.message = 'position unavailable';
                                break;
                            case error.TIMEOUT:
                                this.message = 'position timeout';
                                break;
                        }
                    }
                });
  }

  // Get city name from coordinates acquired in the constructor
  getCityName(lat: string, long: string){
    this._gc.getCityName(lat, long).subscribe(
      response => this.onGetCityName(response),
      error => this.setIdle(),
      () => this.setIdle()
    );
  }

  onGetCityName(response){
    this.cityName = JSON.stringify(response.results[0].formatted_address).replace(/"/g,'');
    if(this.location_cityName === undefined) this.location_cityName = this.cityName;

    // Share cityName
    this._s.sendCityName(this.cityName);
  }

  // Get coordinates from city name when user can switches to another location
  getCoords(name: string){
    this.setBusy();

    // Get the coordinates
    this._gc.getCoords(name).subscribe(
      response => this.getWeatherCustomLocation(name, response.results[0].geometry.location.lat, response.results[0].geometry.location.lng),
        error => this.setIdle(),
      () => this.setIdle() 
    )
  }

  getWeatherCustomLocation(name: string, lat: string, lng: string){
    this.current_lat = lat;
    this.current_lng = lng;

    this.cityName = name;

    // Share cityName
    this._s.sendCityName(this.cityName);

    

    // Get weather data for current coordinates
    this._ws.getCurrentWeather(this.current_lat, this.current_lng)
      .subscribe(
        response => this.weatherData = response,
        error => console.log("Error while getting weather data"),
        () => this.onWeatherGet()
      );    

      this.wd_currently_icon = "cloudy";
  }

  // Show weather from user's location manually
  goToMyLocation(){
    this.getWeatherCustomLocation(this.location_cityName, this.location_lat, this.location_lng);
  }

  // Set variables when new weather data is acquired
  onWeatherGet(){
    this.weatherData = this.weatherData._body;
    this.wd_timezone = this.weatherData.timezone.replace(/_/g," ");

    this.wd_currently = this.weatherData.currently;
    this.wd_hourly = this.weatherData.hourly;
    this.wd_daily = this.weatherData.daily;

    this.wd_currently_icon = this.weatherData.currently.icon.trim();

    // Share data
    this._s.sendWeatherData(this.weatherData);

    // Format current temperature
    this.wd_current_temperature = this.wd_currently.temperature.toString().split(".")[0];

    
 
  }


  // Spinner functions
  spinnerFunction(isBusy){
    if(isBusy) this.setBusy();
    else this.setIdle();
  }

  setBusy(){
    this.isBusy = true;
  }

  setIdle(){
    this.isBusy = false;
  }

  // Chart
  public barChartOptions:any = {
    scaleShowVerticalLines: false,
    scaleShowGridLines : false,
    responsive: true,
    scales: {
        yAxes: [{
            ticks: {
                padding: 20,
                min: 50,
            },
        }], 
    }
  };

  public barChartLabels:string[] = ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'];
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

}
