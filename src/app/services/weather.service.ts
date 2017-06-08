import { Injectable } from '@angular/core';
import { Http, Jsonp } from '@angular/http'
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class WeatherService{
    api_key = "ae90bcca3fe03f309f261f05519b03f1"
    url = "https://api.darksky.net/forecast/" + this.api_key + "/**,**?callback=JSONP_CALLBACK";
    // url = '';

    constructor(private _jsonp: Jsonp){
    }
    
    getCurrentWeather(lat: string, lng: string){
        return this._jsonp.get(this.url.replace("**", lat).replace("**", lng))
            .map(response => response)
            .catch(error => {
                console.log("Error fetching JSON");
                return Observable.throw(error.json())
            });
    }
}