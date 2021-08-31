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

### Setup

#### Get a Kubernetes cluster

You'll probably want at least four cores and 8gb mem. This is left as an exercise for the reader.
Some suggestions:
1. [Minikube](https://minikube.sigs.k8s.io/docs/)
2. [k3d](https://k3d.io/)
3. [KinD](https://kind.sigs.k8s.io/docs/)
4. [DigitalOcean](https://www.digitalocean.com/products/kubernetes/)

#### Install dependencies

##### Application dependencies
You have two choices here: [with Nix](#with-nix) and [without Nix](#without-nix). The advantages of
using Nix here are:
1. Exactly the same versions of dependencies as CI, and other developers (except core system things
   like the kernel/container runtime).
2. Therefore, no need to track and manage dependency versions, simply run one command to get all
   required dependencies at the correct versions, and enter a shell with those dependencies.

###### With Nix
1. Install nix:
    ```sh
    curl -L https://nixos.org/nix/install | sh -s -- --no-daemon
    ```
    (From: https://nixos.org/manual/nix/stable/#sect-single-user-installation)
2. Navigate to the `integration_test` directory of this project
3. Run `nix-shell` to be dropped into a shell containing all necessary dependencies

###### Without Nix
Install the following:
- Google Chrome (it's possible to use another browser, see [run tests with a different browser](#with-a-different-browser))
- Skaffold v1.28.0 or greater: https://github.com/GoogleContainerTools/skaffold/releases

##### Deploy portal, Mojaloop and dependencies to cluster
From the project root:
```sh
skaffold run
```
Skaffold will build portal v2 from the local Dockerfile, push the built image into the image
registry hosted in your cluster (Minikube, KinD, k3d) or to your logged-in docker registry, then
deploy the locally built portal image and Mojaloop etc. to the cluster.

##### Install integration test npm dependencies
From the `integration_test/tests` directory:
```sh
npm ci
```

### Run tests
From the `integration_test/tests` directory:
```sh
npm run test
```
#### View results
From the `integration_test/tests` directory:
```sh
$BROWSER results.html
```

#### Run a single test
```sh
npm run test -- -t 'name of test'
```
E.g., for one of the login tests:
```sh
npm run test -- -t 'Log in with valid credentials'
```

#### With a different browser
```sh
BROWSER_TCAFE=chromium npm run test
# or
BROWSER_TCAFE=firefox npm run test
```

#### Testing local changes

#### Re-running tests with changes
In the project root, re-build and redeploy your changes:
```sh
skaffold run
```
From `integration_tests/tests` directory, execute integration tests:
```sh
npm run test
```
