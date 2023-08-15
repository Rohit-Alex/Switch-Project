import { notification } from "antd";
import axios from "axios";
import { IS_CAPITALIZE } from "Constant";
// import jwt from 'jsonwebtoken'

// const NodeCache = import("node-cache");
// const myCache = new NodeCache();

let interceptor;
const createAxiosResponseInterceptor = () => {
  interceptor = axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // Reject promise if usual error
      axios.interceptors.response.eject(interceptor);
      return Promise.reject(error);
    }
  );
};

export const makeHttpRequest = async ({
  path,
  body = {},
  method = "GET",
  header = {},
  timeout = 180000,
  isTimeoutEnabled = true,
}) => {
  axios.interceptors.response.eject(interceptor);

  const source = axios.CancelToken.source();
  createAxiosResponseInterceptor();
  try {
    if (isTimeoutEnabled) {
      setTimeout(() => {
        source.cancel("Cancelling after 100ms");
      }, timeout);
    }

    const headers = { "content-type": "application/json", "Accept": "*/*", ...header };

    const options = {
      url: `${path}`,
      method: method,
      headers,
      data: { ...body },
      cancelToken: source.token,
    };

    const response = await axios(options);
    let apiRes = {};
    if (response?.data) {
      apiRes = response.data;
    }
    return apiRes;
  } catch (error) {
    return new Promise((resolve, reject) => {
      reject(error);
    });
  } finally {
    axios.interceptors.response.eject(interceptor);
  }
};

export const makeHttpRequestWithCancel = async ({
  path,
  body = {},
  method = "GET",
  header = {},
  params = {},
  isTokenEnabled = true,
  timeout = 60000,
  isTimeoutEnabled = true,
  authEnabled = true,
  // authData = null,
  isCancelable = false,
  setSource,
}) => {
  axios.interceptors.response.eject(interceptor);

  const source = axios.CancelToken.source();
  createAxiosResponseInterceptor();
  try {
    if (isTimeoutEnabled) {
      setTimeout(() => {
        source.cancel("Cancelling after 100ms");
      }, timeout);
    }
    if (isCancelable) {
      setSource(source);
    }
    // const accessToken = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJleHRyYW1hcmtzdGVhY2hlcnMwMDIiLCJhdXRoX3RpbWUiOjE2Mzk3NDUxOTIsImlzcyI6ImNvZ25pdG8tbG9naW4tc2VydmljZSIsImV4cCI6MTYzOTc0ODc5MiwiaWF0IjoxNjM5NzQ1MTkyLCJhdXRob3JpdGllcyI6WyJST0xFX1RFQUNIRVIiXX0.puPCkWknho1p8zF8V_6SdTnp85FDbcieys3IiGgwmfmE-ZAXRS73YoikvxnSFSJKibNrsfYR_azs_PttuiGTYA"
    // let auth = isTokenEnabled
    //   ? {
    //       token: accessToken,
    //       Authorization: "Bearer " + accessToken,
    //     }
    //   : {
    //       token: accessToken,
    //     };
    // if (!authEnabled) {
    //   auth = {};
    // }
    // const headers = { "content-type": "application/json", ...header, ...auth };
    const headers = { "content-type": "application/json", ...header };

    const options = {
      url: `${path}`,
      method: method,
      headers,
      data: body,
      cancelToken: source.token,
      params,
      // paramsSerializer
    };
    // if (authData) {
    //   options.auth = authData;
    // }
    const response = await axios(options);
    let apiRes = {};
    if (response && response.data) {
      apiRes = response.data;
    }
    if (apiRes.session_out === 0) {
      window.console.log("1");
    }
    return apiRes;
  } catch (error) {
    return new Promise((resolve, reject) => {
      reject(error);
    });
  } finally {
    axios.interceptors.response.eject(interceptor);
  }
};

export const notificationHandler = ({
  message = "",
  key = "",
  description = "",
  duration = 4.5,
  placement = "topRight",
}) => {
  notification.open({
    key,
    message,
    description,
    onClick: () => {
      notification.close(key);
    },
    duration,
    placement,
  });
};

export const camelToSnakeCase = str => str.replace(/[A-Z]/g, letter => ` ${letter.toUpperCase()}`);
export const firstLetterCapital = str => str.charAt(0).toUpperCase() + str.slice(1)

