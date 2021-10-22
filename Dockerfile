FROM node:14.18.1-alpine
# First part, build the app
WORKDIR /app
COPY package.json /app/
COPY yarn.lock /app/
RUN yarn install

COPY ./ /app/

# Adds the package version and commit hash
ARG REACT_APP_VERSION
ENV REACT_APP_VERSION=$REACT_APP_VERSION

ARG REACT_APP_COMMIT
ENV REACT_APP_COMMIT=$REACT_APP_COMMIT

RUN yarn run build

# Copy over scripts that enable runtime configuration
COPY docker/entrypoint.sh dist/entrypoint.sh
COPY docker/loadRuntimeConfig.sh dist/loadRuntimeConfig.sh

# Make scripts executable
RUN chmod +x dist/entrypoint.sh
RUN chmod +x dist/loadRuntimeConfig.sh
RUN ls dist/

EXPOSE 8080
ENTRYPOINT ["dist/entrypoint.sh"]
CMD [ "yarn", "serve:prod" ]
