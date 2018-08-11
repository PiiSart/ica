import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvaluationComponent } from './evaluation/evaluation.component';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule} from '@angular/forms';

const evaluationRoutes: Routes = [
	{
		path: 'evaluation',
		component: EvaluationComponent
	}
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		RouterModule.forChild(evaluationRoutes)
	],
	declarations: [EvaluationComponent]
})
export class EvaluationModule {

}
