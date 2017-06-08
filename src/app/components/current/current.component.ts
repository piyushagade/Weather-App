import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { GeolocationService } from '../../services/location.service';
import { WeatherService } from '../../services/weather.service';
import { GeocoderService } from '../../services/geocoder.service';
import { SharerService } from '../../services/sharer.service';
import { AngularFire, AuthProviders, AuthMethods, FirebaseListObservable } from 'angularfire2';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'sc-current',
    templateUrl: './current.view.html',
    styleUrls: [
        '../../../assets/css/main.css',
        '../../../assets/css/spinner.css',
        '../../../assets/css/data.css',
        '../../../assets/css/icons.css',
        './current.styles.css'
    ],
    providers: [ GeolocationService, WeatherService, GeocoderService ]
})


export class CurrentComponent implements OnInit, OnDestroy{
    items: FirebaseListObservable<any>;
    name: any;
    username: string;
    uid: string;
    loggedIn= false;

    isBusy: boolean = true;
    showChangeLocationTip = false;
    custom_city = "";
    @Output() newCityName = new EventEmitter();
    @Output() goToMyLocationEvent = new EventEmitter();
    @Output() isBusyEvent = new EventEmitter();

    // Weather information
    @Input() weatherData;
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

    barChartData: any[];
    private subscription: Subscription;


  constructor(public af: AngularFire, private _gl: GeolocationService, private _ws: WeatherService, private _gc: GeocoderService, private _s: SharerService) {
    this.items = af.database.list('/users', {
      query: {
        limitToLast: 500
      }
    });
    
    // Check if user is logged in
    this.af.auth.subscribe(auth => {
      if(auth) {
        this.name = auth;
        this.loggedIn = true;
        this.username = this.name.facebook.displayName;
        this.uid = this.name.facebook.uid;
        
        this.setIdle();  
      }
      else{
        this.loggedIn = false;
        this.setIdle();    
      }
    });

  }

  // Handle user sessions
  login() {
    this.af.auth.login({
      provider: AuthProviders.Facebook,
      method: AuthMethods.Popup
    })
    this.setBusy();    
  }

  logout() {
     this.af.auth.logout();
     this.name = null;
     this.setBusy();   
  }

  getCoords(name: string){
      this.newCityName.emit(name);
  }

  onChangeLocationFocus(){
    this.showChangeLocationTip = true;
  }

  onChangeLocationBlur(){
    this.showChangeLocationTip = false;
  }

  ngOnInit() {
    this.subscription = this._s.notifyObservable$.subscribe((res) => {
        if (res.hasOwnProperty('currently')) this.onWeatherGet(res);
        else  this.onCityNameGet(res);
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

  onCityNameGet(res){
      this.cityName = res;

        // Reset input box
        this.custom_city = "";
  }

  // Show weather from user's location manually
  goToMyLocation(){
    this.goToMyLocationEvent.emit();
  }




  // Spinner functions
  setBusy(){
    this.isBusy = true;
    this.isBusyEvent.emit(this.isBusy);
  }

  setIdle(){
    this.isBusy = false;
    this.isBusyEvent.emit(this.isBusy);
  }
}