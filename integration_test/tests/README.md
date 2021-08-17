### E2E UI tests

#### Structure
We aim to use page models. These are a simple abstraction of the UI to reduce duplication in the
tests and speed UI and corresponding test refactoring. Not all tests use page models at the time of
writing, but all new tests should. The rule you should use is this: if you find yourself writing a
selector, you should instead use an existing page model (and extend it if necessary), or if none
exists for your current test, create a page model and place your selector there.

References for those unfamiliar with page models:
- https://testcafe.io/documentation/402826/guides/concepts/page-model#why-use-page-model
- https://github.com/SeleniumHQ/selenium/wiki/PageObjects
- https://martinfowler.com/bliki/PageObject.html

#### Test setup
1.  The tests use dotenv to obtain the test endpoint and portal credentials from their environment.
    This means you can either populate the following environment variables (you will need to supply
    real values):
    ```sh
    FINANCE_PORTAL_ENDPOINT=http://finance-portal-v2.qa.pre.myanmarpay-pre.io.internal:30000
    ADMIN_USER_NAME=portaladmin
    ADMIN_PASSWORD=blah
    USER_NAME=portaluser
    PASSWORD=blah
    ```
    or create a `.env` file in the same directory as the `package.json` file. Two example files are
    provided in this directory. You can find instructions for obtaining portal credentials for the
    QA environment here: https://github.com/modusintegration/mmd-dev#finance-portal-credentials

2.  Install dependencies:
    ```sh
    npm ci
    ```

#### Run tests
```sh
npm run test
```

##### Run a single test
```sh
npm run test -- -t 'name of test'
```
E.g., for one of the login tests with this reasonably long name:
```sh
npm run test -- -t 'Enter a valid username and password, click the submit and should be transferred to the main page'
```

##### With a different browser
```sh
BROWSER_TCAFE=chromium npm run test
```
