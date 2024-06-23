import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlaskComponent } from './flask.component';

describe('FlaskComponent', () => {
  let component: FlaskComponent;
  let fixture: ComponentFixture<FlaskComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FlaskComponent]
    });
    fixture = TestBed.createComponent(FlaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
