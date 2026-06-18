import { Action, surveyLocalization } from 'survey-core';
import { SurveyCreatorModel, TranslationEditor } from 'survey-creator-core';

const DEFAULT_LOCALE_ROW_ACTION_ID = 'svc-translation-machine-default';

type TranslationTabModel = {
  survey: SurveyCreatorModel['survey'];
  translationStringVisibilityCallback?: (obj: unknown, propertyName: string, visible: boolean) => boolean;
  reset(): void;
  showTranslationEditor(locale: string): void;
};

/**
 * Survey Creator only adds the AI translate action to removable language rows.
 * The default language row is locked, so machine translation into the default
 * locale is unavailable out of the box. This hook adds the same action for it.
 *
 * All translation editors also default the source locale to survey.locale.
 */
export function setupDefaultLocaleAutoTranslation(creator: SurveyCreatorModel): void {
  creator.onSurveyInstanceCreated.add((_, options) => {
    if (options.area !== 'translation-tab:language-list') {
      return;
    }

    patchTranslationEditorOpener(creator);

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
          action: () => openTranslationEditor(creator, surveyLocalization.defaultLocale)
        })
      );
    });
  });
}

function getTranslationModel(creator: SurveyCreatorModel): TranslationTabModel | undefined {
  return (creator.getPlugin('translation', false) as unknown as { model?: TranslationTabModel })?.model;
}

function patchTranslationEditorOpener(creator: SurveyCreatorModel): void {
  const translationModel = getTranslationModel(creator);
  if (!translationModel) {
    return;
  }

  translationModel.showTranslationEditor = (locale: string) => {
    openTranslationEditor(creator, locale || surveyLocalization.defaultLocale);
  };
}

function openTranslationEditor(creator: SurveyCreatorModel, targetLocale: string): void {
  const translationModel = getTranslationModel(creator);
  if (!translationModel) {
    return;
  }

  const editor = new TranslationEditor(
    translationModel.survey,
    targetLocale,
    creator,
    translationModel.translationStringVisibilityCallback
  );
  editor.onApply = () => {
    translationModel.reset();
  };

  selectSurveyLocaleAsTranslationSource(editor, creator.survey.locale, targetLocale);
  editor.showDialog();
}

function selectSurveyLocaleAsTranslationSource(
  editor: TranslationEditor,
  surveyLocale: string,
  targetLocale: string
): void {
  if (!surveyLocale || surveyLocale === targetLocale || !editor.fromLocales.includes(surveyLocale)) {
    return;
  }

  editor.setFromLocale(surveyLocale);

  const fromLocaleAction = editor.translation.stringsHeaderSurvey?.navigationBar?.getActionById(
    'svc-translation-fromlocale'
  );
  if (fromLocaleAction) {
    fromLocaleAction.title = editor.translation.getLocaleName(surveyLocale);
  }
}
