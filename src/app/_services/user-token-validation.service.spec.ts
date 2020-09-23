import { TestBed } from '@angular/core/testing';

import { UserTokenValidationService } from './user-token-validation.service';

describe('ValidateUserAndTokenService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UserTokenValidationService = TestBed.get(UserTokenValidationService);
    expect(service).toBeTruthy();
  });
});
