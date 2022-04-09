import axios from 'axios';

export const request = async (method, url, body={}, options={}) => {
  let request;

  switch (method) {
    case 'GET':
      request = await axios.get(url);
      break;
    case 'POST':
      request = await axios.post(url, body, options);
      break;
    case 'PUT':
      request = await axios.put(url, body);
      break;
    case 'DELETE':
      request = await axios.delete(url, { data: body });
      break;
    case 'PATCH':
      request = await axios.patch(url, body);
      break;
    default:
      break;
  }

  return request;
};