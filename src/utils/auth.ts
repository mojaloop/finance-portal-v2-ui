import axios from 'axios';

/**
 * This function makes a call to the settlement API to see if the request carries a valid cookie
 *
 * @returns {boolean}
 */
export default async function checkTokenCookie() {
  try {
    const response = await axios({
      method: 'GET',
      url: '/api/login/userInfo',
      validateStatus: (code) => (code > 199 && code < 300) || code === 401,
      withCredentials: true,
    });

    // return false if we get an unauthorised response status
    if (response.status === 401) {
      return false;
    }

    return response.data;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return false;
  }
}
