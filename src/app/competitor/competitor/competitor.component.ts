import {Component, OnInit} from '@angular/core';
import {RestApiService} from '../../services/rest.api.service';
import {Competitor} from '../interfaces/Competitor';
import {Manufacturer} from '../../settings/interfaces/Manufacturer';
import {Category} from '../../settings/interfaces/Category';
import {IcaEvent} from '../../settings/interfaces/IcaEvent';
import {SubscribeEvent} from '../interfaces/SubscribeEvent';
import * as moment from 'moment';

@Component({
	selector: 'app-competitor',
	templateUrl: './competitor.component.html',
	styleUrls: ['./competitor.component.css']
})
export class CompetitorComponent implements OnInit {
	protected competitor: Competitor;
	protected competitors: Array<Competitor> = [];
	protected searchCompetitor: Competitor;
	protected error: string;
	protected manufacturers: Array<Manufacturer> = [];
	protected categories: Array<Category> = [];
	protected events: Array<IcaEvent> = [];
	protected update = false;
	protected subscribeEvents: Array<SubscribeEvent> = [];

	protected isDateValid = true;

	private DATE_FORMAT = 'DD.MM.YYYY';
	private DATE_FORMAT_PMA = 'YYYY-MM-DD';

	constructor(private restApi: RestApiService) {
		this.competitor = this.getEmptyCompetitor();

		this.loadCompetitors();
		this.loadManufacturers();
		this.loadEvents();
	}

	ngOnInit() {

	}

	/**
	 *
	 */
	public loadEvents() {
		this.restApi.getEvents().subscribe((response: Array<IcaEvent>) => {
			this.events = response;
		}, error => {
			this.error = JSON.stringify(error);
			console.log(error);
			this.unsetError();
		});
	}

	/**
	 *
	 */
	public addCompetitor() {
		this.restApi.addCompetitor(this.competitor).subscribe(response => {
			this.competitor.id = response[0];
			this.updateSubscribeEvents(this.competitor);
			this.competitors.push(this.competitor);
			this.competitor = this.getEmptyCompetitor();
		}, error => {
			const str = JSON.stringify(error);
			if (str.includes('Duplicate entry')) {
				this.error = 'Teilnehmer existiert bereits! ' + JSON.stringify(error.error);
			} else {
				this.error = JSON.stringify(error);
			}
			console.log(error);
			this.unsetError();
		});
	}

	public updateCompetitor(competitor: Competitor) {
		this.restApi.updateCompetitor(competitor).subscribe((respose) => {
			this.updateSubscribeEvents(this.competitor);
			this.update = false;
			this.competitor = this.getEmptyCompetitor();
		}, error => {
			console.log(error);
			this.error = JSON.stringify(error);
			this.unsetError();
		});
	}

	public clearForm() {
		this.competitor = this.getEmptyCompetitor();
	}

	/**
	 *
	 */
	public loadManufacturers() {
		this.restApi.getManufacturers().subscribe((response: Array<Manufacturer>) => {
			this.manufacturers = response;
		}, error => {
			console.log(error);
			this.error = JSON.stringify(error);
			this.unsetError();
		});
	}

	public setManufacturerIdByCompetitor(competitor: Competitor) {
		const index = this.manufacturers.findIndex((item) => (item.label === competitor.manufacturerLabel));

		if (index >= 0) {
			competitor.manufacturerId = this.manufacturers[index].id;
		} else {
			competitor.manufacturerId = null;
			competitor.manufacturerLabel = null;
		}
	}

	public setCurrentCompetitor(competitor: Competitor) {
		this.competitor = competitor;
		this.update = true;
		this.loadSubscribeEvents(competitor);
	}

	public cancel() {
		if (this.update) {
			this.competitor = this.getEmptyCompetitor();
		}
		this.update = false;
	}

