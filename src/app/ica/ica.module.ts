import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IcaComponent } from './ica/ica.component';
import {ChartsModule} from 'ng2-charts';

@NgModule({
	imports: [
		CommonModule,
		ChartsModule
	],
	declarations: [IcaComponent]
})
export class IcaModule { }
