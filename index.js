module.exports = function filter(options) {

  options = options || {};

  var checkNames = options.checkNames || true;
  var typeList = options.typeList || ['object', 'function', 'string'];
  var urlBlackList = options.urlBlackList || ['$', '{'];
  var bodyBlackList = options.bodyBlackList || ['$'];
  var methodList = options.methodList || ['GET', 'POST', 'PUT', 'DELETE'];
  var urlMessage = options.urlMessage || 'A forbidden expression has been found in URL: ';
  var bodyMessage = options.bodyMessage || 'A forbidden expression has been found in form data: ';
  var appendFound = options.appendFound || true;
  var caseSensitive = (options.caseSensitive === false) ? false : true;
  var dispatchToErrorHandler = (options.dispatchToErrorHandler === true) ? true : false;

  var errorStatus = 403;
  var errorCode = "FORBIDDEN_CONTENT";

  return function filter(ctx, next) {
    /* Only examine the valid methodList */
    if (methodList.indexOf(ctx.request.method) === -1) {
      return next();
    }
    var found = null;
    /* Examining the URL */
    if (caseSensitive) {
      for (var i = 0; i < urlBlackList.length; i++) {
        /* The URL in the ctx.request might be handled by using 'ctx.req.params.id' for 'address/users/:id' by a programmer.
           Because of this don't use ctx.req.query object instead of ctx.originalUrl value */
        if (ctx.originalUrl.indexOf(urlBlackList[i]) !== -1) {
          found = urlBlackList[i];
          break;
        }
      }
    } else {
      /* If caseSensitive is `false` convert the originalURL value and bodyBlackList items into lowercase strings then examine them */
      var url = ctx.originalUrl.toLowerCase();
      for (var i = 0; i < urlBlackList.length; i++) {
        if (url.indexOf(urlBlackList[i].toLowerCase()) !== -1) {
          found = urlBlackList[i];
          break;
        }
      }
    }
    if (found) {
      if (dispatchToErrorHandler) {
        throw new Error({ status: errorStatus, code: errorCode, message: urlMessage + (appendFound ? found : "") });
      } else {
        return ctx.response.body = { status: errorStatus, code: errorCode, message: urlMessage + (appendFound ? found : "") };
      }
    }
    /* Examining the ctx.request.body object If there is a ctx.request.body object it must be checked */
    if (ctx.request.body && Object.keys(ctx.request.body).length) {
      // // hrstart is used for to calculate the elapsed time
      // // https://ponsenodejs.org/api/process.html#process_process_hrtime
      // var hrstart = process.hrtime()
      var str = JSON.stringify(ctx.request.body);
      /* If caseSensitive is `true` search for bodyBlackList items in combined body string */
      if (caseSensitive) {
        for (var i = 0; i < bodyBlackList.length; i++) {
          if (str.indexOf(bodyBlackList[i]) !== -1) {
            found = bodyBlackList[i];
            break;
          }
        }
      } else {
        /* If caseSensitive is `false` convert the string and bodyBlackList items into lowercase strings then examine them */
        str = str.toLowerCase();
        for (var i = 0; i < bodyBlackList.length; i++) {
          if (str.indexOf(bodyBlackList[i].toLowerCase()) !== -1) {
            found = bodyBlackList[i];
            break;
          }
        }
      }
      // // hrend is used for to calculate the elapsed time
      // var hrend = process.hrtime(hrstart)
      // console.log('Execution time (hr): %ds %dms', hrend[0], hrend[1]/1000000)
      if (found) {
        if (dispatchToErrorHandler) {
          throw new Error({ status: errorStatus, code: errorCode, message: bodyMessage + (appendFound ? found : "") });
        } else {
          return ctx.response.body = { status: errorStatus, code: errorCode, message: bodyMessage + (appendFound ? found : "") };
        }
      } else {
        return next();
      }
    } else {
      return next();
    }
  };
};