	/**
	 *
	 * @param {Competitor} competitor
	 */
	public deleteCompetitor(competitor: Competitor, deleteSearched?: false) {
		this.restApi.deleteCompetitor(competitor.id).subscribe(() => {
			this.competitor = this.getEmptyCompetitor();
			const index = this.competitors.findIndex((item: Competitor) => {
				return item.id === competitor.id;
			});
			// enferne Teilnehmer aus dem Array
			if (index >= 0) {
				this.competitors.splice(index, 1);
			}

			// falls gesuchter Teilnehmer, loesche diesen
			if (deleteSearched) {
				this.searchCompetitor = null;
			}
		}, error => {
			console.log(error);
			this.error = JSON.stringify(error);
			this.unsetError();
		});
	}

	/**
	 *
	 * @param {number} startNumber
	 */
	public searchCompetitorByStartNumber(startNumber: number) {
		console.log(startNumber);
		const index = this.competitors.findIndex((item) => {
			return item.startNumber === startNumber;
		});

		if (index >= 0) {
			this.searchCompetitor = this.competitors[index];
		} else {
			this.searchCompetitor = null;
		}
	}

	/**
	 *
	 * @return {Array}
	 */
	public getFormatedEvents(numberOfItemsPerRow: number) {
		const formatedEvents = [];
		let row: Array<SubscribeEvent> = [];
		this.subscribeEvents.forEach((event, index) => {
			if (index !== 0 && index % numberOfItemsPerRow === 0) {
				formatedEvents.push(row);
				row = [];
			}

			row.push(event);
		});

		formatedEvents.push(row);

		return formatedEvents;
	}

	/**
	 * Laedt aus der Datenbank vom Teilnehmer abbonierte Events.
	 *
	 * @param {Competitor} competitor
	 */
	public loadSubscribeEvents(competitor: Competitor) {
		this.restApi.getSubscribeEvents(competitor.id).subscribe((response: Array<SubscribeEvent>) => {
			if (response.length > 0) {
				this.subscribeEvents = response;
			} else {
				this.loadEmptySubscribeEvents();
			}
		}, error => {
			this.error = JSON.stringify(error);
			console.log(error);
			this.unsetError();
		});
	}

	/**
	 *
	 * @param {Competitor} competitor
	 */
	public updateSubscribeEvents(competitor: Competitor) {
		this.restApi.updateSubscribeEvents(competitor, this.subscribeEvents).subscribe(() => {
			this.competitor = this.getEmptyCompetitor();
		}, error => {
			this.error = JSON.stringify(error);
			console.log(this.error);
			this.unsetError();
		});
	}

	/**
	 * Erzeugt leere Event-Abos
	 */
	public loadEmptySubscribeEvents() {
		this.clearSubscribeEvents();

		this.events.forEach((event) => {
			this.subscribeEvents.push({
				event: event,
				enabled: false
			});
		});
	}

	/**
	 *
	 * @param {SubscribeEvent} item
	 */
	public toggleSubscribeEvent(item: SubscribeEvent) {
		item.enabled = !item.enabled;
		const index = this.subscribeEvents.findIndex((element) => (	element.event.id === item.event.id));
		this.subscribeEvents[index].enabled = item.enabled;
	}

	/**
	 *
	 * @param {string} dateAsString
	 * @return {boolean}
	 */
	public checkDateValid(dateAsString: string) {
		if (dateAsString.length === 0) {
			this.isDateValid = true;
		} else {
			this.isDateValid = moment(dateAsString, this.DATE_FORMAT_PMA, true).isValid();
		}

		return this.isDateValid;
	}

	/**
	 *
	 */
	private clearSubscribeEvents() {
		this.subscribeEvents = [];
	}

	/**
	 *
	 */
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
			});

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

	/**
	 * Konvertiert Datum.
	 *
	 * @param {string} dateAsString
	 * @param pma if false date will be format from dd.mm.yyyy to yyyy-mm-dd
	 * @return {any} formated date or null
	 */
	private getFormatedDate(dateAsString: string, pma?: false) {
		// check Date
		if (pma) {
			if (moment(dateAsString, this.DATE_FORMAT_PMA, true).isValid()) {
				return moment(dateAsString, this.DATE_FORMAT_PMA).format(this.DATE_FORMAT);
			}
		} else {
			// check Date entry
			if (moment(dateAsString, this.DATE_FORMAT, true).isValid()) {
				return moment(dateAsString, this.DATE_FORMAT).format(this.DATE_FORMAT_PMA);
			}
		}

		return null;
	}
}
