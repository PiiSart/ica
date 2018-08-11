import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import { AppComponent } from './app.component';
import {IcaModule} from './ica/ica.module';
import {IcaComponent} from './ica/ica/ica.component';
import {EvaluationModule} from './evaluation/evaluation.module';
import {RatingModule} from './rating/rating.module';
import {CompetitorModule} from './competitor/competitor.module';
import {RestApiService} from './services/rest.api.service';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {SettingsModule} from './settings/settings.module';

const appRoutes: Routes = [
	{
		path: '',	component: IcaComponent,
	}
];

@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		BrowserModule,
		IcaModule,
		EvaluationModule,
		RatingModule,
		HttpClientModule,
		CompetitorModule,
		SettingsModule,
		RouterModule.forRoot(appRoutes)
	],
	providers: [RestApiService, HttpClient],
	bootstrap: [AppComponent]
})
export class AppModule { }
