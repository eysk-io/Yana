/*
 * analyzeText: wrapper function to analyze input text using
 *              Google cloud's natrual language processing API.
 *
 * Run this file for a demo.
 *
 * Usage:
 * [
 *    sentiment_result,
 *    entities_result,
 *    syntax_result,
 *    classify_result
 * ] = analyzeText(
 *    text,                   - text to analyze (string)
 *    analyze_sentiment,      - whether to perform sentiment analysis (boolean, default=true)
 *    analyze_entities,       - whether to perform entity analysis (boolean, default=true)
 *    analyze_syntax,         - whether to perform syntax analysis (boolean, default=true)
 *    classify_content,       - whether to perform content classification (boolean, default=true)
 * )
 *
 * Returns:                   note - if analyze_sentiment is false, sentiment_result is null, etc
 * 1. sentiment_result
 *      - an analysis of the prevailing emotional opinion within the text
 *      - extent to which it is positive, negative, or neutral
 *      - an array of objects:
 *        - sentiment_result[0].magnitude = amount of emotional content present
 *                                          (0 = none, >10 = huge amount)
 *        - sentiment_restult[0].score = whether the text is mostly positive, negative, or neutral
 *                                          (-1 = most negative, +1 = most positive)
 *        - sentiment_result[1...] = analysis result for each individual sentence in the text. For example:
 *            - sentiment_result[5].text = text of the 5th sentence
 *            - sentiment_result[5].magnitude = magnitude of the 5th sentence
 *            - sentiment_result[5].score = score of the 5th sentence
 * 2. entities_result
 *      - an analysis of each entity/thing referred to in the text,
 *        and a salience score (relevance to overall text)
 *      - an array of objects:
 *        - entities_result[6].name = name of 7th most relevant entity in the text.
 *        - entities_result[6].type = PERSON/EVENT/NUMBER/etc...
 *        - entities_result[6].salience = salience score
 *                                          (0 = irrelevant to text, 1 = 100% relevant)
 * 3. syntax_result
 *      - a syntactic analysis of the document (nouns/verbs/adjectives, punctuation, etc)
 *      - an array of objects
 *        - syntax_result[0].word = 1st word
 *        - syntax_result[0].partOfSpeech = what part of speech it is
 * 4. classify_result
 *      - still not sure entirely how it works.
 *      - doesn't seem to find anything (returns empty array) for most inputs
 *      - likely only works well if the input text is very long
 *
 * More info: https://cloud.google.com/natural-language/docs/how-to
 */
async function analyzeText(
    text,
    analyze_sentiment = true,
    analyze_entities = true,
    analyze_syntax = true,
    classify_content = true
) {
  const language = require("@google-cloud/language"); // Imports the Google cloud client library
  const key = { keyFilename: '../gcloud-language-key/RU-Hacks-2020-key.json' }; // Filename of authentication key
  const client = new language.LanguageServiceClient(key); // Create client
  const document = { content: text, type: "PLAIN_TEXT" }; // Create document representing provided text

  // Detect the sentiment of the document, if requested
  let sentiment_result = null;
  if (analyze_sentiment) {
    let [sentiment_result_raw] = await client.analyzeSentiment({ document });
    sentiment_result = [
      {
        magnitude: sentiment_result_raw.documentSentiment.magnitude,
        score: sentiment_result_raw.documentSentiment.score,
      },
    ];
    for (const sentence of sentiment_result_raw.sentences) {
      sentiment_result.push({
        text: sentence.text.content,
        magnitude: sentence.sentiment.magnitude,
        score: sentence.sentiment.score,
      });
    }
  }

  // Detect the entities of the document, if requested
  let entity_result = null;
  if (analyze_entities) {
    let [entity_result_raw] = await client.analyzeEntities({ document });
    entity_result = entity_result_raw.entities;
  }

  // Detect the syntax of the document, if requested
  let syntax_result = null;
  if (analyze_syntax) {
    let [syntax_result_raw] = await client.analyzeSyntax({ document });
    syntax_result = [];
    for (const token of syntax_result_raw.tokens) {
      syntax_result.push({
        partOfSpeech: token.partOfSpeech.tag,
        word: token.text.content,
      });
    }
  }

  // Classify the content of the document, if requested
  let classify_result = null;
  if (classify_content) {
    let [classify_result_raw] = await client.classifyText({ document });
    classify_result = [];
    for (const category of classify_result_raw.categories) {
      classify_result.push({
        name: category.name,
        confidence: category.confidence,
      });
    }
  }

  return [sentiment_result, entity_result, syntax_result, classify_result];
}

async function analyzeTextWrapper(
  text,
  analyze_sentiment = true,
  analyze_entities = true,
  analyze_syntax = true,
  classify_content = true
) {
  let sentiment_result;
  let entity_result;
  let syntax_result;
  let classify_result;
  try {
    const result = await analyzeText(
      text, analyze_sentiment, analyze_entities, analyze_syntax, classify_content
    );
    sentiment_result = result[0];
    entity_result = result[1];
    syntax_result = result[2];
    classify_result = result[3];
  } catch (err) {
    const sentiment_result_dummy = [{ magnitude: 0, score: 0 }, { text: 'dummy_text', magnitude: 0, score: 0 }];
    const entity_result_dummy = [{ name: 'dummy_name', type: 'OTHER', salience: 0 }];
    const syntax_result_dummy = [{ word: 'dummy_word', partOfSpeech: 'NOUN' }];
    const classify_result_dummy = [{ name: 'dummy_category', confidence: 0 }];

    sentiment_result = analyze_sentiment ? sentiment_result_dummy : null;
    entity_result = analyze_entities ? entity_result_dummy : null;
    syntax_result = analyze_syntax ? syntax_result_dummy : null;
    classify_result = classify_content ? classify_result_dummy : null;
  }
  return [sentiment_result, entity_result, syntax_result, classify_result];
}

const text = "";

// console.log(`Original text:\n${text}\n`);

// analysis = analyzeTextWrapper(text.replace(/'\n'/g, ' ')).then(
//     ([
//        sentiment_result,
//        entity_result,
//        syntax_result,
//        classify_result,
//      ]) => {
//       console.log(`Overall sentiment:
//     \tMagnitude: ${sentiment_result[0].magnitude}
//     \tScore: ${sentiment_result[0].score}`);
//       console.log();
//       console.log("Line by line:");
//       for (const sentence in sentiment_result) {
//         if (sentence > 0) {
//           console.log(
//               `\tText: ${sentiment_result[sentence].text.replace("\n", " ")}`
//           );
//           console.log(`\tMagnitude: ${sentiment_result[sentence].magnitude}`);
//           console.log(`\tScore: ${sentiment_result[sentence].score}`);
//           console.log();
//         }
//       }

//       console.log("Entities:");
//       for (const entity of entity_result) {
//         console.log(`\tName: ${entity.name.replace("\n", " ")} (${entity.type})`);
//         console.log(`\tSalience: ${entity.salience}`);
//         console.log();
//       }

//       console.log("Syntax:");
//       for (const part of syntax_result) {
//         console.log(`\tWord: ${part.word} (${part.partOfSpeech})`);
//       }
//       console.log();

//       console.log('Categories:');
//       for (const category of classify_result) {
//         console.log(`\tName: ${category.name} (confidence: ${category.confidence})`);
//       }
//       console.log();
//     }
// );

module.exports = analyzeText;

