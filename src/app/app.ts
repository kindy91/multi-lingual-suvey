import { Component } from '@angular/core';
import { surveyLocalization } from 'survey-core';
import { SurveyCreatorModule } from 'survey-creator-angular';
import { SurveyCreatorModel } from "survey-creator-core";
import 'survey-core/survey.i18n';
import 'survey-creator-core/survey-creator-core.i18n';

@Component({
  selector: 'app-root',
  imports: [SurveyCreatorModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  surveyCreatorModel?: SurveyCreatorModel;
  ngOnInit() {
    surveyLocalization.defaultLocale = 'en';
    surveyLocalization.supportedLocales = ['en', 'de', 'fr', 'es', 'it'];

    const creator = new SurveyCreatorModel({
      showSurveyHeader: false,
      showTranslationTab: true,
      showLogicTab: false,
      showJSONEditorTab: true,
      showPreviewTab: false,
      pageEditMode: "single",
      questionTypes: ["boolean", 'text', 'dropdown', 'checkbox', 'radiogroup', 'file'],
    });

    creator.survey.locale = 'de';

    creator.onMachineTranslate.add((_, options) => {
      options.callback(options.strings.map((str) => (`"${str}" from ${options.fromLocale} to  ${options.toLocale}`)));
    });

    this.surveyCreatorModel = creator;
  }
}