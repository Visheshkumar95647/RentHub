
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MyListings } from './my-listings';

describe('MyListings', () => {
  let component: MyListings;
  let fixture: ComponentFixture<MyListings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyListings],
      providers: [provideRouter([])]
    })
      .overrideComponent(MyListings, {
        set: { template: '' }
      })
      .compileComponents();

    fixture = TestBed.createComponent(MyListings);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
