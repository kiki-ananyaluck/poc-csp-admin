import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Forbidden } from './forbidden';
import { FORBIDDEN_MESSAGES } from './forbidden.message';
import { APP_ROUTE_PATHS } from '../../app.routes.const';

describe('Forbidden', () => {
  let component: Forbidden;
  let fixture: ComponentFixture<Forbidden>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Forbidden, RouterTestingModule.withRoutes([])],
    })
      .overrideComponent(Forbidden, {
        set: {
          imports: [CommonModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Forbidden);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose FORBIDDEN_MESSAGES', () => {
    expect(component['messages']).toBe(FORBIDDEN_MESSAGES);
  });

  it('should render the 403 image', () => {
    const img: HTMLImageElement =
      fixture.nativeElement.querySelector('.forbidden-image');
    expect(img).toBeTruthy();
    expect(img.src).toContain('/images/Page-Forbidden.png');
    expect(img.alt).toBe(FORBIDDEN_MESSAGES.IMG_ALT);
  });

  it('should render the title', () => {
    const title: HTMLElement =
      fixture.nativeElement.querySelector('.forbidden-title');
    expect(title).toBeTruthy();
    expect(title.textContent?.trim()).toBe(FORBIDDEN_MESSAGES.TITLE);
  });

  it('should render the description', () => {
    const desc: HTMLElement = fixture.nativeElement.querySelector(
      '.forbidden-description',
    );
    expect(desc).toBeTruthy();
    expect(desc.textContent?.trim()).toBe(FORBIDDEN_MESSAGES.DESCRIPTION);
  });

  it('should navigate to home when goBack() is invoked', () => {
    jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    component.goBack();
    expect(router.navigateByUrl).toHaveBeenCalledWith(APP_ROUTE_PATHS.HOME);
  });
});
