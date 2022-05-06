import { Resource } from './resource';
import { PermissionType } from './permission-type';
import { FilePermission } from './file-permission';

export class Permission {
  public resource: Resource;
  public permissions: PermissionType[];
  public filePermissions: FilePermission[];

  constructor(resource: Resource, permissions: PermissionType[], filePermission: FilePermission[]) {
    this.resource = resource;
    this.permissions = permissions;
    this.filePermissions = filePermission;
  }  
}
export class EmployeePermission {
    resource: Resource;
    permissionTypes: PermissionType[];
    filePermissions: FilePermission[];
}
export class EmployeePermissionDetails {
    listReports: boolean;
    viewReferer: boolean;
    viewPayroll: boolean;
    viewPayPeriod: boolean;
    viewLeaderboard: boolean;
    viewInvoices: boolean;
    viewEmployee: boolean;
    viewMonConRep: boolean;
    viewControlReport: boolean;
    viewContractor: boolean;
    viewContact: boolean;
    viewCommReport: boolean;
    viewClient: boolean;
    viewAssignment: boolean;
    listReferers: boolean;
    enterFunding: boolean;
    editEmployeeHours: boolean;
    editAssignmentHours: boolean;
    listEmployees: boolean;
    editReferer: boolean;
    editPayPeriod: boolean;
    editLocation: boolean;
    editEmployee: boolean;
    editContractor: boolean;
    editContact: boolean;
    editClient: boolean;
    editAssignment: boolean;
    listContractors: boolean;
    listContactForms: boolean;
    listClients: boolean;
    listAssignments: boolean;
    addAssignment: boolean;
    addReferer: boolean;
    addPayPeriod: boolean;
    addLocation: boolean;
    addEmployee: boolean;
    addContractor: boolean;
    addContact: boolean;
    addClient: boolean;
    deleteAssignment: boolean;
    deleteClient: boolean;
    deleteContact: boolean;
    deleteContractor: boolean;
    deleteEmployee: boolean;
    deleteLocation: boolean;
    viewSumReport: boolean;
    viewCustomReport: boolean;
    viewEmpPLReport: boolean;
    viewHeadcountRep: boolean;
    viewGovernment: boolean;
    viewHealthcare: boolean;
    viewIT: boolean;
    viewXerox: boolean;
    viewImaging: boolean;
    viewMedicalTemps: boolean;
    viewTherapyServices: boolean;
    viewDental: boolean;
    viewFiles: boolean;
    uploadFiles: boolean;
    downloadFiles: boolean;
    viewTimesheets: boolean;
    viewExecutiveSearch: boolean;
    viewScribes: boolean;
    viewOSCenter: boolean;
    viewInfoTech: boolean;
    viewGrossProfitReport: boolean;
    viewRichmond: boolean;
    viewSWVA: boolean;
    viewLargo: boolean;
    viewProviderEmployee: boolean;
    listProviderEmployees: boolean;
    addProviderEmployee: boolean;
    editProviderEmployee: boolean;
    deleteProviderEmployee: boolean;
    viewLongTerm: boolean;
    viewOutPatient: boolean;
}
