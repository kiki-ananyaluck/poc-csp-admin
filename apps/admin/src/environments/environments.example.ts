// This file can be replaced during build by using the `fileReplacements` array.
// When building for production, this file is replaced with `environment.prod.ts`.
// template
const servicePathPrefix = '';

export const environment = {
  consent: {
    organizationId: '',
    collectionPointId: '',
  },
  srm: {
    appId: '',
    pickupSuccessDelayMs: 3000,
    roles: {
      adminMakerRoleId: '',
      adminApproverRoleId: '',
    },
  },
  servicePaths: {
    baseDomain: '',
    sentinel: `${servicePathPrefix}sentinel-gateway-api/sentinel`,
    bff: `${servicePathPrefix}bff-service-api/bff`,
    user: `${servicePathPrefix}userservice-api/api/user-service`,
    notification: `${servicePathPrefix}notification-api/api/notification-service`,
    thirdParty: `${servicePathPrefix}thirdparty-api/api/thirdparty-service`,
    consent: `${servicePathPrefix}consent-api/api/consent-service`,
    codex: `${servicePathPrefix}codex-api/api/codex-service`,
    centralized: `${servicePathPrefix}centralized-api/api/centralized-service`,
    workflow: `${servicePathPrefix}workflow-api/api/workflow-service`,
  },
  wssPath: {
    baseDomain: '',
    notificationHubUrl: `${servicePathPrefix}notification-ws/hubs/app`,
  },
  cdnPaths: {
    imageUserProfile: '',
  },
};
