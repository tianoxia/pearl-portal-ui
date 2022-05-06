import { Reports, PayPeriods, HomeHealth, Attachments, DepartmentDisplay, Assignments,
    Clients, Contractors, Contacts, Employees, ProviderEmployees, Referers, Timesheets, Locations } from "app/_models";
export const grantedPermissionModules = [
    { heading: 'Clients', content: Clients },
    { heading: 'Contractors', content: Contractors },
    { heading: 'Assignments', content: Assignments },
    { heading: 'Contacts', content: Contacts },    
    { heading: 'Locations', content: Locations },
    { heading: 'Employees', content: Employees },
    { heading: 'Provider Employees', content: ProviderEmployees },
    { heading: 'Referers', content: Referers },
    { heading: 'Pay Periods', content: PayPeriods },
    { heading: 'Reports', content: Reports },
    { heading: 'Departments', content: DepartmentDisplay },
    { heading: 'Home Health', content: HomeHealth },
    { heading: 'Attachments', content: Attachments },
    { heading: 'Timesheets', content: Timesheets }
];