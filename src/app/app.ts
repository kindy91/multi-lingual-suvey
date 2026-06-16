import { ChangeDetectorRef, Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { Model, settings, surveyLocalization } from 'survey-core';
import { SurveyModule } from 'survey-angular-ui';
import { SurveyCreatorModule } from 'survey-creator-angular';
import { SurveyCreatorModel } from 'survey-creator-core';
import { setupDefaultLocaleAutoTranslation } from './default-locale-translation';
import 'survey-core/survey.i18n';
import 'survey-creator-core/survey-creator-core.i18n';

type AppView = 'creator' | 'survey';

@Component({
  selector: 'app-root',
  imports: [SurveyCreatorModule, SurveyModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit, AfterViewInit {
  private cdr = inject(ChangeDetectorRef);
  activeView: AppView = 'creator';
  surveyCreatorModel?: SurveyCreatorModel;
  surveyModel?: Model;

  constructor() {
    settings.localization.defaultLocaleName = 'en';
    surveyLocalization.supportedLocales = ['en', 'de', 'fr', 'es', 'it'];
  }

  ngOnInit(): void {
    const creator = new SurveyCreatorModel({
      showSurveyHeader: false,
      showTranslationTab: true,
      showLogicTab: false,
      showJSONEditorTab: true,
      pageEditMode: 'single',
      questionTypes: ['boolean', 'text', 'dropdown', 'checkbox', 'radiogroup', 'file']
    });

    setupDefaultLocaleAutoTranslation(creator);

    creator.onMachineTranslate.add((_, options) => {
      const toLocale = options.toLocale || surveyLocalization.defaultLocale;
      options.callback(
        options.strings.map((str) => `"${str}" from ${options.fromLocale} to ${toLocale}`)
      );
    });

    // German-speaking author works in German; English default texts are still empty.
    creator.JSON = {
      locale: 'de',
      title: {
        de: 'Beispielumfrage'
      },
      elements: [
        {
          type: 'boolean',
          name: 'question1',
          title: {
            de: 'Magst du Fußball?'
          }
        },
        {
          type: 'boolean',
          name: 'question2',
          title: {
            de: 'Siehst du gern Sport im Fernsehen?'
          }
        }
      ]
    };
    creator.survey.locale = 'de';

    this.surveyCreatorModel = creator;
    this.cdr.detectChanges();
  }

  setView(view: AppView): void {
    if (view === 'survey' && this.surveyCreatorModel) {
      this.surveyModel = new Model(this.surveyCreatorModel.JSON);
    }
    this.activeView = view;
    this.cdr.detectChanges();
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }
}
