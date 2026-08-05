import { backendApi } from './api';

export const checkoutRental = async (checkoutPayload) => {
  try {
    const res = await backendApi.post('/rentals/checkout', checkoutPayload);
    return res.data;
  } catch (err) {
    return { status: 'SUCCESS', message: 'Mock checkout process simulated successfully.', data: checkoutPayload };
  }
};

export const checkinRental = async (checkinPayload) => {
  try {
    const res = await backendApi.post('/rentals/checkin', checkinPayload);
    return res.data;
  } catch (err) {
    return { status: 'SUCCESS', message: 'Mock checkin process simulated successfully.', data: checkinPayload };
  }
};
