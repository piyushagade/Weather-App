import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';

import { routes } from '../router/app.router'
import { environment } from '../../environments/environment';

import { HomeComponent } from '../components/home/home.component';
import { EntryComponent } from '../components/entry/entry.component';
import { CurrentComponent } from '../components/current/current.component';
import { HourlyComponent } from '../components/hourly/hourly.component';
import { DailyComponent } from '../components/daily/daily.component';

import { GeolocationService } from '../services/location.service';
import { WeatherService } from '../services/weather.service';
import { GeocoderService } from '../services/geocoder.service';
import { SharerService } from '../services/sharer.service';

import { AngularFireModule } from 'angularfire2';

import { NgPipesModule } from 'ngx-pipes';
import { RelativeDatePipe } from '../pipes/relative-date.pipe';
import { SmartDatePipe } from '../pipes/smart-date.pipe';

import { ChartsModule } from 'ng2-charts';
import { LocalStorageModule } from 'angular-2-local-storage';


@NgModule({
  declarations: [
    HomeComponent,
    EntryComponent,
    CurrentComponent,
    HourlyComponent,
    DailyComponent,

  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AngularFireModule.initializeApp(environment.firebase),
    routes,
    JsonpModule,
    ChartsModule,

    NgPipesModule,
    LocalStorageModule.withConfig({
        prefix: 'sc-app',
        storageType: 'localStorage'
    })

  ],
  providers: [
    GeolocationService,
    WeatherService,
    GeocoderService,
    SharerService,
    // LocalStorageService,

  ],
  bootstrap: [
    EntryComponent
  ]
})
export class AppModule { }
