const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiEndpoints = {
  register: '/register',
  login: '/login',
  allbanners: '/all-banners',
  uploadbanners: '/upload-multiple-banners',
  users: '/users',
  uploads: '/uploads',
  getbyid: '/getbyid',
  notifications: '/notifications',
  birthdays: '/birthdays',
  visiblebanners: '/visible-banners',
  count: '/notifications/count',
  markRead: '/notifications/mark-read',
  changePassword:'/change-password',
  forgotPassword:'/forgot-password',
  // addUser:'/add-user',

} as const;

type Endpoint = keyof typeof apiEndpoints;

const getApiUrl = (endpoint: Endpoint): string => {
  return `${API_BASE_URL}${apiEndpoints[endpoint]}`;
};

export default getApiUrl;
