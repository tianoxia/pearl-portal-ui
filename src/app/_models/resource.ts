export enum Resource {
    Reports = 'Reports',
    Referer = 'Referer',
    Referers = 'Referers',
    Payroll = 'Payroll',
    PayPeriod = 'PayPeriod',
    Leaderboard = 'Leaderboard',
    Invoices = 'Invoices',
    Employee = 'Employee',
    Employees = 'Employees',
    ProviderEmployee = 'ProviderEmployee',
    ProviderEmployees = 'ProviderEmployees',
    MonthlyControlReport = 'MonConRep',
    ControlReport = 'ControlReport',
    Contractor = 'Contractor',
    Contractors = 'Contractors',
    Contact = 'Contact',
    ContactForms = 'ContactForms',
    CommissionReport = 'CommReport',
    Client = 'Client',
    Clients = 'Clients',
    Assignment = 'Assignment',
    Assignments = 'Assignments',
    EnterFunding = 'EnterFunding',
    EmployeeHours = 'EmployeeHours',
    AssignmentHours = 'AssignmentHours',
    Location = 'Location',
    SummaryReport = 'SumReport',
    CustomReport = 'CustomReport',
    EmployeePLReport = 'EmpPLReport',
    HeadcountReport = 'HeadcountRep',
    Government = 'Government',
    Healthcare = 'Healthcare',
    IT = 'IT',
    Xerox = 'Xerox',
    Imaging = 'Imaging',
    MedicalTemps = 'MedicalTemps',
    TherapyServices = 'TherapyServices',
    Dental = 'Dental',
    Files = 'Files',
    employeeUploadFiles = 'UploadFiles',
    employeeDownloadFiles = 'DownloadFiles',
    Timesheets = 'Timesheets',
    ExecutiveSearch = 'ExecutiveSearch',
    Scribes = 'Scribes',
    OSCenter = 'OSCenter',
    InfoTech = 'InfoTech',
    GrossProfitReport = 'GrossProfitReport',
    Richmond = 'Richmond',
    SWVA = 'SWVA',
    Largo = 'Largo',
    LongTerm = 'LongTerm',
    OutPatient = 'OutPatient'
  }

export enum Reports {
  Payroll = 'viewPayroll',
  Leaderboard = 'viewLeaderboard',
  Invoices = 'viewInvoices',
  MonthlyControl = 'viewMonConRep',
  Control = 'viewControlReport',
  Commission = 'viewCommReport',
  SummaryReport = 'viewSumReport',
  CustomReport = 'viewCustomReport',
  EmployeePL = 'viewEmpPLReport',
  HeadcountReport = 'viewHeadcountRep',
  CandidateSource = 'viewGrossProfitReport'
}
export enum PayPeriods {
  List = 'listReports',
  Add = 'addPayPeriod',
  Edit = 'editPayPeriod',
  View = 'viewPayPeriod',
  EnterFunding = 'enterFunding',
  EmployeeHours = 'editEmployeeHours',
  AssignmentHours = 'editAssignmentHours'
}
export enum DepartmentDisplay {
  Government = 'viewGovernment',
  Healthcare = 'viewHealthcare',
  IT = 'viewIT',
  Xerox = 'viewXerox',
  Imaging = 'viewImaging',
  MedicalTemps = 'viewMedicalTemps',
  TherapyServices = 'viewTherapyServices',
  Dental = 'viewDental',
  ExecutiveSearch = 'viewExecutiveSearch',
  Scribes = 'viewScribes',
  OSCenter = 'viewOSCenter',
  InfoTech = 'viewInfoTech'
}

export enum HomeHealth {
  Richmond = 'viewRichmond',
  SWVA = 'viewSWVA',
  Largo = 'viewLargo',
  LongTerm = 'viewLongTerm',
  OutPatient = 'viewOutPatient'
}

export enum Attachments {
  ViewFiles = 'viewFiles',
  UploadFiles = 'uploadFiles',
  DownloadFiles = 'downloadFiles'
}
export enum Assignments {
  List = 'listAssignments',
  View = 'viewAssignment',
  Add = 'addAssignment',
  Edit = 'editAssignment',
  Delete = 'deleteAssignment'
}
export enum Clients {
  List = 'listClients',
  View = 'viewClient',
  Add = 'addClient',
  Edit = 'editClient',
  Delete = 'deleteClient'
}
export enum Contractors {
  List = 'listContractors',
  View = 'viewContractor',
  Add = 'addContractor',
  Edit = 'editContractor',
  Delete = 'deleteContractor'
}
export enum Employees {
  List = 'listEmployees',
  View = 'viewEmployee',
  Add = 'addEmployee',
  Edit = 'editEmployee',
  Delete = 'deleteEmployee'
}
export enum Referers {
  List = 'listReferers',
  View = 'viewReferer',
  Add = 'addReferer',
  Edit = 'editReferer'
}
export enum Contacts {
  List = 'listContactForms',
  View = 'viewContact',
  Add = 'addContact',
  Edit = 'editContact',
  Delete = 'deleteContact'
}
export enum Locations {
  Add = 'addLocation',
  Edit = 'editLocation',
  Delete = 'deleteLocation'
}
export enum ProviderEmployees {
  List = 'listProviderEmployees',
  View = 'viewProviderEmployee',
  Add = 'addProviderEmployee',
  Edit = 'editProviderEmployee',
  Delete = 'deleteProviderEmployee'
}
export enum Timesheets {
  View = 'viewTimesheets'
}
