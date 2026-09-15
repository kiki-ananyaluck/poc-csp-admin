// This file can be replaced during build by using the `fileReplacements` array.
// When building for production, this file is replaced with `environment.prod.ts`.

const servicePathPrefix = '';

export const environment = {
  consent: {
    organizationId: '3c7c07b6-8ca1-4991-82ca-d59fff6ed6f3',
    collectionPointId: '23f82a2a-f839-4a1a-a001-b97e821b7cdf',
  },
  srm: {
    appId: 'b52377f7-4c31-48bc-ab63-fb7d69688bd9',
    pickupSuccessDelayMs: 3000,
    roles: {
      adminMakerRoleId: '19464c24-88e0-46dc-83b1-9ed587eb7bbb',
      adminApproverRoleId: '19464c24-88e0-46dc-83b1-9ed587eb7aaa',
    },
  },
  servicePaths: {
    baseDomain: 'https://gateway-dev.exim.go.th',
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
    baseDomain: 'https://gateway-dev.exim.go.th',
    notificationHubUrl: `${servicePathPrefix}notification-ws/hubs/app`,
  },
  cdnPaths: {
    imageUserProfile: 'https://suastoragedev.exim.go.th/',
  },
};
