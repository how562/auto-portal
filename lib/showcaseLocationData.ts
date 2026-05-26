export interface ShowcaseLocationItem {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  hours: string;
  lat?: number;
  lng?: number;
  directionsUrl?: string;
}

export const SHOWCASE_LOCATIONS: ShowcaseLocationItem[] = [
  {
    id: "loc1",
    name: "Coastal flagship",
    address: "1200 Harbor Blvd",
    city: "Bayview, ST 32901",
    phone: "(555) 201-1000",
    hours: "Mon–Sat 8am–7pm · Sun 10am–5pm",
    directionsUrl: "#directions-coastal",
  },
  {
    id: "loc2",
    name: "Downtown showroom",
    address: "88 Market Street",
    city: "Metro Center, ST 32904",
    phone: "(555) 201-1100",
    hours: "Mon–Sat 9am–6pm · Sun closed",
    directionsUrl: "#directions-downtown",
  },
  {
    id: "loc3",
    name: "Inland service center",
    address: "4100 Ridge Parkway",
    city: "Summit, ST 32912",
    phone: "(555) 201-1200",
    hours: "Mon–Fri 7:30am–6pm · Sat 8am–4pm",
    directionsUrl: "#directions-inland",
  },
];

export const SHOWCASE_FEATURED_LOCATION = SHOWCASE_LOCATIONS[0];
