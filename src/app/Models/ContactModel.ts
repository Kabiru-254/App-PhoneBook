import { v4 as uuidv4 } from 'uuid'; // To generate unique IDs

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isFavorite: boolean;
  deleted: boolean;
  imageUrl: string;
  physicalAddress: string;
  groupCategory: string;
  addedDate: Date;
  lastViewedDate: Date;
}

export interface ImportContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  error?: string;
  errorPresent: boolean
}

export function convertToContacts(importContacts: ImportContact[]): Contact[] {
  return importContacts.map(importContact => {
    const randomImageUrl = `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`;

    return {
      id: uuidv4(),
      firstName: importContact.firstName,
      lastName: importContact.lastName,
      email: importContact.email,
      phone: importContact.phone,
      isFavorite: false,
      deleted: false,
      imageUrl: randomImageUrl,
      physicalAddress: '',
      groupCategory: 'Other',
      addedDate: new Date(),
      lastViewedDate: new Date(),
    };
  });
}
