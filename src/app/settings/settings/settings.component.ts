import { Component, OnInit } from '@angular/core';
import {RestApiService} from '../../services/rest.api.service';
import {Category} from '../interfaces/Category';
import {Manufacturer} from '../interfaces/Manufacturer';
import {Subcategory} from '../interfaces/Subcategory';
import {SubcategoryToCategory} from '../interfaces/SubcategoryToCategory';
import { IcaEvent } from '../interfaces/IcaEvent';


@Component({
	selector: 'app-settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
	protected events: Array<IcaEvent> = [];
	protected event: IcaEvent;
	protected eventToChange: IcaEvent;
	protected eventsCollapsed = false;

	protected categories: Array<Category> = [];
	protected category: Category;
	protected categoryToChange: Category;
	protected categoriesCollapsed = false;

	protected subcategories: Array<Subcategory> = [];
	protected subcategory: Subcategory;
	protected subcategoryToChange: Subcategory;
	protected subcategoriesCollapsed = false;

	protected manufacturers: Array<Manufacturer> = [];
	protected manufacturer: Manufacturer;
	protected manufacturerToChange: Manufacturer;
	protected manufacturerCollapsed = false;

	protected subcategoriesToCategory: Array<SubcategoryToCategory> = [];
	protected selectedCategory: Category;

	protected index = 0;
	protected showAlertSubcategoriesToCstegory = false;

	constructor(private restApi: RestApiService) {
		this.event = {
			id: null,
			event: null
		};

		this.eventToChange = {
			id: null,
			event: null
		};

		this.category = {
			id: null,
			category: null
		};

		this.categoryToChange = {
			id: null,
			category: null
		};

		this.subcategory = {
			id: null,
			subcategory: null
		};

		this.subcategoryToChange = {
			id: null,
			subcategory: null
		};

		this.manufacturer = {
			id: null,
			label: null
		};

		this.manufacturerToChange = {
			id: null,
			label: null
		};
		this.loadCategories();
		this.loadManufacturers();
		this.loadSubcategories();
		this.loadEvents();
	}

	ngOnInit() {
	}

	/**
	 *
	 */
	private loadEvents() {
		this.restApi.getEvents().subscribe((response: Array<IcaEvent>) => {
			this.events = response;
		}, error => {
			console.log(JSON.stringify(error));
		});
	}

	/**
	 *
	 */
	public addEvent() {
		this.restApi.addEvent(this.event).subscribe((response: IcaEvent) => {
			this.events.push(response);
			this.event = {id: null, event: null};
		}, error => {
			console.log(JSON.stringify(error));
		});
	}

	/**
	 *
	 */
	public updateEvent() {
		this.restApi.updateEvent(this.eventToChange).subscribe(() => {
			const index = this.events.findIndex((item: IcaEvent) => (item.id === this.eventToChange.id) );
			this.events[index].event = this.eventToChange.event;
			this.eventToChange = {
				id: null,
				event: null
			};
		}, error => {
			console.log(JSON.stringify(error));
		});
	}

	/**
	 *
	 * @param {Event} event
	 */
	public setEventToChange(event: IcaEvent) {
		this.eventToChange = event;
	}

	/**
	 *
	 */
	public collapseEvents() {
		this.eventsCollapsed = !this.eventsCollapsed;
	}

	/**
	 *
	 */
	private loadCategories() {
		this.restApi.getCategories().subscribe((response: Array<Category>) => {
			this.categories = response;
		}, error => {
			console.log(JSON.stringify(error));
		});
	}

	/**
	 *
	 */
	public addCategory() {
		this.restApi.addCategory(this.category).subscribe((response: Category) => {
			this.categories.push(response);
			this.category = {id: null, category: null};
		}, error => {
			console.log(JSON.stringify(error));
		});
	}

	/**
	 *
	 */
	public collapseCategories() {
		this.categoriesCollapsed = !this.categoriesCollapsed;
	}

	/**
	 *
	 */
	public loadManufacturers() {
		this.restApi.getManufacturers().subscribe((response: Array<Manufacturer>) => {
			this.manufacturers = response;
		}, error => {
			console.log(JSON.stringify(error));
		});
	}

	/**
	 *
	 */
	public updateCategory() {
		this.restApi.updateCategory(this.categoryToChange).subscribe(() => {
			const index = this.categories.findIndex((item: Category) => (item.id === this.categoryToChange.id) );
			this.categories[index].category = this.categoryToChange.category;
			this.categoryToChange = {
				id: null,
				category: null
			};
		}, error => {
			console.log(JSON.stringify(error));
		});
	}

	/**
	 *
	 * @param {Category} category
	 */
	public setCategoryToChange(category: Category) {
		this.categoryToChange = category;
	}

	/**
	 *
	 */
	public loadSubcategories() {
		this.restApi.getSubcategories().subscribe((response: Array<Subcategory>) => {
			console.log(response);
			this.subcategories = response;
		}, error => {
			console.log(JSON.stringify(error));
		});
	}

	/**
	 *
	 */
	public addSubcategory() {
		this.restApi.addSubcategory(this.subcategory).subscribe((response: Subcategory) => {
			this.subcategories.push(response);
			this.subcategory = {
				id: null,
				subcategory: null
			};
		}, error => {
			console.log(JSON.stringify(error));
		});
	}

	/**
	 *
	 */
	public updateSubcategory() {
		this.restApi.updateSubcategory(this.subcategoryToChange).subscribe(() => {
			const index = this.subcategories.findIndex((item: Subcategory) => (item.id === this.subcategoryToChange.id) );
			this.subcategories[index].subcategory = this.subcategoryToChange.subcategory;
			this.subcategoryToChange = {
				id: null,
				subcategory: null
			};
		}, error => {
			console.log(JSON.stringify(error));
		});
	}

	/**
	 *
	 */
	public collapseSubcategories() {
		this.subcategoriesCollapsed = !this.subcategoriesCollapsed;
	}

	/**
	 *
	 * @param {Subcategory} subcategory
	 */
	public setSubcategoryToChange(subcategory: Subcategory) {
		this.subcategoryToChange = { id: subcategory.id, subcategory: subcategory.subcategory };
	}

	/**
	 *
	 */
	public addManufacturer() {
		this.restApi.addManufacturer(this.manufacturer).subscribe((response: Manufacturer) => {
			this.manufacturer = response;
			this.manufacturers.push(this.manufacturer);
			this.manufacturer = { id: null, label: null };
		}, error => {
			console.log(JSON.stringify(error));
		});
	}

	/**
	 *
	 */
	public updateManufacturer() {
		this.restApi.updateManufacturer(this.manufacturerToChange).subscribe(() => {
			const index = this.manufacturers.findIndex((item: Manufacturer) => (item.id === this.manufacturerToChange.id) );
			this.manufacturers[index].label = this.manufacturerToChange.label;
			this.manufacturerToChange = {
				id: null,
				label: null
			};
		}, error => {
			console.log(JSON.stringify(error));
		});
	}

	/**
	 *
	 */
	public collapseManufacturer() {
		this.manufacturerCollapsed = !this.manufacturerCollapsed;
	}

	/**
	 *
	 * @param {Manufacturer} manufacturer
	 */
	public setManufacturerToChange(manufacturer: Manufacturer) {
		this.manufacturerToChange = manufacturer;
	}

	/**
	 *
	 * @param {Category} category
	 */
	public selectCategory(category: Category) {
		this.selectedCategory = category;
		this.loadSubcategoriesToCategoryByCategory(category);
	}

	/**
	 *
	 * @param {Subcategory} subcategory
	 * @param {Category} category
	 */
	public selectSubcategory(subcategory: Subcategory, category: Category) {
		console.log(subcategory, category);
		const index = this.subcategoriesToCategory.findIndex((element) => {
			return element.subcategoryId === subcategory.id && element.categoryId === category.id;
		});

		if (index !== -1) {
			this.subcategoriesToCategory[index].selected = !this.subcategoriesToCategory[index].selected;
		} else {
			this.subcategoriesToCategory.push({
				subcategoryId: subcategory.id,
				categoryId: category.id,
				selected: true
			});
		}
	}

	/**
	 *
	 */
	public updateSubcategoriesToCategory() {
		this.restApi.updateSubcategoriesToCategory(this.subcategoriesToCategory).subscribe(() => {
			this.showAlertSubcategoriesToCstegory = true;
			setTimeout(() => {
				this.showAlertSubcategoriesToCstegory = false;
			}, 2000);
		}, error => {
			console.log(JSON.stringify(error));
		});
	}

	/**
	 *
	 * @param {Category} category
	 */
	public loadSubcategoriesToCategoryByCategory(category: Category) {
		this.restApi.getSubcategoriesToCategoryByCategory(category).subscribe((result: Array <any>) => {
			this.subcategoriesToCategory = [];
			result.forEach((element) => {
				this.subcategoriesToCategory.push({
					subcategoryId: element.subcategoryid,
					categoryId: element.categoryid,
					selected: element.selected === '1' ? true : false
				});
			});

			console.log(this.subcategoriesToCategory);

		}, error => {
			console.log(JSON.stringify(error));
		});
	}

	/**
	 *
	 * @param {number} id
	 * @return {any}
	 */
	public getSubcategoryNameById(id: number) {
		const index = this.subcategories.findIndex((item: Subcategory) => ( item.id === id));

		if (index !== -1) {
			return this.subcategories[index].subcategory;
		} else {
			return '';
		}
	}

	/**
	 *
	 * @param {Subcategory} subcategory
	 * @param {Category} category
	 * @return {boolean}
	 */
	public isSubcategoryByCategorySelected(subcategory: Subcategory, category: Category) {
		const result = this.subcategoriesToCategory.find((element: SubcategoryToCategory) => {
			return element.subcategoryId === subcategory.id && element.categoryId === category.id;
		});

		if (result) {
			return result.selected;
		} else {
			return false;
		}
	}
}
