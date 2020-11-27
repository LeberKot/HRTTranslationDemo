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
  * main() will be run when the action is invoked
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
      // - Call the language identification API of the translation service
      // see: https://cloud.ibm.com/apidocs/language-translator?code=node#identify-language
      // - if successful, resolve exactly like shown below with the
      // language that is most probable the best one in the "language" property
      // and the confidence it got detected in the "confidence" property

      // in case of errors during the call resolve with an error message according to the pattern 
      // found in the catch clause below

      console.log(params.text);

      if (!params.text || params.text === '') {
        console.error('Invalid input text', err);
        resolve(getTheErrorResponse('Invalid input text', defaultLanguage));
      }

      const languageTranslator = new LanguageTranslatorV3({
        version: params.version,
        authenticator: new IamAuthenticator({
          apikey: params.apikey,
        }),
        serviceUrl: params.url,
      });

      const identifyParams = {
        text: params.text
      };

      languageTranslator.identify(identifyParams)
        .then(identifiedLanguages => {
          if (identifiedLanguages.result.languages.length > 0) {
            let identifiedLanguage = identifiedLanguages.result.languages[0];
            resolve({
              statusCode: 200,
              body: {
                text: params.text,
                language: identifiedLanguage.language,
                confidence: identifiedLanguage.confidence,
              },
              target: params.target,
              headers: { 'Content-Type': 'application/json' }
            });
          } else {
            resolve(getTheErrorResponse('No language could be identified', defaultLanguage));
          }
        })
        .catch(err => {
          console.error('Error while communicating with the language service', err);
          resolve(getTheErrorResponse('Error while communicating with the language service', defaultLanguage));
        });


    } catch (err) {
      console.error('Error while initializing the AI service', err);
      resolve(getTheErrorResponse('Error while initializing the language service', defaultLanguage));
    }
  });
}
