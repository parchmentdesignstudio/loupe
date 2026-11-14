import type { ComponentType } from 'react';
import { LeadsScreen } from './leads.js';

// Whole screens built from loupe alone, each at its own address and filling the window, to see how the components hold
// up together. They're dummies: nothing is saved

export interface Screen {
	id: string;
	name: string;
	description: string;
	render: ComponentType;
}

export const screens: Screen[] = [
	{
		id: 'leads',
		name: 'Leads',
		description: 'A CRM’s list of leads: a sidebar of sections, search, filters, tabs by status, a sortable table you can choose rows in, and pages',
		render: LeadsScreen,
	},
];

/** The screen at an address such as screens/leads, or screens/leads/calls for a link inside it */
export const screenAt = (path: string) => (path.startsWith('screens/') ? screens.find((screen) => path.split('/')[1] === screen.id) : undefined);
