const BASE = 'http://localhost:5000/api/auth';

const request = (url, method = 'GET', data = null, token = null) =>
  fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(data && { body: JSON.stringify(data) }),
  }).then(r => r.json());

export const signupApi      = (data)          => request(`${BASE}/signup`,       'POST', data);
export const verifyOTPApi   = (data)          => request(`${BASE}/verify-otp`,   'POST', data);
export const resendOTPApi   = (data)          => request(`${BASE}/resend-otp`,   'POST', data);
export const loginApi       = (data)          => request(`${BASE}/login`,        'POST', data);
export const getMeApi       = (token)         => request(`${BASE}/me`,           'GET',  null, token);
export const createStaffApi = (data, token)   => request(`${BASE}/create-staff`, 'POST', data, token);
export const getStaffApi    = (token)         => request(`${BASE}/staff`,        'GET',  null, token);
export const deleteStaffApi = (id, token)     => request(`${BASE}/staff/${id}`,  'DELETE', null, token);
