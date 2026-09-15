const servicePathPrefix = 'uat-';

export const environment = {
  consent: {
    organizationId: '', // TODO: UAT consent organization ID
    collectionPointId: '', // TODO: UAT consent collection point ID
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
    imageUserProfile: '', // TODO: UAT CDN URL สำหรับรูปโปรไฟล์ผู้ใช้
  },
};
