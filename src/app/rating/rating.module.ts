import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingComponent } from './rating/rating.component';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule} from '@angular/forms';

const ratingRoutes: Routes = [
	{
		path: 'rating',
		component: RatingComponent
	}
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		RouterModule.forChild(ratingRoutes)
	],
	declarations: [RatingComponent]
})
export class RatingModule { }
