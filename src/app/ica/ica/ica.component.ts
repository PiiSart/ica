import { Component, OnInit } from '@angular/core';
import {RestApiService} from '../../services/rest.api.service';

@Component({
	selector: 'app-ica',
	templateUrl: './ica.component.html',
	styleUrls: ['./ica.component.css']
})
export class IcaComponent implements OnInit {
	protected kpis: any;

	protected pieChartEventLabels: Array<string> = [];
	protected pieChartEventData: Array<number> = [];

	protected pieChartManufacturerLabels: Array<string> = [];
	protected pieChartManufacturerData: Array<number> = [];

	protected barChartEventData: Array<any> = [];
	protected barChartEventLabels: Array<string> = [];

	protected barChartManufacturerData: Array<any> = [];
	protected barChartManufacturerLabels: Array<string> = [];

	protected status = 'loading';

	protected chartColors: Array<any> = [{
			backgroundColor: '#718da8'
		}];

	constructor(private restApi: RestApiService) {
		this.loadKpis();
	}

	public loadKpis() {
		this.restApi.getKpis().subscribe((response: any) => {
			this.kpis = response;

			this.kpis.numberOfCompetitorsPerEvent.forEach((item) => {
				this.pieChartEventLabels.push(item.event);
				this.pieChartEventData.push(item.numberofcompetitors);
			});

			this.kpis.numberOfCompetitorsPerManufacturer.forEach((item) => {
				this.pieChartManufacturerLabels.push(item.label);
				this.pieChartManufacturerData.push(item.numberofcompetitors);
			});

			this.barChartEventData.push({ data: this.pieChartEventData, label: 'Teilnehmer' });
			this.barChartEventLabels = this.pieChartEventLabels;


			this.barChartManufacturerData.push({ data: this.pieChartManufacturerData, label: 'Teilnehmer' });
			this.barChartManufacturerLabels = this.pieChartManufacturerLabels;

			console.log(this.kpis);

			this.status = 'loaded';
		}, error => {
			console.log(error);
		});
	}


	// Pie



	// events
	public chartClicked(e: any): void {
		console.log(e);
	}

	public chartHovered(e: any): void {
		console.log(e);
	}

	ngOnInit() {
	}

}
