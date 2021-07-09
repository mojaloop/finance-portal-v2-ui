# Settlement Manager UI

## Local Development

### TODO
- Thin out the `portal-backend.env` file and remove redundant configuration and defaults.

### Prerequisites

You'll only have to do this once per development environment.

#### Applications

- Docker cli 19.09 or newer, for `--pull=always`. Check with `docker version -f '{{.Client.Version}}'`.
- Docker engine 20.04 or newer, for `--add-host host.docker.internal:host-gateway`. Check with `docker version -f '{{.Server.Version}}'`.
- curl
- yarn
- kubectl

#### Modusintegration Github Container Registry Access

If you can already pull the following image, you won't need to follow these steps:
```sh
docker pull ghcr.io/modusintegration/wso2is-populate:latest
```
Otherwise follow the steps ![here](https://github.com/modusintegration/mmd-dev#ghcr-access)

#### VPN access
Follow the instructions here: https://github.com/modusintegration/mmd-dev#vpn-access

#### Kubernetes cluster config files
Follow the instructions here: https://github.com/modusintegration/mmd-dev#iac-configuration-file-access

### Run Services

#### Locally, with Docker

These commands will share environment variables through your shell. Be sure to run them all from
the same shell instance (normally you can just use the same terminal window).

1.  Create docker network so our containers can talk to each other
    ```sh
    docker network create --driver=bridge portal-net
    ```

2.  Run WSO2
    ```sh
    docker run \
      -p 9443:9443 \
      --name=wso2 \
      --network=portal-net \
      --rm \
      --detach \
      --volume=$PWD/integration_test/shared/manifests/wso2/identity.xml:/home/wso2carbon/wso2is-km-5.7.0/repository/conf/identity/identity.xml \
      wso2/wso2is-km:5.7.0
    ```

    You'll need to wait a few minutes until you see the following log line in the WSO2 container:
    ```
    [2021-05-13 11:39:58,203]  INFO {org.wso2.carbon.identity.authenticator.x509Certificate.internal.X509CertificateServiceComponent} -  X509 Certificate Servlet activated successfully..
    ```
    You can watch for this with
    ```sh
    docker logs -f wso2
    ```
    The logs are busy, but don't worry, you won't miss the important line, it'll be the last one
    printed before the logging goes quiet at the end of the start-up sequence. Once you've seen the
    line of interest, kill the logs with `<ctrl-c>`.

3.  Populate WSO2
    ```sh
    AUTH_SERVER_CLIENTKEY="$(< /dev/urandom tr -dc _A-Za-z0-9 | head -c30)"
    AUTH_SERVER_CLIENTSECRET="$(< /dev/urandom tr -dc _A-Za-z0-9 | head -c30)"
    ```
    You will likely need to wait a few moments for WSO2 to come up. Once it's stopped running, do
    the following:
    ```sh
    docker run \
        --rm \
        --env WSO2_HOST="https://wso2:9443" \
        --env AUTH_SERVER_CLIENTKEY="$AUTH_SERVER_CLIENTKEY" \
        --env AUTH_SERVER_CLIENTSECRET="$AUTH_SERVER_CLIENTSECRET" \
        --network=portal-net \
        --pull=always \
        ghcr.io/modusintegration/wso2is-populate:latest
    ```

4.  Check OAuth
    ```sh
    curl -k -X POST 'https://localhost:9443/oauth2/token' \
        --header 'Content-Type: application/x-www-form-urlencoded' \
        --data-urlencode "client_id=$AUTH_SERVER_CLIENTKEY" \
        --data-urlencode "client_secret=$AUTH_SERVER_CLIENTSECRET" \
        --data-urlencode 'grant_type=password' \
        --data-urlencode 'scope=openid' \
        --data-urlencode 'username=portaladmin' \
        --data-urlencode 'password=mcvV2KYw9eKPqNagjGy6'
    ```
    The result should be json something like:
    ```json
    {
      "access_token": "eyJ4NXQiOiJOVEF4Wm1NeE5ETXlaRGczTVRVMVpHTTBNekV6T0RKaFpXSTRORE5sWkRVMU9HRmtOakZpTVEiLCJraWQiOiJOVEF4Wm1NeE5ETXlaRGczTVRVMVpHTTBNekV6T0RKaFpXSTRORE5sWkRVMU9HRmtOakZpTVEiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJwb3J0YWxhZG1pbkBjYXJib24uc3VwZXIiLCJhdWQiOiJYUFJUOFMyaHdwd0kyR2cwc3BoanMzRF9qXzdhNDUiLCJuYmYiOjE2MjQ4ODk2MjQsImF6cCI6IlhQUlQ4UzJod3B3STJHZzBzcGhqczNEX2pfN2E0NSIsInNjb3BlIjoib3BlbmlkIiwiaXNzIjoiaHR0cHM6XC9cL2xvY2FsaG9zdDo5NDQzXC9vYXV0aDJcL3Rva2VuIiwiZ3JvdXBzIjpbIm5kY191cGRhdGUiLCJBcHBsaWNhdGlvblwvcG9ydGFsb2F1dGgiLCJJbnRlcm5hbFwvZXZlcnlvbmUiXSwiZXhwIjoxNjI0ODkzMjI0LCJpYXQiOjE2MjQ4ODk2MjQsImp0aSI6IjFiY2Q4Zjc0LWZjMDAtNGY5NS1hMzU5LTIxMTg0YzUyM2QzMCJ9.VELD7hblmAjAvYkRZpxhxZOGT-nnOeeJDBl8KPWD7NE1UT0QMQMwbNZ1X3Lp0NMsLJYnr10jFf9OuVDJWl6zWtWuHoXt-xp78AndIEFXMomd_DCKyGhSVm6PEKZb74yUcjmzen58bvPXyPEuV7m6DmoVgx8wThj5O_3DLMR2P4lynkhlTYrPXS1HdQsFlP5f3MhpJjPPrFjGLRKd9xJNUDZKBWBWcgYJao7QR2WsVn1f_R8itcFt6lth7X3a80kyUgypISmixydj9k0vTm1l5pvJlpWOcAKe239H_6cnGmiT2aGWA5USZUw7OVBLpkxKSH4QXMkYFNhs9xg394TVhA",
      "refresh_token": "26ff0499-5ca0-3c2a-8238-8233acbd7f8e",
      "scope": "openid",
      "id_token": "eyJ4NXQiOiJOVEF4Wm1NeE5ETXlaRGczTVRVMVpHTTBNekV6T0RKaFpXSTRORE5sWkRVMU9HRmtOakZpTVEiLCJraWQiOiJOVEF4Wm1NeE5ETXlaRGczTVRVMVpHTTBNekV6T0RKaFpXSTRORE5sWkRVMU9HRmtOakZpTVEiLCJhbGciOiJSUzI1NiJ9.eyJhdF9oYXNoIjoibXotOXZ6NkZBQVpFWWFrQ1otWGU5dyIsImF1ZCI6IlhQUlQ4UzJod3B3STJHZzBzcGhqczNEX2pfN2E0NSIsInN1YiI6Im5kY191cGRhdGUsQXBwbGljYXRpb25cL3BvcnRhbG9hdXRoLEludGVybmFsXC9ldmVyeW9uZSIsIm5iZiI6MTYyNDg4OTYyNCwiYXpwIjoiWFBSVDhTMmh3cHdJMkdnMHNwaGpzM0Rfal83YTQ1IiwiYW1yIjpbInBhc3N3b3JkIl0sImlzcyI6Imh0dHBzOlwvXC9sb2NhbGhvc3Q6OTQ0M1wvb2F1dGgyXC90b2tlbiIsImdyb3VwcyI6WyJuZGNfdXBkYXRlIiwiQXBwbGljYXRpb25cL3BvcnRhbG9hdXRoIiwiSW50ZXJuYWxcL2V2ZXJ5b25lIl0sImV4cCI6MTYyNDg5MzIyNCwiaWF0IjoxNjI0ODg5NjI0fQ.F1ZpZ9b6vE3F8HOElDy_PHHUVT53SSuRnJ-8pK-eImbr-DOeuzDDA-qs-iVJnOuJac9fBXGhsdOzXJOViyICuc5S0-QwmPIO6GSGk1oHUpEf42O0jpOKIK_cRmn3iOA87ULplsSOe4mWpk3COdcwqmR6XhmApVOhiOqBOOkJXeiFWQSpp62xwgF0SH18PzgI0j3iBm0c4FbqqxM3v4nP6bkm71WlFijLCu5kgQxDwi44JtPhbwrmFQryl71OG3g2ON0_Eqsfe80cgNfAAWzFIV8QIrGHTStbNf6DaobNZcnRCswMzKLklHKkF92mp3gi6EPVU14vfihpwTvDlfRU4w",
      "token_type": "Bearer",
      "expires_in": 3600
    }
    ```

4.  Run portal backend:
    ```sh
    # Before running this command, make sure you are accessing the correct Kubernetes cluster,
    # i.e. you're using the correct KUBECONFIG file.
    CLUSTER_CENTRALLEDGER_DB_PW="$(kubectl get secret -n mojaloop mojaloop-centralledger-mysql -o json | jq '.data."mysql-password" | @base64d' -r)"
    docker run \
        --rm \
        --env-file=portal-backend.env \
        --network=portal-net \
        -p 3002:3002 \
        --name=portal-backend \
        -e AUTH_SERVER_CLIENTKEY="$AUTH_SERVER_CLIENTKEY" \
        -e AUTH_SERVER_CLIENTSECRET="$AUTH_SERVER_CLIENTSECRET" \
        -e DB_PASSWORD="$CLUSTER_CENTRALLEDGER_DB_PW" \
        --pull=always \
        --detach \
        --add-host=host.docker.internal:host-gateway \
        mojaloop/finance-portal-backend-service
    ```

5.  Test login:
    ```sh
    curl --location --request POST 'localhost:3002/login' \
        --header 'Content-Type: application/json' \
        --data-raw '{
          "username": "portaladmin",
          "password": "mcvV2KYw9eKPqNagjGy6"
        }'
    ```
    The result should look like:
    ```json
    {"expiresIn":3600}
    ```

6.  Port-forward the settlement service, central ledger admin service, and the database:
    ```sh
    # Before running this command, make sure you are accessing the correct Kubernetes cluster,
    # i.e. you're using the correct KUBECONFIG file.
    kubectl port-forward -n mojaloop --address=0.0.0.0 deploy/mojaloop-centralsettlement-service 3007
    kubectl port-forward -n mojaloop --address=0.0.0.0 sts/mojaloop-centralledger-mysql 3306
    kubectl port-forward -n mojaloop --address=0.0.0.0 deploy/mojaloop-centralledger-service 4001:3001
    ```
    If this proves unreliable, you might like to wrap it in a loop:
    ```sh
    while true; do kubectl port-forward -n mojaloop --address 0.0.0.0 deploy/mojaloop-centralledger-service 4001:3001; done
    while true; do kubectl port-forward -n mojaloop --address=0.0.0.0 deploy/mojaloop-centralsettlement-service 3007; done
    while true; do kubectl port-forward -n mojaloop --address=0.0.0.0 sts/mojaloop-centralledger-mysql 3306; done
    ```
    The script in `./scripts/port-forward.sh` might be useful, but will not handle failure of a
    port-forward well.

7.  Bring up the v2 fp-ui and required proxy to test. From this repo:
    ```sh
    yarn install
    yarn build
    yarn start
    ```

8.  Access the finance portal at http://localhost:3000/. Use `portaladmin/mcvV2KYw9eKPqNagjGy6` to log
    in. This may take a few seconds each time you run `yarn start`.

## Helm

### Release a New Chart

1. Make relevant application and/or image and/or chart changes.
2. Create a PR containing your changes and assign it to the relevant reviewers.
3. Once the PR is merged, [create a new release](https://github.com/mojaloop/finance-portal-v2-ui/releases/new)
    with the title `vX.Y.Z`. See [previous
    releases](https://github.com/mojaloop/finance-portal-v2-ui/releases) for
    examples.
4. Wait for the [CI job](https://github.com/mojaloop/finance-portal-v2-ui/actions)
   triggered by the PR to complete.

### Use The Chart

1. Add the portal settlements repo:
    ```sh
    helm repo add portal https://raw.githubusercontent.com/mojaloop/finance-portal-v2-ui/repo
    ```
2. Check it worked:
    ```sh
    helm search repo portal/finance-portal-v2-ui
    ```

Now, in `Chart.yaml` or `requirements.yaml`:
```yaml
dependencies:
- name: finance-portal-v2-ui
  version: v1.0.0 # replace as necessary
  repository: https://raw.githubusercontent.com/mojaloop/finance-portal-v2-ui/repo
  condition: finance-portal-v2-ui.enabled
```

## Release a New Version

1. Make relevant application and/or image changes. Be sure to update the version in `package.json`.
2. Create a PR containing your changes and assign it to the relevant reviewers.
3. Once the PR is merged, [create a new release](https://github.com/mojaloop/finance-portal-v2-ui/releases/new)
    with the title `vX.Y.Z`. See [previous
    releases](https://github.com/mojaloop/finance-portal-v2-ui/releases) for
    examples.
4. Wait for the [CI job](https://github.com/mojaloop/finance-portal-v2-ui/actions)
   triggered by the PR to complete.

The new image will be available at ghcr.io/mojaloop/finance-portal-v2-ui.

To use the image, you'll need to follow these steps:

1. Get a GitHub personal access token to log into GitHub Container Registry locally. You'll only
   have to do this once per machine, or if you change your token.
    1. Create an access token with `read:packages` scope: https://github.com/settings/tokens/new?scopes=read:packages,write:packages
    2. Record the access token somewhere suitable- note: this token is _SECRET_.
    3. Enable SSO for the token you've just made: https://github.com/settings/tokens
2. Log in to GHCR. You'll only have to do this once per machine, or if you change your token.
    ```sh
    # use your token here
    TOKEN=""
    # your GH user name here
    USER=""
    docker login ghcr.io -u "$USER" -p "$TOKEN"
    ```
3. Pull the image:
    ```sh
    docker pull ghcr.io/mojaloop/finance-portal-v2-ui
    ```

To deploy an image from a private repo in a private Kubernetes cluster:

Important: this uses your _personal_ access token. You should most likely not use this token in a
shared cluster.

1. If you have not already, follow the steps in the previous section to log in to GHCR.
2. Extract your GHCR auth from your local docker config:
    ```sh
    jq '.auths = (.auths | with_entries(select(.key == "ghcr.io")))' ~/.docker/config.json > config.json
    ```
3. Follow the [instructions here](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/#registry-secret-existing-credentials)
    using the config file created in the previous step.

## Guidelines

### Styling

The project aims to use the BEM naming convention.

### Coding

The project uses TypeScript. Utility command `yarn lint` can help identifing wrong and missing types.

### Versioning

Versioning is done via `yarn version`. Usually a _patch_ version change is enough; if a new page/module is added, instead, a _minor_ change is required.

### Backend API

The UI is configured to expect its backend APIs to be served from the same endpoint as the main bundle. This means that...

#### In Development

You start the front end with `yarn start` and you must have the backend service(s) running on localhost:3002.
See /webpack.config.js for proxy details. You can tweak these for local development if you need to run multiple backend services

#### In Production

You need a kubernetes ingress which maps the relevant backend services to the correct paths. An ingress which does this is provided in the Mojaloop finance portal HELM chart:
- https://github.com/mojaloop/helm/blob/f576079637acc5920d41ba88bb04dc860e7d4498/finance-portal/values.yaml#L141
- https://github.com/mojaloop/helm/blob/f576079637acc5920d41ba88bb04dc860e7d4498/finance-portal/values.yaml#L170
- https://github.com/mojaloop/helm/tree/f576079637acc5920d41ba88bb04dc860e7d4498/finance-portal/templates


#### Testing the built image

To test the built image you should deploy and run it in a kubernetes cluster via the mojaloop finance portal HELM chart. Backing services will need to be present for backend API requests to succeed.

### Pushing to the repo

Before merging any PR, make sure that:
- the version is incremented. the command `yarn version` should be used for this purpose.
- every changed line followes the styleguide pattern; the command `yarn prettier` should be used for this purpose.
- there are no linting issues; the command `yarn lint` should be used for this purpose.

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject` - DON'T DO THIS

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

### `yarn prettier`

Runs prettier on the project source files.

### `yarn lint`

Runs ESLint on the project source files.

### `yarn serve`

Serves the production build on port 8080.

## Docker

### Building docker image

The command `docker build -t settlement-manager-ui .` creates a docker image with the name `settlement-manager-ui`.

### Running the docker image

The command `docker run --rm -p 8080:8080 settlement-manager-ui` runs the docker image binding the port 8080.

## Makefile

### Building the docker image

The command `make build` creates a docker image with the name `settlement-manager-ui`. Exposes the UI on port 8080.

### Running the docker image

The command `make run` runs the docker image binding the port 8080.
