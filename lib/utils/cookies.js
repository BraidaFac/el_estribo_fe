import cookieCutter from "cookie-cutter";

// Remove server side cookies instance

// Set a cookie
const setItem = (key, value, options = {}) => {
  cookieCutter.set(key, value, options);
};

// Get a cookie
const getItem = (key) => {
  let item = null;
  item = cookieCutter.get(key);
  return item;
};

// Remove a cookie
const removeItem = (key, options = {}) => {
  cookieCutter.set(key, "", { ...options, expires: new Date(0) });
};

const actions = {
  setItem,
  getItem,
  removeItem,
};
export default actions;
