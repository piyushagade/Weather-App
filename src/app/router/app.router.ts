import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from '../components/home/home.component';

export const router: Routes = [
    { path: 'home', component: HomeComponent },
    { path: '', component: HomeComponent },
    { path: 'current', component: HomeComponent },
    { path: 'history', component: HomeComponent },
];

export const routes: ModuleWithProviders = RouterModule.forRoot(router);