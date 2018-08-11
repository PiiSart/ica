import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Route} from '@angular/router';
import {Competitor} from '../../competitor/interfaces/Competitor';
import {RestApiService} from '../../services/rest.api.service';
import {isUndefined} from 'util';
import {SubscribeEvent} from '../../competitor/interfaces/SubscribeEvent';

@Component({
	selector: 'app-rating',
	templateUrl: './rating.component.html',
	styleUrls: ['./rating.component.css']
})
export class RatingComponent implements OnInit {
	protected competitors: Array<Competitor> = [];
	protected error: string;
	protected competitorToRate: Competitor;
	protected subscribeEvents: Array<SubscribeEvent> = [];
	protected ratingResults: Array<any> = [];
	protected categoryLabels: Array<string> = [];

	constructor(private route: ActivatedRoute, private restApi: RestApiService) {
		this.loadCompetitors();
	}

	ngOnInit() {
	}

	private loadCompetitors() {
		this.restApi.getCompetitors().subscribe((response: Array<any>) => {
			response.forEach((value) => {
				this.competitors.push(
					{
						id: value.id,
						startNumber: value.startnumber,
						nickname: value.nickname,
						licensePlate: value.licenseplate,
						manufacturerId: value.manufacturerid,
						manufacturerLabel: value.label,
						model: value.model,
						buildYear: value.buildyear,
						registrationDate: value.registrationdate,
						ps: value.ps,
						notice: value.notice,
						isRated: value.israted === '0' ? false : true,
						picture: value.picture
					}
				);
				console.log(this.competitors);
			});

			const startNumber = this.route.snapshot.params['startNumber'];
			if (startNumber) {
				this.setCompetitorToRateByStartNumber(this.route.snapshot.params['startNumber']);
			}
		}, error => {
			this.error = JSON.stringify(error);
			console.log(error);
			this.unsetError();
		});
	}

	/**
	 * Laedt aus der Datenbank vom Teilnehmer abbonierte Events.
	 *
	 * @param {Competitor} competitor
	 */
	public loadSubscribeEvents(competitor: Competitor) {
		this.restApi.getSubscribeEvents(competitor.id, true).subscribe((response: Array<any>) => {
			this.subscribeEvents = [];
			response.forEach((item) => {
				if (item.enabled) {
					this.subscribeEvents.push(item);
				}
			});
		}, error => {
			this.error = JSON.stringify(error);
			console.log(error);
			this.unsetError();
		});
	}

	public loadRatingResultsByCompetitor(competitorId: number) {
		this.restApi.getRatingResultsByCompetitor(competitorId).subscribe((response: any) => {
			this.ratingResults = response;
			this.categoryLabels = Object.keys(this.ratingResults);
		}, error => {
			this.error = JSON.stringify(error);
			console.log(error);
			this.unsetError();
		});
	}

	public setCompetitorToRateByStartNumber(startNumber: number) {
		this.competitorToRate = this.competitors.find((item) => (item.startNumber === startNumber));
		if (this.competitorToRate) {
			this.loadSubscribeEvents(this.competitorToRate);
			this.loadRatingResultsByCompetitor(this.competitorToRate.id);
		} else {
			// alter nicht gefunden
		}
	}

	/**
     *
	 * @param ratingResults
	 */
	public rateCompetitor(ratingResults: any) {
	    let results = [];

	    this.categoryLabels.forEach((label) => {
	        results = results.concat(this.ratingResults[label]);
        });

		this.restApi.rateCompetitor(results).subscribe((response) => {
			this.competitorToRate.isRated = true;
		}, error => {
			this.error = JSON.stringify(error);
			console.log(this.error);
			this.unsetError();
		});
	}

	/**
	 *
	 * @return {Competitor}
	 */
	private getEmptyCompetitor(): Competitor {
		return {
			id: null,
			startNumber: null,
			nickname: null,
			licensePlate: null,
			manufacturerId: null,
			manufacturerLabel: null,
			model: null,
			buildYear: null,
			registrationDate: null,
			ps: null,
			notice: null,
			isRated: false,
			picture: null
		};
	}

	/**
	 *
	 */
	private unsetError() {
		setTimeout(() => {
			this.error = null;
		}, 5000);
	}
}
