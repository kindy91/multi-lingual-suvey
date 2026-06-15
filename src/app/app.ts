import { ChangeDetectorRef, Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { setupLocale, surveyLocalization } from 'survey-core';
import { SurveyCreatorModule } from 'survey-creator-angular';
import { SurveyCreatorModel } from "survey-creator-core";
import 'survey-core/survey.i18n';
import 'survey-creator-core/survey-creator-core.i18n';

@Component({
  selector: 'app-root',
  imports: [SurveyCreatorModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit, AfterViewInit {
  private cdr = inject(ChangeDetectorRef);
  surveyCreatorModel?: SurveyCreatorModel;

  constructor() {
    this.setupCustomLocaleAsDefault();

    surveyLocalization.supportedLocales = ['en', 'de', 'fr', 'es', 'it'];
  }

  ngOnInit(): void {
    // Init the creator model
    const creator = new SurveyCreatorModel({
      showSurveyHeader: false,
      showTranslationTab: true,
      showLogicTab: false,
      showJSONEditorTab: true,
      showPreviewTab: false,
      pageEditMode: "single",
      questionTypes: ["boolean", 'text', 'dropdown', 'checkbox', 'radiogroup', 'file'],
    });


    // Enable the machine translation and provide a mock callback value
    creator.onMachineTranslate.add((_, options) => {
      options.callback(options.strings.map((str) => (`"${str}" from ${options.fromLocale} to  ${options.toLocale}`)));
    });

    // Default JSON
    creator.JSON = {
      "elements": [
        {
          "type": "boolean",
          "name": "question1",
          "title": {
            "de": "Magst du Fußball?"
          }
        }
      ]
    }
    // Survey Locale is Gemran
    creator.survey.locale = 'de';

    this.surveyCreatorModel = creator;
    this.cdr.detectChanges();
  }

  ngAfterViewInit(): void {
    // Set the default locale to English after rendering
    surveyLocalization.defaultLocale = 'en';
    this.cdr.detectChanges();
  }

  private setupCustomLocaleAsDefault() {
    setupLocale({
      localeCode: "customlocale",   // A short code used as a locale identifier (for example, "en", "de", "fr")
      strings: {}, // An object with custom translations
      nativeName: "Custom Locale",  // The locale name in native language
      englishName: "Custom Locale", // The locale name in English 
      rtl: false                    // A flag that indicates whether the language is right-to-left
    });

    surveyLocalization.defaultLocale = 'customlocale';
  }
}