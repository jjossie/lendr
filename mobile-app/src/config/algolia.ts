import algoliasearch from 'algoliasearch/lite';

// Initialize Algolia, requires installing Algolia dependencies:
// https://www.algolia.com/doc/api-client/javascript/getting-started/#install
//
const ALGOLIA_ID = "M52YX0JUOZ";
const ALGOLIA_SEARCH_KEY = "8e535327d9072d3262a2702544924038";

export const ALGOLIA_INDEX_NAME = 'dev_lendr_tools';


export const searchClient = algoliasearch(ALGOLIA_ID, ALGOLIA_SEARCH_KEY);
