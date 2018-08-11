<?php
/**
 * Created by PhpStorm.
 * User: viwe
 * Date: 19.07.18
 * Time: 12:25
 */

require_once "RestApi.php";


class IcaApi extends RestApi {

	/**
	 * @param $competitor
	 * @throws Exception
	 */
	public function addCompetitor($competitor) {
		if (is_null($competitor)) {
			throw new Exception("Competitor object is null!");
		}

		/*if (!preg_match("/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/", $competitor->registrationDate)) {
			$competitor->registrationDate = null;
		}*/

		$db = $this->getDbCon();

		$sth = $db->prepare("
			INSERT INTO ica.competitors
			(startNumber, nickname, licensePlate, manufacturerId, model, buildYear, registrationDate, ps, notice, isRated, picture)
			VALUES (?,?,?,?,?,?,?,?,?,?)
		");

		try {
			$sth->execute(array(
				$competitor->startNumber,
				$competitor->nickname,
				$competitor->licensePlate,
				$competitor->manufacturerId,
				$competitor->model,
				$competitor->buildYear,
				empty($competitor->registrationDate) ? null : date('Y-m-d', strtotime($competitor->registrationDate)),
				$competitor->ps,
				$competitor->notice,
				$competitor->isRated,
				$competitor->picture));

			return array($db->lastInsertId());
		} catch (Exception $e) {
			$this->returnError(500, $e->getMessage());
		}
	}

	/**
	 * @return array
	 */
	public function getCompetitors() {
		$db = $this->getDbCon();

		try {
			$res = $db->query("
				SELECT competitors.*, manufacturers.label
				FROM ica.competitors
				LEFT JOIN ica.manufacturers ON manufacturers.id = competitors.manufacturerId	
			");

			return $res->fetchAll();
		} catch (Exception $e) {
			$this->returnError(500, $e->getMessage());
		}
	}

	/**
	 * @param $competitorId
	 */
	public function deleteCompetitor($competitorId) {
		$db = $this->getDbCon();
		$db->beginTransaction();

		// loesche Bewertungen
		$sth = $db->prepare("
			DELETE FROM ica.rating
			WHERE competitorId = ?
		");

		try {
			$sth->execute(array($competitorId));
		} catch (Exception $e) {
			$db->rollBack();
			$this->returnError(500, $e->getMessage());
		}

		// loesche gebuchte Events
		$sth = $db->prepare("
			DELETE FROM ica.subscribeEvents
			WHERE competitorId = ?
		");

		try {
			$sth->execute(array($competitorId));
		} catch (Exception $e) {
			$db->rollBack();
			$this->returnError(500, $e->getMessage());
		}

		// losche Teilnehmer
		$sth = $db->prepare("
			DELETE FROM ica.competitors
			WHERE id = ?
		");

		try {
			$sth->execute(array($competitorId));

		} catch (Exception $e) {
			$db->rollBack();
			$this->returnError(500, $e->getMessage());
		}

		$db->commit();
	}

	/**
	 * @param $competitor
	 */
	public function updateCompetitor($competitor) {
		$db = $this->getDbCon();

		/*if (!preg_match("/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/", $competitor->registrationDate)) {
			$competitor->registrationDate = null;
		}*/

		$sth = $db->prepare("
			UPDATE ica.competitors
			SET nickname = ?, licensePlate= ?, manufacturerId = ?, model = ?, buildYear = ?, registrationDate = ?, ps = ?, notice = ?, isRated = ?, picture = ?
			WHERE id = ?
		");

		try {
			$sth->execute(array(
				$competitor->nickname,
				$competitor->licensePlate,
				$competitor->manufacturerId,
				$competitor->model,
				$competitor->buildYear,
				empty($competitor->registrationDate) ? null : date('Y-m-d', strtotime($competitor->registrationDate)),
				$competitor->ps,
				$competitor->notice,
				$competitor->isRated,
				$competitor->picture,
				$competitor->id
			));

		} catch (Exception $e) {
			$this->returnError(500, $e->getMessage());
		}
	}

	/**
	 * @return array
	 */
	public function getCompetitorByStartNumber($startNumber) {
		$db = $this->getDbCon();

		$sth = $db->prepare("
			SELECT competitors.*, manufacturers.label 
			FROM ica.competitors
			LEFT JOIN ica.manufacturers ON manufacturers.id = competitors.manufacturerId
		 	WHERE competitors.startNumber = ?
		");

		try {
			$sth->execute(array($startNumber));

			return $sth->fetchAll();
		} catch (Exception $e) {
			$this->returnError(500, $e->getMessage());
		}
	}

	/**
	 * @param $category
	 * @return string
	 */
	public function addEvent($event) {
		$db = $this->getDbCon();
		$sth = $db->prepare("
			INSERT INTO ica.events 
			(event)
			VALUES (?)
		");

		try {
			$sth->execute(array($event->event));
			$event->id = $db->lastInsertId();
			return $event;
		} catch (Exception $e) {
			$this->returnError(500, $e->getMessage());
		}
	}

	/**
	 * @param $category
	 * @return mixed
	 */
	public function updateEvent($event) {
		$db = $this->getDbCon();
		$sth = $db->prepare("
			UPDATE ica.events SET event=?
			WHERE id=?
		");

		try {
			$sth->execute(array($event->event, $event->id));
		} catch (Exception $e) {
			$this->returnError(500, $e->getMessage());
		}
	}

	/**
	 * @return array
	 */
	public function getEvents() {
		$db = $this->getDbCon();
		$res = $db->query("
			SELECT * FROM ica.events
			ORDER BY id ASC
		");

		return $res->fetchAll();
	}

	/**
	 * @param $competitorId
	 * @return array
	 */
	public function getSubscribeEvents($competitorId, $onlySignUpEvents = false) {
		$db = $this->getDbCon();

		if ($onlySignUpEvents) {
			/*$sth = $db->prepare("
				SELECT subscribeEvents.competitorId, subscribeEvents.eventId, events.event, subscribeEvents.enabled 
				FROM ica.subscribeEvents
				JOIN ica.events ON events.id = subscribeEvents.eventId
				WHERE competitorId = ? AND subscribeEvents.enabled = 1
			");*/
			$sth = $db->prepare("
				SELECT 
					events.*, 
					(SELECT enabled 
						FROM ica.subscribeEvents 
						WHERE subscribeEvents.competitorId = ? 
						AND events.id = subscribeEvents.eventId
						AND subscribeEvents.enabled = 1) AS enabled 
					FROM ica.events
			");
		} else {
			/*$sth = $db->prepare("
				SELECT subscribeEvents.competitorId, subscribeEvents.eventId, events.event, subscribeEvents.enabled 
				FROM ica.subscribeEvents
				JOIN ica.events ON events.id = subscribeEvents.eventId
				WHERE competitorId = ?
			");*/
			$sth = $db->prepare("
				SELECT 
					events.*, 
					(SELECT enabled FROM ica.subscribeEvents WHERE subscribeEvents.competitorId = ? AND events.id = subscribeEvents.eventId) AS enabled 
					FROM ica.events
			");
		}

		try {
			$sth->execute(array($competitorId));

			$subscribeEvents = array();

			while ($row = $sth->fetch()) {
				$subscribeEvent = new stdClass();
				$event = new stdClass();

				$event->id = $row->id;
				$event->event = $row->event;

				$subscribeEvent->event = $event;
				$subscribeEvent->enabled = $row->enabled == 1 ? true : false;

				array_push($subscribeEvents, $subscribeEvent);
			}

			return $subscribeEvents;
		} catch (Exception $e) {
			$this->returnError(500, $e->getMessage());
		}
	}

	public function updateSubcribeEvents($value) {
		$competitor = $value->competitor;
		$subscribeEvents = $value->subscribeEvents;
		$db = $this->getDbCon();

		foreach ($subscribeEvents as $element) {
			$sth = $db->prepare("
				INSERT INTO ica.subscribeEvents (competitorId, eventId, enabled) 
				VALUES (?,?,?) ON DUPLICATE KEY UPDATE enabled = ?
			");

			try {
				$sth->execute(array($competitor->id, $element->event->id, $element->enabled, $element->enabled));
			} catch (Exception $e) {
				$this->returnError(500, $e->getMessage());
			}
		}
	}


	/**
	 * @param $category
	 * @return string
	 */
	public function addCategory($category) {
		$db = $this->getDbCon();
		$sth = $db->prepare("
			INSERT INTO ica.categories 
			(category)
			VALUES (?)
		");

		try {
			$sth->execute(array($category->category));
			$category->id = $db->lastInsertId();
			return $category;
		} catch (Exception $e) {
			$this->returnError(500, $e->getMessage());
		}
	}

	/**
	 * @param $category
	 * @return mixed
	 */
	public function updateCategory($category) {
		$db = $this->getDbCon();
		$sth = $db->prepare("
			UPDATE ica.categories SET category=?
			WHERE id=?
		");

		try {
			$sth->execute(array($category->category, $category->id));
		} catch (Exception $e) {
			$this->returnError(500, $e->getMessage());
		}
	}

	/**
	 * @return array
	 */
	public function getCategories() {
		$db = $this->getDbCon();
		$res = $db->query("
			SELECT * FROM ica.categories
			ORDER BY id ASC
		");

		return $res->fetchAll();
	}

	/**
	 * @return array
	 */
	public function getManufacturers() {
		$db = $this->getDbCon();
		$res = $db->query("
			SELECT * FROM ica.manufacturers
			ORDER BY label ASC
		");

		return $res->fetchAll();
	}

	/**
	 * @param $manufacturer
	 * @return mixed
	 */
	public function addManufacturer($manufacturer) {
		$db = $this->getDbCon();
		$sth = $db->prepare("
			INSERT INTO ica.manufacturers 
			(label)
			VALUES (?)
		");

		try {
			$sth->execute(array($manufacturer->label));
			$manufacturer->id = $db->lastInsertId();
			return $manufacturer;
		} catch (Exception $e) {
			$this->returnError(500, $e->getMessage());
		}
	}

	/**
	 * @param $manufacturer
	 * @return mixed
	 */
	public function updateManufacturer($manufacturer) {
		$db = $this->getDbCon();
		$sth = $db->prepare("
			UPDATE ica.manufacturers SET label=?
			WHERE id=?
		");

		try {
			$sth->execute(array($manufacturer->label, $manufacturer->id));
		} catch (Exception $e) {
			$this->returnError(500, $e->getMessage());
		}
	}

	/**
	 * @return array
	 */
	public function getSubcategories() {
		$db = $this->getDbCon();
		$res = $db->query("
			SELECT * FROM ica.subcategories 
		");

		return $res->fetchAll();
	}

	/**
	 * @param $subcategory
	 * @return mixed
	 */
	public function addSubcategory($subcategory) {
		$db = $this->getDbCon();
		$sth = $db->prepare("
			INSERT INTO ica.subcategories 
			(subcategory)
			VALUES (?)
		");

		try {
			$sth->execute(array($subcategory->subcategory));
			$subcategory->id = $db->lastInsertId();
			return $subcategory;
		} catch (Exception $e) {
			$this->returnError(500, $e->getMessage());
		}
	}

	/**
	 * @param $subcategory
	 */
	public function updateSubcategory($subcategory) {
		$db = $this->getDbCon();
		$sth = $db->prepare("
			UPDATE ica.subcategories SET subcategory=?
			WHERE id=?
		");

		try {
			$sth->execute(array($subcategory->subcategory, $subcategory->id));
		} catch (Exception $e) {
			$this->returnError(500, $e->getMessage());
		}
	}

	/**
	 * @param $subcategory
	 * @param $category
	 */
	public function addSubcategoryToCategory($subcategory, $category) {
		$db = $this->getDbCon();
		$sth = $db->prepare("
			INSERT INTO ica.subcategoriesToCategories 
			(subcategoryId, categoryId)
			VALUES (?,?)
		");

		try {
			$sth->execute(array($subcategory->id, $category->id));
		} catch (Exception $e) {
			$this->returnError(500, $e->getMessage());
		}
	}

	/**
	 * @param $subcategoriesToCategories
	 */
	public function updateSubcategoriesToCategory($subcategoriesToCategory) {
		$db = $this->getDbCon();
		$db->beginTransaction();

		foreach ($subcategoriesToCategory as $element) {
			$sth = $db->prepare("
				INSERT INTO ica.subcategoriesToCategories (subcategoryId, categoryId, selected) 
				VALUES (?,?,?) ON DUPLICATE KEY UPDATE selected = ?
			");

			try {
				$sth->execute(array($element->subcategoryId, $element->categoryId, $element->selected, $element->selected));
			} catch (Exception $e) {
				$db->rollBack();
				$this->returnError(500, $e->getMessage());
			}
		}

		// aktualisierte Rating-Tabelle. Wenn eine Kategory neue Unterkategory bekommen oder verliert, musss die
		// die Wertung zu dieser Kategory+Unterkategory entweder aktiviert oder deaktiviert werden.

		$res = $db->query("SELECT competitorId FROM ica.rating GROUP BY competitorId");
		$competitorIds = $res->fetchAll();

		foreach ($competitorIds as $competitorId) {
			foreach ($subcategoriesToCategory as $element) {
				$sth = $db->prepare("
					INSERT INTO ica.rating (competitorId, categoryId, subcategoryId) 
					VALUES (?,?,?) ON DUPLICATE KEY UPDATE enabled = ?
				");

				try {
					$sth->execute(array(
						$competitorId->competitorid,
						$element->categoryId,
						$element->subcategoryId,
						$element->selected
					));
				} catch (Exception $e) {
					$db->rollBack();
					$this->returnError(500, $e->getMessage());
				}
			}
		}

		$db->commit();
	}

	/**
	 * @param $category
	 * @return array
	 */
	public function getSubcategoriesToCategoryByCategory($id, $category) {
		//var_dump($category);
		$db = $this->getDbCon();

		$sth = $db->prepare("
			SELECT subcategoryId, categoryId, selected 
			FROM ica.subcategoriesToCategories
			WHERE categoryId = ?
		");

		try {
			$sth->execute(array($id));
			return $sth->fetchAll();
		} catch (Exception $e) {
			$this->returnError(500, $e->getMessage());
		}
	}


	/**
	 * @param $rate
	 */
	public function setRatePoints($rate) {
		$db = $this->getDbCon();
		$sth = $db->prepare("
			INSERT INTO ica.points 
			(value)
			VALUES (?)
			WHERE competitorId = ?
			AND eventId = ?
			AND categoryId = ?
			AND cubcategory = ?
		");

		try {
			$sth->execute(array(
				$rate->value,
				$rate->competitorId,
				$rate->eventId,
				$rate->categoryId,
				$rate->subcategory));
		} catch (Exception $e) {
			$this->returnError(500, $e->getMessage());
		}
	}

	/**
	 * @param $registration
	 */
	public function signUpForEvent($registration) {
		$db = $this->getDbCon();
		$sth = $db->prepare("
			INSERT INTO ica.points 
			(competitorId, eventId, categoryId, subcategoryId, value)
			VALUES (?,?,?,?,?)
		");

		try {
			$sth->execute(array(
				$registration->competitorId,
				$registration->eventId,
				$registration->categoryId,
				$registration->subcategory,
				$registration->value));
		} catch (Exception $e) {
			$this->returnError(500, $e->getMessage());
		}
	}

	public function getRatingResultsByCompetitor($competitorId) {
		$db = $this->getDbCon();

		$sth = $db->prepare("
			SELECT 
				categories.id AS categoryId, 
				categories.category, 
				subcategoriesToCategories.subcategoryId, 
				subcategories.subcategory,
				rating.notice,
				rating.points, 
				rating.enabled 
				FROM ica.categories 
				JOIN ica.subcategoriesToCategories ON subcategoriesToCategories.categoryId = categories.id 
				JOIN ica.subcategories ON subcategories.id = subcategoriesToCategories.subcategoryId AND subcategoriesToCategories.selected = 1
				LEFT JOIN ica.rating ON rating.competitorId = ? 
					AND rating.categoryId = categories.id 
					AND rating.subcategoryId = subcategories.id
					AND rating.enabled = 1
				ORDER BY categories.category 
		");

		try {
			$sth->execute(array($competitorId));
			$ratingResults = array();

			while ($row = $sth->fetch()) {
				if (!array_key_exists($row->category, $ratingResults)) {
					$ratingResults[$row->category] = array();
				}

				$row->categoryId = $row->categoryid;
				unset($row->categoryid);

				$row->subcategoryId = $row->subcategoryid;
				unset($row->subcategoryid);

				$row->competitorId = $competitorId;

				$row->points = empty($row->points) ? 0 : $row->points;
				$row->enabled = empty($row->enabled) ? 1 : $row->enabled;

				array_push($ratingResults[$row->category], $row);
			}

			return $ratingResults;
		} catch (Exception $e) {
			$this->returnError(500, $e->getMessage());
		}
	}

	public function rateCompetitor($rateResults) {
		$db = $this->getDbCon();
		$db->beginTransaction();

		if (!empty($rateResults)) {
			$competitorId = $rateResults[0]->competitorId;
		}

		foreach ($rateResults as $result) {
			$sth = $db->prepare("
				INSERT INTO ica.rating 
				(competitorId, categoryId, subcategoryId, notice, points)
				VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE notice = ?, points = ?
			");

			try {
				$sth->execute(array(
					$result->competitorId,
					$result->categoryId,
					$result->subcategoryId,
					$result->notice,
					$result->points,
					$result->notice,
					$result->points
				));
			} catch (Exception $e) {
				$db->rollBack();
				$this->returnError(500, $e->getMessage());
			}
		}

		$sth = $db->prepare("
			UPDATE ica.competitors
			SET isRated = 1
			WHERE id = ?
		");

		try {
			$sth->execute(array($competitorId));
		} catch (Exception $e) {
			$db->rollBack();
			$this->returnError(500, $e->getMessage());
		}

		$db->commit();
	}

	/**
	 * @return array
	 */
	public function getEvaluation() {
		$db = $this->getDbCon();
		$evaluation = array();

		$res = $db->query("SELECT * FROM ica.events");
		$events = $res->fetchAll();

		foreach ($events as $event) {
			$sth = $db->prepare("
				SELECT *, (SELECT SUM(points) FROM ica.rating WHERE rating.competitorId = competitors.id AND rating.enabled = 1) AS summe  
				FROM ica.competitors
				JOIN ica.rating ON rating.competitorId = competitors.id
				JOIN ica.subscribeEvents ON subscribeEvents.competitorId = competitors.id AND subscribeEvents.eventId = ? AND subscribeEvents.enabled = 1
				GROUP BY competitors.id ORDER BY summe DESC
			");

			try {
				$sth->execute(array($event->id));

				$result = new stdClass();
				$result->event = $event;
				$result->results = $sth->fetchAll();

				array_push($evaluation, $result);
			} catch (Exception $e) {
				$this->returnError(500, $e->getMessage());
			}
		}

		return $evaluation;
	}

	public function getKpis() {
		$db = $this->getDbCon();

		// Anzahl Teilnehmer gesamt
		$totalNumberOfCompetitors = $db->query("SELECT count(*) AS totalNumberOfCompetitors FROM ica.competitors")->fetch();

		// Anzahl Teilnehmer pro Event
		$numberOfCompetitorsPerEvent = $db->query("
	  		SELECT 
	  			events.event, 
	  			(SELECT count(*) FROM ica.subscribeEvents WHERE subscribeEvents.eventId = events.id AND subscribeEvents.enabled = 1) AS numberOfCompetitors
			FROM ica.events
		")->fetchAll();

		$numberOfCompetitorsPerManufacturer = $db->query("
			SELECT manufacturers.label,
			(SELECT count(*) FROM ica.competitors WHERE competitors.manufacturerId = manufacturers.id) AS numberOfCompetitors
			FROM ica.manufacturers
		")->fetchAll();

		// aeltestes Auto
		// TODO: nur Teilnehmer mit Anmeldung betrachten
		$res = $db->query("
	  		SELECT * FROM ica.competitors
	  		JOIN ica.subscribeEvents ON subscribeEvents.competitorId = competitors.id AND subscribeEvents.eventId = 8 AND subscribeEvents.enabled = 1
	  		WHERE competitors.buildYear IS NOT NULL 
	  		ORDER BY competitors.buildYear ASC LIMIT 5
		")->fetchAll();

		$topOldestCars = array();
		foreach ($res as $row) {
			$competitor = new stdClass();
			$competitor->id = $row->id;
			$competitor->startNumber = $row->startnumber;
			$competitor->nickname = $row->nickname;
			$competitor->licensePlate = $row->licenseplate;
			$competitor->manufacturerId = $row->manufacturerid;
			$competitor->model = $row->model;
			$competitor->buildYear = $row->buildyear;
			$competitor->registrationDate = $row->registrationdate;
			$competitor->pc = $row->ps;
			$competitor->notice = $row->notice;
			$competitor->picture = $row->picture;

			array_push($topOldestCars, $competitor);
		}

		// top PS
		// TODO: nur Teilnehmer mit Anmeldung betrachten
		$res = $db->query("
	  		SELECT competitors.* FROM ica.competitors
	  		JOIN ica.subscribeEvents ON subscribeEvents.competitorId = competitors.id AND subscribeEvents.eventId = 9 AND subscribeEvents.enabled = 1
	  		WHERE competitors.ps IS NOT NULL
	  		ORDER BY buildYear DESC LIMIT 5
		")->fetchAll();

		$topPsCars = array();
		foreach ($res as $row) {
			$competitor = new stdClass();
			$competitor->id = $row->id;
			$competitor->startNumber = $row->startnumber;
			$competitor->nickname = $row->nickname;
			$competitor->licensePlate = $row->licenseplate;
			$competitor->manufacturerId = $row->manufacturerid;
			$competitor->model = $row->model;
			$competitor->buildYear = $row->buildyear;
			$competitor->registrationDate = $row->registrationdate;
			$competitor->ps = $row->ps;
			$competitor->notice = $row->notice;
			$competitor->picture = $row->picture;

			array_push($topPsCars, $competitor);
		}

		$kpis = new stdClass();
		$kpis->totalNumberOfCompetitors = $totalNumberOfCompetitors;
		$kpis->numberOfCompetitorsPerEvent = $numberOfCompetitorsPerEvent;
		$kpis->numberOfCompetitorsPerManufacturer = $numberOfCompetitorsPerManufacturer;
		$kpis->topOldestCars = $topOldestCars;
		$kpis->topPsCars = $topPsCars;

		return $kpis;
	}

	/**
	 * @return PDO
	 */
	private function getDbCon() {
		$db = new PDO("mysql:host=localhost;dbname=ica", "root", "test");
		$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		$db->setAttribute(PDO::ATTR_CASE, PDO::CASE_LOWER);
		$db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_OBJ);
		$db->setAttribute(PDO::MYSQL_ATTR_DIRECT_QUERY, true);

		return $db;
	}
}