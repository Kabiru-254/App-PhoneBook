import { Routes } from '@angular/router';
import {ContactDetailsComponent} from './Components/components/contact-details/contact-details.component';
import {ContactListComponent} from './Components/components/contact-list/contact-list.component';
import {ExportImportComponent} from './Components/export-import/export-import.component';

export const routes: Routes = [
  { path: '', redirectTo: '/contact-list', pathMatch: 'full' },
  { path: 'contact-list', component: ContactListComponent },
  { path: 'importExportContacts', component: ExportImportComponent },
  { path: 'contact-details/:id', component: ContactDetailsComponent },
  { path: '**', redirectTo: '/contact-list' },
];
