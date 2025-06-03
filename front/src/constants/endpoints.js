const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiEndpoints = {
  register: '/register',
  login: '/login',
  allbanners: '/all-banners',
  uploadbanners:'/upload-multiple-banners',
  users: '/users',
  uploads:'/uploads',
  getbyid:'/getbyid',
  notifications:'/notifications',
    birthdays:'/birthdays',
    visiblebanners:'/visible-banners'

};

const getApiUrl = (endpoint) => {
 
  return `${API_BASE_URL}${apiEndpoints[endpoint]}`;
};

export default getApiUrl;
