import { Injectable } from '@angular/core';
import { Http, Jsonp } from '@angular/http'
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class WeatherService{
    api_key = "ae90bcca3fe03f309f261f05519b03f1"
    url_history = "https://api.darksky.net/forecast/" + this.api_key + "/**,**,**?callback=JSONP_CALLBACK";
    url_data = "https://api.darksky.net/forecast/" + this.api_key + "/**,**?callback=JSONP_CALLBACK";

    constructor(private _jsonp: Jsonp){
    }
    
    getCurrentWeather(lat: string, lng: string){
        return this._jsonp.get(this.url_data.replace("**", lat).replace("**", lng).replace("**", ''))
            .map(response => response)
            .catch(error => {
                console.log("Error fetching JSON");
                return Observable.throw(error.json())
            });
    }

    getWeatherHistory(lat: string, lng: string, ts: string){
        return this._jsonp.get(this.url_history.replace("**", lat).replace("**", lng).replace("**", ts))
            .map(response => response)
            .catch(error => {
                console.log("Error fetching JSON");
                return Observable.throw(error.json())
            });
    }
}