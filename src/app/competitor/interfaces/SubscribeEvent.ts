import {IcaEvent} from '../../settings/interfaces/IcaEvent';

export interface SubscribeEvent {
	event: IcaEvent;
	enabled: boolean;
}
