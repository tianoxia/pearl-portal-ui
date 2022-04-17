import { Injectable } from '@angular/core';
import { PermissionType } from '../_models/permission-type';
import { Resource, Role, PermissionBase } from '../_models/index';

@Injectable()
export class PermissionManagerService {

  private permissions: PermissionBase;

  constructor() { }

  isGranted(resource: Resource, permission: PermissionType) {
    for (const res of this.permissions.permissions) {
      if (resource == res.resource) {
        for (const perm of res.permissions) {
          if (perm == permission) {
            return true;
          }
        }
      }
    }
    return false;
  }
}
