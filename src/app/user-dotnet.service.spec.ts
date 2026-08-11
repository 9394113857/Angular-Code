import { TestBed } from '@angular/core/testing';

import { UserDotnetService } from './user-dotnet.service';

describe('UserDotnetService', () => {
  let service: UserDotnetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserDotnetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
