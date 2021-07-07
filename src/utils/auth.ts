import axios from 'axios';

// TODO:
// - Implement a `/token` or `/cookie` backend call to allow the portal to check whether its
//     current creds are still valid, in order to decide what to render.
/**
 * This function makes a call to the portal backend to see if the request carries a valid cookie
 *
 * @returns {boolean}
 */
export default async function checkTokenCookie() {
  try {
    const response = await axios({
      method: 'GET',
      url: '/api/portal-backend/dfsps',
      validateStatus: (code) => (code > 199 && code < 300) || code === 401,
      withCredentials: true,
    });

    // return false if we get an unauthorised response status
    if (response.status === 401) {
      return false;
    }

    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return false;
  }
}
