import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDotnetComponent } from './user-dotnet.component';

describe('UserDotnetComponent', () => {
  let component: UserDotnetComponent;
  let fixture: ComponentFixture<UserDotnetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserDotnetComponent]
    });
    fixture = TestBed.createComponent(UserDotnetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
