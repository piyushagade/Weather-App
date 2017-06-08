import { Component, Output, EventEmitter, animate, style, state, transition, trigger } from '@angular/core';

import { AngularFire, AuthProviders, AuthMethods, FirebaseListObservable } from 'angularfire2';

import { GeolocationService } from '../../services/location.service';
import { WeatherService } from '../../services/weather.service';
import { GeocoderService } from '../../services/geocoder.service';
import { SharerService } from '../../services/sharer.service';
import * as $ from 'jquery';

@Component({
  selector: 'app-home',
  templateUrl: './home.view.html',
  styleUrls: [
    '../../../assets/css/main.css',
    '../../../assets/css/spinner.css',
    './home.styles.css'
  ],
  providers: [ GeolocationService, WeatherService, GeocoderService, SharerService ],
  animations: [
    trigger("fadeInOut", [
      state("open", style({opacity: 1})),
      state("closed", style({opacity: 0})),
      transition("open => closed", animate( "1200ms" )),
      transition("closed => open", animate( "400ms" )),
    ])
  ],
})

export class HomeComponent {
  isBusy: boolean = true;
  showChangeLocationTip = false;
  items;
  message: string;
  custom_city = "";

  weatherLoaded = false;
  locationDenied: boolean = false;


  // Weather information
  weatherData: any;
  weatherHistory: Object[] = [];
  factor = [1, 7, 30, 180, 365, 1825, 3650, 7300];

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
    this.isBusy = true;
    this._gl.getCurrentPosition().forEach(
                (position: Position) => {
                   // Get the name of the place using Google's geocoder API
                   this.current_lat = position.coords.latitude.toString();
                   this.current_lng = position.coords.longitude.toString();
                   this.location_lat = this.current_lat;
                   this.location_lng = this.current_lng;

                   this.getCityName(this.current_lat, this.current_lng);

                   // Get weather data for current coordinates
                  this.weatherLoaded = false;
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
                                console.log("Location denied");
                                this.onLocationDeny();
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
      error => console.log("Couldn't get city name.")
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
      error => console.log("Couldn't get coordinates.")
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
    // Set idle
    this.setIdle();

    this.weatherData = this.weatherData._body;
    this.wd_timezone = this.weatherData.timezone.replace(/_/g," ");

    this.wd_currently = this.weatherData.currently;
    this.wd_hourly = this.weatherData.hourly;
    this.wd_daily = this.weatherData.daily;

    this.wd_currently_icon = this.weatherData.currently.icon.trim();

    // Share data
    this._s.sendWeatherData(this.weatherData);
    this._s.sendWeatherHistory(this.weatherHistory);

    // Format current temperature
    this.wd_current_temperature = this.wd_currently.temperature.toString().split(".")[0];


    // Get weather history for current coordinates
      for(let i = 0; i < this.factor.length; i++){
          let time = this.wd_currently.time - 86400 * this.factor[i];
          
          this._ws.getWeatherHistory(this.current_lat, this.current_lng, time.toString())
            .subscribe(
              response => this.weatherHistory.push(response._body.currently),
              error => console.log("Error while getting weather history"),
              () => this.onWeatherHistoryGet()
            );
      }
  }

  onLocationDeny(){
    this.locationDenied = true;
    this.getCoords('New Delhi');
  }

  onWeatherHistoryGet(){    
    // Share data
    this._s.sendWeatherHistory(this.weatherHistory);
  }


  // Spinner functions
  spinnerFunction(isBusy){
    if(isBusy) this.setBusy();
    else this.setIdle();
  }

  setBusy(){
    this.weatherLoaded = false;
    this.isBusy = true;
  }

  setIdle(){
    this.isBusy = false;
    setTimeout(function() {
      this.weatherLoaded = true;
    }.bind(this), 1400);
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
