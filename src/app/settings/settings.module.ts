import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings/settings.component';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule} from '@angular/forms';

const settingsRoutes: Routes = [
	{
		path: 'settings',
		component: SettingsComponent
	}
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		RouterModule.forChild(settingsRoutes)
	],
	declarations: [SettingsComponent]
})
export class SettingsModule { }
