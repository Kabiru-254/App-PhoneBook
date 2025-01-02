import { Component, OnInit } from '@angular/core';
import { ContactsService } from '../../Services/contacts.service';
import {Contact, convertToContacts, ImportContact} from '../../Models/ContactModel';
import { NotificationsService } from '../../Services/notifications.service';
import { CommonModule } from '@angular/common';
import {Router} from '@angular/router';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {FormsModule} from '@angular/forms';
import {DarkModeService} from '../../Services/dark-mode.service';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


@Component({
  selector: 'app-export-import',
  imports: [CommonModule, MatProgressSpinner, FormsModule, MatIconModule, MatExpansionModule, ],
  templateUrl: './export-import.component.html',
  standalone: true,
  styleUrl: './export-import.component.css'
})
export class ExportImportComponent implements OnInit{

  activeTab: string = 'import';
  fileName: string | null = null;
  currentStep: number = 1;
  viewMode: 'list' | 'grid' = 'list';
  isFileValid = false;
  uploadError: string | null = null;
  allContacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  validContacts: ImportContact[] = [];
  errors: { row: number; error: string }[] = [];
  validContactsCount: number = 0;
  totalContactsCount: number = 0;
  isLoading = false;
  searchQuery: string = '';
  darkMode: boolean = false;

  constructor(
    private contactsService: ContactsService,
    private notificationService: NotificationsService,
    private router: Router,
    private darkModeService: DarkModeService,

  ) {
  }

  ngOnInit(): void {
    this.loadViewModePreference();
    this.allContacts = this.contactsService.getAllContacts();
    this.filteredContacts = this.allContacts.sort((a, b) => a.firstName.localeCompare(b.firstName));
    this.initializeTheme();
  }

  initializeTheme(): void {
    const mode = this.darkModeService.getCurrentMode(); // Fetch mode from service
    this.darkMode = mode === 'dark'; // Set darkMode based on fetched mode
    document.documentElement.classList.toggle('dark', this.darkMode); // Apply to document root
  }

  toggleTheme(): void {
    this.darkModeService.toggleMode();
    this.initializeTheme(); // Reapply theme changes after toggling
  }

  onSearch() {
    this.filteredContacts = this.allContacts.filter((contact) =>
      [contact.firstName, contact.lastName, contact.email, contact.phone]
        .join(' ')
        .toLowerCase()
        .includes(this.searchQuery.toLowerCase())
    );
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'list' ? 'grid' : 'list';
    localStorage.setItem('viewMode', this.viewMode);
  }
  loadViewModePreference() {
    const savedViewMode = localStorage.getItem('viewMode');
    if (savedViewMode === 'grid' || savedViewMode === 'list') {
      this.viewMode = savedViewMode as 'list' | 'grid';
    }
  }



  handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      if (file.type !== 'text/csv') {
        this.uploadError = 'Only CSV files are allowed.';
        this.isFileValid = false;
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        this.parseCsv(text);
      };

      reader.readAsText(file);
      this.uploadError = null;
      this.fileName = file.name;
      this.isFileValid = true;
    } else {
      this.uploadError = 'No file selected.';
      this.isFileValid = false;
    }
  }

// Parse and validate CSV data
  parseCsv(data: string) {
    const rows = data.split('\n');
    const headers = rows[0]?.split(',');
    this.allContacts = [];
    this.errors = [];

    if (!headers.includes('First Name') || !headers.includes('Last Name') || !headers.includes('Email') || !headers.includes('Phone')) {
      this.uploadError = 'Invalid CSV format. Ensure the headers match the required format.';
      return;
    }

    rows.slice(1).forEach((row, index) => {
      const values = row.split(',');
      const contact: ImportContact = {
        firstName: values[0]?.trim(),
        lastName: values[1]?.trim(),
        email: values[2]?.trim(),
        phone: values[3]?.trim(),
        error: '',
        errorPresent: false,
      };

      if (!contact.firstName || !contact.lastName || !contact.email || !contact.phone) {
        contact.error = 'Missing required fields.';
        contact.errorPresent = true;
      } else if (!/^\S+@\S+\.\S+$/.test(contact.email)) {
        contact.error = 'Invalid email format.';
        contact.errorPresent = true;
      //   Check that the digits are 9 or 10, because the leading 0 is usually dropped in numbers.
      } else if (contact.phone.length !== 9 && contact.phone.length !== 10) {
        contact.error = 'Phone must be 10 digits.';
        contact.errorPresent = true;
      }

      if (contact.error) {
        this.errors.push({ row: index + 2, error: contact.error });
      }

      this.validContacts.push(contact);
    });

    this.totalContactsCount = this.validContacts.length;
    this.validContactsCount = this.validContacts.filter(contact => !contact.errorPresent).length;
  }



