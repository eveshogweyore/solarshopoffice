const fs = require('fs');

// Patch fs.readlink
const originalReadlink = fs.readlink;
fs.readlink = function (path, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  originalReadlink.call(fs, path, options, (err, linkString) => {
    if (err && err.code === 'EISDIR') {
      const newErr = new Error(`EINVAL: invalid argument, readlink '${path}'`);
      newErr.code = 'EINVAL';
      newErr.errno = -4071;
      return callback(newErr);
    }
    callback(err, linkString);
  });
};

// Patch fs.readlinkSync
const originalReadlinkSync = fs.readlinkSync;
fs.readlinkSync = function (path, options) {
  try {
    return originalReadlinkSync.call(fs, path, options);
  } catch (err) {
    if (err && err.code === 'EISDIR') {
      const newErr = new Error(`EINVAL: invalid argument, readlink '${path}'`);
      newErr.code = 'EINVAL';
      newErr.errno = -4071;
      throw newErr;
    }
    throw err;
  }
};

// Patch fs.promises.readlink
if (fs.promises && fs.promises.readlink) {
  const originalPromisesReadlink = fs.promises.readlink;
  fs.promises.readlink = function (path, options) {
    return originalPromisesReadlink.call(fs.promises, path, options).catch((err) => {
      if (err && err.code === 'EISDIR') {
        const newErr = new Error(`EINVAL: invalid argument, readlink '${path}'`);
        newErr.code = 'EINVAL';
        newErr.errno = -4071;
        throw newErr;
      }
      throw err;
    });
  };
}

console.log('Successfully loaded network drive fs patch.');
