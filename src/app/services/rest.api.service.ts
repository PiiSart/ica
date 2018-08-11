import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Competitor} from '../competitor/interfaces/Competitor';
import {Category} from '../settings/interfaces/Category';
import {Manufacturer} from '../settings/interfaces/Manufacturer';
import {Subcategory} from '../settings/interfaces/Subcategory';
import {SubcategoryToCategory} from '../settings/interfaces/SubcategoryToCategory';
import {IcaEvent} from '../settings/interfaces/IcaEvent';
import {SubscribeEvent} from '../competitor/interfaces/SubscribeEvent';

@Injectable()
export class RestApiService {
	private api = 'IcaApi';
	private baseUrl = 'http://192.168.178.25:8080/backend/api/RestApi.php';
	// private baseUrl = 'http://localhost:8080/backend/api/RestApi.php';

	public constructor(private httpClient: HttpClient) {}

	private get(url: string, params?: {}, options?: {}) {
		console.log(this.baseUrl + url);
		return this.httpClient.get(
			this.baseUrl + url,
			Object.assign({}, {headers: this.buildHeaders(), params: params},
				options
			));
	}

	private post(url: string, body: any) {
		return this.httpClient.post(this.baseUrl + url, body, {
			headers: this.buildHeaders()
		});
	}

	private buildHeaders() {
		const httpHeaders = new HttpHeaders().set('api', this.api);
		return httpHeaders;
	}

	/**
	 *
	 * @param {Competitor} $competitor
	 */
	public addCompetitor(competitor: Competitor) {
		return this.post('/addCompetitor', competitor);
	}

	/**
	 *
	 * @return {Observable<Object>}
	 */
	public getCompetitors() {
		return this.get('/getCompetitors');
	}

	/**
	 *
	 * @param {Competitor} competitor
	 * @return {Observable<Object>}
	 */
	public updateCompetitor(competitor: Competitor) {
		return this.post('/updateCompetitor', competitor);
	}

	/**
	 *
	 * @param {number} competitorId
	 * @return {Observable<Object>}
	 */
	public deleteCompetitor(competitorId: number) {
		return this.post('/deleteCompetitor', competitorId);
	}

	/**
	 *
	 * @param {string} event
	 * @return {Observable<Object>}
	 */
	public addEvent(event: IcaEvent) {
		return this.post('/addEvent', event);
	}

	/**
	 *
	 * @return {Observable<Object>}
	 */
	public getEvents() {
		return this.get('/getEvents');
	}

	/**
	 *
	 * @param {IcaEvent} event
	 * @return {Observable<Object>}
	 */
	public updateEvent(event: IcaEvent) {
		return this.post('/updateEvent', event);
	}

	/**
	 *
	 * @param {number} competitorId
	 * @return {Observable<Object>}
	 */
	public getSubscribeEvents(competitorId: number, onlySignUpEvents?: boolean) {
		if (onlySignUpEvents) {
			return this.get('/getSubscribeEvents', {competitorId: competitorId, onlySignUpEvents: onlySignUpEvents});
		} else {
			return this.get('/getSubscribeEvents', {competitorId: competitorId});
		}
	}

	/**
	 *
	 * @param {string} category
	 * @return {Observable<Object>}
	 */
	public addCategory(category: Category) {
		return this.post('/addCategory', category);
	}

	/**
	 *
	 * @return {Observable<Object>}
	 */
	public getCategories() {
		return this.get('/getCategories');
	}

	/**
	 *
	 * @param {Category} category
	 * @return {Observable<Object>}
	 */
	public updateCategory(category: Category) {
		return this.post('/updateCategory', category);
	}

	/**
	 *
	 * @return {Observable<Object>}
	 */
	public getSubcategories() {
		return this.get('/getSubcategories');
	}

	/**
	 *
	 * @param {Subcategory} subcategory
	 * @return {Observable<Object>}
	 */
	public addSubcategory(subcategory: Subcategory) {
		return this.post('/addSubcategory', subcategory);
	}

	/**
	 *
	 * @param {Subcategory} subcategory
	 * @return {Observable<Object>}
	 */
	public updateSubcategory(subcategory: Subcategory) {
		return this.post('/updateSubcategory', subcategory);
	}

	/**
	 *
	 * @return {Observable<Object>}
	 */
	public getManufacturers() {
		return this.get('/getManufacturers');
	}

	/**
	 *
	 * @param {Manufacturer} manufacturer
	 * @return {Observable<Object>}
	 */
	public addManufacturer(manufacturer: Manufacturer) {
		return this.post('/addManufacturer', manufacturer);
	}

	/**
	 *
	 * @param {Manufacturer} manufacturer
	 * @return {Observable<Object>}
	 */
	public updateManufacturer(manufacturer: Manufacturer) {
		return this.post('/updateManufacturer', manufacturer);
	}

	/**
	 *
	 * @param {Array} subcategoriesToCategory
	 * @return {Observable<Object>}
	 */
	public updateSubcategoriesToCategory(subcategoriesToCategory: Array <SubcategoryToCategory>) {
		return this.post('/updateSubcategoriesToCategory', subcategoriesToCategory);
	}

	/**
	 *
	 * @param {Category} categoy
	 * @return {Observable<Object>}
	 */
	public getSubcategoriesToCategoryByCategory(categoy: Category) {
		return this.get('/getSubcategoriesToCategoryByCategory', categoy);
	}

	public updateSubscribeEvents(competitor: Competitor, subscribeEvents: Array<SubscribeEvent>) {
		return this.post('/updateSubcribeEvents', {subscribeEvents, competitor});
	}

	/**
	 *
	 * @param {number} competitorId
	 * @return {Observable<Object>}
	 */
	public getRatingResultsByCompetitor(competitorId: number) {
		return this.get('/getRatingResultsByCompetitor', {competitorId: competitorId});
	}

	/**
	 *
	 * @param results
	 * @return {Observable<Object>}
	 */
	public rateCompetitor(results: any) {
		return this.post('/rateCompetitor', results);
	}

	/**
	 *
	 * @return {Observable<Object>}
	 */
	public getEvaluation() {
		return this.get('/getEvaluation');
	}

	/**
	 *
	 * @return {Observable<Object>}
	 */
	public getKpis() {
		return this.get('/getKpis');
	}
}
