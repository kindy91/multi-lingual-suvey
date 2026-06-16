import { Action, surveyLocalization } from 'survey-core';
import { SurveyCreatorModel } from 'survey-creator-core';

const DEFAULT_LOCALE_ROW_ACTION_ID = 'svc-translation-machine-default';

/**
 * Survey Creator only adds the AI translate action to removable language rows.
 * The default language row is locked, so machine translation into the default
 * locale is unavailable out of the box. This hook adds the same action for it.
 */
export function setupDefaultLocaleAutoTranslation(creator: SurveyCreatorModel): void {
  creator.onSurveyInstanceCreated.add((_, options) => {
    if (options.area !== 'translation-tab:language-list') {
      return;
    }

    options.survey.onGetMatrixRowActions.add((_, matrixOptions) => {
      if (matrixOptions.question.name !== 'locales') {
        return;
      }

      const rowIndex = matrixOptions.question['visibleRows'].indexOf(matrixOptions.row);
      const row = matrixOptions.question.value?.[rowIndex];
      if (!row || row.name !== '') {
        return;
      }

      if (matrixOptions.actions.some((action) => action.id === DEFAULT_LOCALE_ROW_ACTION_ID)) {
        return;
      }

      matrixOptions.actions.splice(
        0,
        0,
        new Action({
          id: DEFAULT_LOCALE_ROW_ACTION_ID,
          iconName: 'icon-language',
          iconSize: 'auto',
          locTooltipName: 'ed.translateUsigAI',
          visibleIndex: 5,
          location: 'end',
          action: () => openDefaultLocaleTranslationEditor(creator)
        })
      );
    });
  });
}

function openDefaultLocaleTranslationEditor(creator: SurveyCreatorModel): void {
  const model = (creator.getPlugin('translation', false) as unknown as { model?: { showTranslationEditor(locale: string): void } })?.model;
  // Use the default locale code (e.g. "en"), not "". An empty edit locale is treated as
  // falsy inside Survey Creator and breaks the dialog: extra columns appear and the
  // target language is labeled incorrectly.
  model?.showTranslationEditor(surveyLocalization.defaultLocale);
}
