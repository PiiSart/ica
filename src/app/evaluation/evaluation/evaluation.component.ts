import { Component, OnInit } from '@angular/core';
import {RestApiService} from '../../services/rest.api.service';

@Component({
	selector: 'app-evaluation',
	templateUrl: './evaluation.component.html',
	styleUrls: ['./evaluation.component.css']
})
export class EvaluationComponent implements OnInit {
	protected evaluation: Array<any> = [];

	constructor(private restApi: RestApiService) {
		this.loadEvaluation();
	}

	ngOnInit() {
	}

	public loadEvaluation() {
		this.restApi.getEvaluation().subscribe((response: Array<any>) => {
			this.evaluation = response;
		}, error => {
			console.log(error);
		});
	}

}
