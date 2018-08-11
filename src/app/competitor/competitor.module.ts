import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompetitorComponent } from './competitor/competitor.component';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule} from '@angular/forms';

const competitorRoutes: Routes = [
	{
		path: 'competitor',
		component: CompetitorComponent
	}
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		RouterModule.forChild(competitorRoutes)
	],
	declarations: [CompetitorComponent],
	providers: []
})
export class CompetitorModule { }
