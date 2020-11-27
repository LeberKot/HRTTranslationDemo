const LanguageTranslatorV3 = require('ibm-watson/language-translator/v3');
const { IamAuthenticator } = require('ibm-watson/auth');

/**
 * Helper 
 * @param {*} errorMessage 
 * @param {*} defaultLanguage 
 */
function getTheErrorResponse(errorMessage, defaultLanguage) {
  return {
    statusCode: 200,
    body: {
      language: defaultLanguage || 'en',
      errorMessage: errorMessage
    }
  };
}

/**
  *
  * main() will be run when teh action is invoked
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
function main(params) {

  /*
   * The default language to choose in case of an error
   */
  const defaultLanguage = 'en';

  return new Promise(function (resolve, reject) {

    try {

      // *******TODO**********
      // - Call the language translation API of the translation service
      // see: https://cloud.ibm.com/apidocs/language-translator?code=node#translate
      // - if successful, resolve exatly like shown below with the
      // translated text in the "translation" property,
      // the number of translated words in "words"
      // and the number of characters in "characters".

      // in case of errors during the call resolve with an error message according to the pattern
      // found in the catch clause below

      // pick the language with the highest confidence, and send it back


      const languageTranslator = new LanguageTranslatorV3({
        version: params.version,
        authenticator: new IamAuthenticator({
          apikey: params.apikey,
        }),
        serviceUrl: params.url,
      });

      const listModelsParams = {
        source: params.body.language,
        target: params.target || defaultLanguage,
        default: true,
      };

      languageTranslator.listModels(listModelsParams)
        .then(translationModels => {
          if (translationModels.result.models.length > 0) {






            const translateParams = {
              text: params.body.text,
              modelId: translationModels.result.models[0].model_id,
            };

            console.log(translateParams);

            languageTranslator.translate(translateParams)
              .then(translationResult => {
                if (translationResult.result.translations.length > 0) {
                  resolve({
                    statusCode: 200,
                    body: {
                      translations: translationResult.result.translations[0],
                      words: translationResult.result.word_count,
                      characters: translationResult.result.character_count,
                    },
                    headers: { 'Content-Type': 'application/json' }
                  });
                } else {
                  console.error('No translation found', err);
                  resolve(getTheErrorResponse('There was no translation found', defaultLanguage));
                }
                
              })
              .catch(err => {
                console.log('error:', err);
                resolve(getTheErrorResponse('Error while communicating with the language service', defaultLanguage));
              });





          } else {
            console.error('No translation possible', err);
            resolve(getTheErrorResponse('No translation possible', defaultLanguage));
          }
        })
        .catch(err => {
          console.log('error:', err);
          resolve(getTheErrorResponse('The provided target language is not supported for the detected source language', defaultLanguage));
        });



      


         
    } catch (err) {
      console.error('Error while initializing the AI service', err);
      resolve(getTheErrorResponse('Error while initializing the language service', defaultLanguage));
    }
  });
}
