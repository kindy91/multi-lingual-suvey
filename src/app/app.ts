import { ChangeDetectorRef, Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { Model, settings, setupLocale, surveyLocalization } from 'survey-core';
import { SurveyModule } from 'survey-angular-ui';
import { SurveyCreatorModule } from 'survey-creator-angular';
import { SurveyCreatorModel } from 'survey-creator-core';
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
    this.setupCustomLocaleAsDefault();
    surveyLocalization.supportedLocales = ['en', 'de', 'fr', 'es', 'it'];
  }

  ngOnInit(): void {
    const creator = new SurveyCreatorModel({
      showSurveyHeader: false,
      showTranslationTab: true,
      showLogicTab: false,
      showJSONEditorTab: true,
     // showPreviewTab: false,
      pageEditMode: 'single',
      questionTypes: ['boolean', 'text', 'dropdown', 'checkbox', 'radiogroup', 'file']
    });

    creator.onMachineTranslate.add((_, options) => {
      options.callback(
        options.strings.map((str) => `"${str}" from ${options.fromLocale} to  ${options.toLocale}`)
      );
    });

    creator.JSON = {
      "locale": "de",
      "title": {
        "en": "Some default title value in English"
      },
      "elements": [
        {
          "type": "boolean",
          "name": "question2",
          "title": {
            "en": "Some default value in English"
          }
        },
        {
          "type": "boolean",
          "name": "question1",
          "title": {
            "de": "Magst du Fußball?",
            "en": "\"Magst du Fußball?\" from de to  en"
          }
        }
      ]
    };
    creator.survey.locale = 'de';

    this.surveyCreatorModel = creator;
    this.cdr.detectChanges();
  }

  setView(view: AppView): void {
    if (view === 'survey') {
      surveyLocalization.defaultLocale = 'en';
      settings.localization.defaultLocaleName = "en";
      if (this.surveyCreatorModel) {
        this.surveyModel = new Model(this.surveyCreatorModel.JSON);
      }
    } else {
      surveyLocalization.defaultLocale = 'customlocale';
    }
    this.activeView = view;
    this.cdr.detectChanges();
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  private setupCustomLocaleAsDefault() {
    setupLocale({
      localeCode: 'customlocale',
      strings: {},
      nativeName: 'Custom Locale',
      englishName: 'Custom Locale',
      rtl: false
    });

    surveyLocalization.defaultLocale = 'customlocale';
  }
}
