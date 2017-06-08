import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { GeolocationService } from '../../services/location.service';
import { WeatherService } from '../../services/weather.service';
import { GeocoderService } from '../../services/geocoder.service';
import { SharerService } from '../../services/sharer.service';
import { AngularFire, AuthProviders, AuthMethods, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'sc-current',
    templateUrl: './current.view.html',
    styleUrls: [
        './current.styles.css'
    ],
    providers: [ GeolocationService, WeatherService, GeocoderService ]
})


export class CurrentComponent implements OnInit, OnDestroy{
    user: FirebaseListObservable<any>;
    user_favourites: FirebaseListObservable<any>;
    user_history: FirebaseListObservable<any>;
    name: any;
    username: string;
    uid: string;
    loggedIn= false;
    noCloudData= true;

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
    wd_weatherData_1hr = [];
    wd_weatherData_3hr = [];
    wd_weatherData_9hr = [];

    wd_currently_icon: string = "clear-day";

    favouriteCities: string[] = [];
    searchHistory: string[] = [];

    // Location data
    current_lat: string;
    current_lng: string;
    location_lat: string;
    location_lng: string;
    location_cityName: string;

    barChartData: any[];
    private subscription: Subscription;


  constructor(public af: AngularFire, private _gl: GeolocationService, private _ws: WeatherService, private _gc: GeocoderService, private _s: SharerService) {
    // get messages in the chatroom
    this.user = af.database.list('/users/' + this.uid, {
        query: {
            limitToLast: 100
        }
    });


    this.user.subscribe((response) => {
      if (response.length == 0) {
        this.noCloudData = true;
      }
      else
        this.noCloudData = false;
    });
    
    // Check if user is logged in
    this.af.auth.subscribe(auth => {
      if(auth) {
        this.name = auth;
        this.loggedIn = true;
        this.username = this.name.facebook.displayName;
        this.uid = this.name.facebook.uid;

        this.user_favourites = af.database.list('/users/' + this.uid + '/favourites/', { preserveSnapshot: true });
        this.user_history = af.database.list('/users/' + this.uid + '/history/', {
                                query: { 
                                  limitToLast: 5,
                               }, 
                                preserveSnapshot: true 
                            }
        );
        
        this.user_favourites
            .subscribe(
              snapshots =>{ snapshots.forEach(snapshot => {
              if(this.favouriteCities.indexOf(snapshot.key) == -1) this.favouriteCities.push(snapshot.key);
            });
        })

        this.user_history
            .subscribe(
              snapshots =>{ snapshots.forEach(snapshot => {
              if(this.searchHistory.indexOf(snapshot.key) == -1) this.searchHistory.push(snapshot.key);
            });
        })
        
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

  getCoords(name: string, flag: boolean){
    //Capitalize words
    if(flag) name = name.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()});
    
    // Save serachHistory
    if(this.searchHistory.indexOf(name) != -1){
      this.searchHistory.splice(this.searchHistory.indexOf(name), 1);
      this.af.database.object('/users/' + this.uid + '/history/' + name)
      .remove();
    }

    if(this.searchHistory.length >= 5) {
      console.log("History size greater than 5. Removing " + this.searchHistory[0]);
      this.af.database.object('/users/' + this.uid + '/history/' + this.searchHistory[0])
      .remove();
      this.searchHistory.splice(0, 1);    
      
    }
    
    // Save in array
    this.searchHistory.push(name);

    // Save on cloud
    this.af.database.object('/users/' + this.uid + '/history/' + name)
      .set(Math.floor(Date.now() / 1000))

    
    // Emit event
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
        else if (!res[0].hasOwnProperty('time')) this.onCityNameGet(res);
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

    for(let i = 0; i < this.wd_hourly.data.length; i++){
      let target_1 = this.wd_hourly.data[0].time + 3600;
      let target_3 = this.wd_hourly.data[0].time + 3600 * 3;
      let target_9 = this.wd_hourly.data[0].time + 3600 * 9;
      
      if(this.wd_hourly.data[i].time === target_1) {
        this.wd_weatherData_1hr = this.wd_hourly.data[i];
      }
      if(this.wd_hourly.data[i].time === target_3) {
        this.wd_weatherData_3hr = this.wd_hourly.data[i];
      }
      if(this.wd_hourly.data[i].time === target_9) {
        this.wd_weatherData_9hr = this.wd_hourly.data[i];
      }
      
    }

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

  saveLocation(){
    this.af.database.object('/users/' + this.uid + '/favourites/' + this.cityName)
      .set(Math.floor(Date.now() / 1000))
      .then(_ => console.log('Favourite city set.'));
  }

  removeLocation(){
    this.af.database.object('/users/' + this.uid + '/favourites/' + this.cityName)
      .remove()
      .then(_ => console.log('Favourite city deleted.'));
      
      this.favouriteCities.splice(this.favouriteCities.indexOf(this.cityName), 1);
  }


  favouriteSelected(index){
    this.getCoords(this.favouriteCities[index], false);
  }

  historySelected(index){
    this.getCoords(this.searchHistory[index], false);
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