export const fetchMethod = (url) => axios.get(url)
export const postMethod = (url, body) => axios.post(url, body)


const baseUrl = process.env.REACT_APP_API_BASE_URL

const getUrl = (location, params) => {
  try {
    const url = new URL(location)
    url.search = new URLSearchParams(params)
    return [null, url]
  } catch (err) {
    return [
      {
        description: err.message,
        title: "BAD_REQUEST",
        key: "URL",
        duration: 0,
      },
      null,
    ]
  }
}

export const ApiLocations = {
  GET_TRACE_DETAILS: () => {
    return [null, 'https://www.placeholder.com/todos']
  },
  GET_TRANSACTION_SEARCH: () => {
    return getUrl(`${baseUrl}/transactions/search`)
  },
  GET_API: () => {
    return getUrl(`${baseUrl}/500error`)
  },
}

const fetchWithTimeout = async (
  uri,
  options = {},
  timeout = 6000
) => {
  const controller = new AbortController()
  const config = { ...options, signal: controller.signal }

  setTimeout(() => {
    controller.abort()
  }, timeout)

  try {
    const response = await fetch(uri, config)
    return response
  } catch (err) {
    let error = err || {}

    if (error.name === "AbortError") {
      error = { code: "TIME_OUT", message: "RESPONSE_TIME_OUT" }
    }

    throw error
  }
}

const httpCall = (method) => async (url, token, body, timeout) => {
  const options = {
    method,
    headers: {
      "Accept": "*/*",
    },
    body: JSON.stringify(body),
  }

  try {
    const response = await fetchWithTimeout(url, options, timeout)
    return Promise.resolve(response)
  } catch (err) {
    return Promise.reject(err)
  }
}

export const POST = httpCall("POST")
export const GET = httpCall("GET")


export const PxToRem = (px) => {
  return px * 0.0625
}

export const getMonthNames = () => {
  return ["JAN", 'FEB', 'MAR', 'APR', 'MAY', 'JUNE', 'JULY', 'AUG', 'SEPT', 'OCT', 'NOV', 'DEC']
}

export const encrpytData = (key) => {
  const res = sessionStorage.getItem(key)
  return { res, status: 'success' }
}

// export const TokenExtractor =  (request, reply,next) => {
//   const { GSC_AUDIENCE } = process.env
//   request.headers.auth_info = { is_gsc_request: false }
//   const authHeader = request.headers["authorization"]
//   if (authHeader && GSC_AUDIENCE) {
//     const token = authHeader.split(" ")[1]
//     let decodedData = jwt.decode(token)
//     console.log(decodedData, 'decodedData')
//     if (decodedData && decodedData.aud === GSC_AUDIENCE && decodedData.data && decodedData.data.seller_code) {
//       request.headers.auth_info = { ...decodedData.data, is_gsc_request: true }
//     }
//   }
//   return next()
// }

// export const getTokenFromMemCache = (tokenKey) => {
//   if (myCache.get(tokenKey)) {
//     return myCache.get(tokenKey)
//   }
//   return null
// }

export const getOptions = (page) => {
  return new Promise((resolve) => {
    const newData = new Array(20).fill(0).map((_, index) => ({
      label: `Option${(page - 1) * 20 + index + 1}`,
      value: `opt${page * 20 + index + 1}`
    }));
    resolve(newData);
  });
};

export const sayHello = (name) => {
  let result = 'Hi, ';
  if (IS_CAPITALIZE) {
    result += name[0].toUpperCase() + name.substring(1, name.length);
  } else {
    result += name;
  }
  return result;
};

export class EntityService {
  entities() {
    Promise.resolve('Passed')
  }
}

export const handleAuthentication = (status) => {
    if (status === 401) throw new Error('Unauthorize')
    return 'Authorized'
}

export const getURLParameter = (qrString, paramName) => {
	const qr = qrString.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
	const regex = new RegExp(`[\\?&]${paramName}=([^&#]*)`);
	const results = regex.exec(qr);

	return results && results.length > 0 ? decodeURIComponent(results[1].replace(/\+/g, ' ')) : '';
};

const numberFormatter = (value, options) => {
	const defaultOptions = { style: 'currency', currency: 'INR' };
	return new Intl.NumberFormat('en-IN', { ...defaultOptions, ...options }).format(value);
};