// Proceed to next step
  proceedToStep(step: number) {
    if (step == 2 && !this.isFileValid){
      this.notificationService.showError("Please upload a csv file!");
      return;
    }
    if (step === 2 && this.isFileValid) {
      this.currentStep = step;
    } else if (step === 3 && this.validContactsCount > 0) {
      // this.currentStep = step;
      this.onClickImportContacts();
    }else {
      this.currentStep = step;
    }
  }

  onClickImportContacts(){
    this.notificationService.showConfirmation(`Are you sure you want to import ${this.validContactsCount} contact(s)?`,
      "You will need to update some details later.",
      ()=> this.importContacts());
  }

  importContacts(){
    const importedContacts: Contact[] = convertToContacts(this.validContacts.filter(contact => !contact.errorPresent));
    const response = this.contactsService.importContacts(importedContacts);
    this.notificationService.showSuccess(response);
    this.returnToMainPage();
  }

  returnToMainPage(){
    setTimeout(()=>{
      this.router.navigate(['/contact-list']);
    }, 1000);
  }


  // Download CSV Template
  downloadTemplate() {
    const csvContent = 'First Name,Last Name,Email,Phone\nJohn,Doe,john.doe@example.com,+123456789\nJane,Smith,jane.smith@example.com,+987654321';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'contact-template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }


  // Dummy data for Export tab
  showFavoritesOnly: boolean = false;
  selectedGroupCategory: string = '';
  showRecentContactsOnly: boolean = false;

  toggleFavoriteFilter() {
    this.showFavoritesOnly = !this.showFavoritesOnly;
    this.filteredContacts = this.showFavoritesOnly
      ? this.filteredContacts.filter((contact) => contact.isFavorite)
      : [...this.allContacts];
  }
  fetchLoadedContacts(): Contact[]{
    this.allContacts = this.contactsService.getAllContacts();
    this.filteredContacts = this.allContacts.sort((a, b) => a.firstName.localeCompare(b.firstName));
    return this.filteredContacts;
  }

  toggleRecentContactsFilter() {
    this.showRecentContactsOnly = !this.showRecentContactsOnly;

    // If showing recent contacts, sort by lastViewedDate and take the top 10
    this.filteredContacts = this.showRecentContactsOnly
      ? this.allContacts
        .sort((a, b) => b.lastViewedDate.getTime() - a.lastViewedDate.getTime()) // Sort by most recent first
        .slice(0, 10)
      : this.fetchLoadedContacts();
  }

  filterByGroupCategory() {
    if (this.selectedGroupCategory) {
      this.filteredContacts = this.allContacts.filter(
        (contact) => contact.groupCategory === this.selectedGroupCategory
      );
    } else {
      this.filteredContacts = [...this.allContacts]; // Show all contacts if no category is selected
    }
  }


  exportAsExcel(){
    if (this.filteredContacts.length == 0){
      this.notificationService.showError("You cant export 0 contacts! Please refine your selection!");
      return;
    }
    this.notificationService.showConfirmation(`Are you sure you want to export ${this.filteredContacts.length} contacts as Excel?`,
      "",
      ()=> this.exportToExcel(this.filteredContacts, "Exported Contacts"));
  }

  exportAsCsv(){
    if (this.filteredContacts.length == 0){
      this.notificationService.showError("You cant export 0 contacts! Please refine your selection!");
      return;
    }
    this.notificationService.showConfirmation(`Are you sure you want to export ${this.filteredContacts.length} contacts as CSV?`,
      "",
      ()=> this.exportToCsv(this.filteredContacts, "Exported Contacts"));
  }

  exportToExcel(contacts: Contact[], fileName: string): void {
    // Transform data
    const transformedData = contacts.map(contact => ({
      FirstName: contact.firstName,
      LastName: contact.lastName,
      Email: contact.email,
      Phone: contact.phone,
      Favorite: contact.isFavorite ? 'Favourite' : 'Not Favourite',
      Address: contact.physicalAddress,
      Group: contact.groupCategory,
      AddedDate: contact.addedDate.toLocaleDateString(),
      LastViewedDate: contact.lastViewedDate.toLocaleDateString(),
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(transformedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts');

    // Save to file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), `${fileName}.xlsx`);

    this.returnToMainPage();
  }

  exportToCsv(contacts: Contact[], fileName: string): void {
    // Transform data
    const transformedData = contacts.map(contact => ({
      FirstName: contact.firstName,
      LastName: contact.lastName,
      Email: contact.email,
      Phone: contact.phone,
      Favorite: contact.isFavorite ? 'Favourite' : 'Not Favourite',
      Address: contact.physicalAddress,
      Group: contact.groupCategory,
      AddedDate: contact.addedDate.toLocaleDateString(),
      LastViewedDate: contact.lastViewedDate.toLocaleDateString(),
    }));

    // Generate CSV content
    const csvRows = [];
    const headers = Object.keys(transformedData[0]).join(',');
    csvRows.push(headers);

    transformedData.forEach(row => {
      const values = Object.values(row).map(value =>
        typeof value === 'string' ? `"${value}"` : value
      );
      csvRows.push(values.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    saveAs(blob, `${fileName}.csv`);

    this.returnToMainPage();
  }



}
