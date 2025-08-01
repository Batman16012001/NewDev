// Local Shweta PC
export const environment = {
  production: false,

  //apiShwetaLogin : 'https://p436ejirxi.execute-api.us-east-1.amazonaws.com',

  // apiShwetaLogin: 'http://k8s-default-microing-20cf7cdd45-1047131912.us-east-1.elb.amazonaws.com', //PROD
  apiShwetaLogin: "http://192.168.2.7:3000", //DEV

  //apiShwetaLogin: 'http://k8s-default-microing-20cf7cdd45-1047131912.us-east-1.elb.amazonaws.com',

  // apiCustomerService:
  //   "http://k8s-default-microing-20cf7cdd45-1047131912.us-east-1.elb.amazonaws.com",

  apiCustomerService: "http://192.168.2.7:4003",

  // apiClientsService:
  //   "http://k8s-default-microing-20cf7cdd45-1047131912.us-east-1.elb.amazonaws.com",
  apiClientsService: "http://192.168.2.7:4008",

  apiBenefitDropdowns: "http://192.168.2.52:4001/api",

  // apiBaseUrl: 'https://www.cb.accelifeglobal.com/pwaapi', // prod
  apiUploadUrl: "http://192.168.2.7:4000/api/image",
  // apiUploadUrl: 'https://www.cb.accelifeglobal.com/pwaapi/image',

  // apiQuestionnaireUrl: "http://192.168.2.103:5000/api",
  apiQuestionnaireUrl: "http://192.168.2.7:5000/api",

  // apiDownloadUrl: "http://192.168.2.103:3000",
  apiDownloadUrl: "http://192.168.2.7:3000",
};
