# ZAP Scanning Report

ZAP by [Checkmarx](https://checkmarx.com/).


## Summary of Alerts

| Risk Level | Number of Alerts |
| --- | --- |
| High | 0 |
| Medium | 0 |
| Low | 0 |
| Informational | 5 |




## Insights

| Level | Reason | Site | Description | Statistic |
| --- | --- | --- | --- | --- |
| Low | Warning |  | ZAP errors logged - see the zap.log file for details | 1    |
| Low | Exceeded High | https://host.docker.internal:3000 | Percentage of responses with status code 4xx | 99 % |
| Info | Informational | https://host.docker.internal:3000 | Percentage of responses with status code 2xx | 25 % |
| Info | Informational | https://host.docker.internal:3000 | Percentage of endpoints with content type application/json | 100 % |
| Info | Informational | https://host.docker.internal:3000 | Percentage of endpoints with method DELETE | 3 % |
| Info | Informational | https://host.docker.internal:3000 | Percentage of endpoints with method GET | 63 % |
| Info | Informational | https://host.docker.internal:3000 | Percentage of endpoints with method POST | 29 % |
| Info | Informational | https://host.docker.internal:3000 | Percentage of endpoints with method PUT | 3 % |
| Info | Informational | https://host.docker.internal:3000 | Count of total endpoints | 57    |
| Info | Informational | https://host.docker.internal:3000 | Percentage of slow responses | 1 % |







## Alerts

| Name | Risk Level | Number of Instances |
| --- | --- | --- |
| A Client Error response code was returned by the server | Informational | 59 |
| Authentication Request Identified | Informational | 1 |
| Non-Storable Content | Informational | Systemic |
| Re-examine Cache-control Directives | Informational | 2 |
| Storable and Cacheable Content | Informational | 3 |




## Alert Detail



### [ A Client Error response code was returned by the server ](https://www.zaproxy.org/docs/alerts/100000/)



##### Informational (High)

### Description

A response code of 400 was returned by the server.
This may indicate that the application is failing to handle unexpected input correctly.
Raised by the 'Alert on HTTP Response Code Error' script

* URL: https://host.docker.internal:3000/api/gigs/id
  * Node Name: `https://host.docker.internal:3000/api/gigs/id`
  * Method: `DELETE`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/gigs/id/
  * Node Name: `https://host.docker.internal:3000/api/gigs/id/`
  * Method: `DELETE`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://host.docker.internal:3000
  * Node Name: `https://host.docker.internal:3000`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://host.docker.internal:3000/
  * Node Name: `https://host.docker.internal:3000/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://host.docker.internal:3000/67021798000074965
  * Node Name: `https://host.docker.internal:3000/67021798000074965`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api
  * Node Name: `https://host.docker.internal:3000/api`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/
  * Node Name: `https://host.docker.internal:3000/api/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/4515048675749832759
  * Node Name: `https://host.docker.internal:3000/api/4515048675749832759`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/admin
  * Node Name: `https://host.docker.internal:3000/api/admin`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/admin/
  * Node Name: `https://host.docker.internal:3000/api/admin/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/admin/4718718556328843708
  * Node Name: `https://host.docker.internal:3000/api/admin/4718718556328843708`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/admin/gigs
  * Node Name: `https://host.docker.internal:3000/api/admin/gigs`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/admin/gigs/
  * Node Name: `https://host.docker.internal:3000/api/admin/gigs/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/auth
  * Node Name: `https://host.docker.internal:3000/api/auth`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/auth/
  * Node Name: `https://host.docker.internal:3000/api/auth/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/auth/6799347629937493678
  * Node Name: `https://host.docker.internal:3000/api/auth/6799347629937493678`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/auth/actuator/health
  * Node Name: `https://host.docker.internal:3000/api/auth/actuator/health`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/auth/me
  * Node Name: `https://host.docker.internal:3000/api/auth/me`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/auth/me/
  * Node Name: `https://host.docker.internal:3000/api/auth/me/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/bookings
  * Node Name: `https://host.docker.internal:3000/api/bookings`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/bookings/
  * Node Name: `https://host.docker.internal:3000/api/bookings/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/bookings/6051113104227995617
  * Node Name: `https://host.docker.internal:3000/api/bookings/6051113104227995617`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/bookings/id
  * Node Name: `https://host.docker.internal:3000/api/bookings/id`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/bookings/id/
  * Node Name: `https://host.docker.internal:3000/api/bookings/id/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/bookings/id/2788888754420874988
  * Node Name: `https://host.docker.internal:3000/api/bookings/id/2788888754420874988`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/bookings/mine
  * Node Name: `https://host.docker.internal:3000/api/bookings/mine`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/bookings/mine/
  * Node Name: `https://host.docker.internal:3000/api/bookings/mine/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/gigs/7841538718402413704
  * Node Name: `https://host.docker.internal:3000/api/gigs/7841538718402413704`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/gigs/id
  * Node Name: `https://host.docker.internal:3000/api/gigs/id`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/gigs/id/
  * Node Name: `https://host.docker.internal:3000/api/gigs/id/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/gigs/mine
  * Node Name: `https://host.docker.internal:3000/api/gigs/mine`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/gigs/mine/
  * Node Name: `https://host.docker.internal:3000/api/gigs/mine/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/transactions
  * Node Name: `https://host.docker.internal:3000/api/transactions`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/transactions/
  * Node Name: `https://host.docker.internal:3000/api/transactions/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/transactions/2828323490846922075
  * Node Name: `https://host.docker.internal:3000/api/transactions/2828323490846922075`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/transactions/mine
  * Node Name: `https://host.docker.internal:3000/api/transactions/mine`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/transactions/mine/
  * Node Name: `https://host.docker.internal:3000/api/transactions/mine/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/auth/login
  * Node Name: `https://host.docker.internal:3000/api/auth/login ()({email,password})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/auth/login
  * Node Name: `https://host.docker.internal:3000/api/auth/login ()({email,password})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/auth/login
  * Node Name: `https://host.docker.internal:3000/api/auth/login ()({email,password})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `429`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/auth/login/
  * Node Name: `https://host.docker.internal:3000/api/auth/login/ ()({email,password})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `429`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/auth/register
  * Node Name: `https://host.docker.internal:3000/api/auth/register ()({name,email,password,role})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/auth/register
  * Node Name: `https://host.docker.internal:3000/api/auth/register ()({name,email,password,role})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `429`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/auth/register/
  * Node Name: `https://host.docker.internal:3000/api/auth/register/ ()({name,email,password,role})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `429`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/bookings
  * Node Name: `https://host.docker.internal:3000/api/bookings ()({gigId})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/bookings/
  * Node Name: `https://host.docker.internal:3000/api/bookings/ ()({gigId})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/bookings/id/confirm
  * Node Name: `https://host.docker.internal:3000/api/bookings/id/confirm`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/bookings/id/confirm/
  * Node Name: `https://host.docker.internal:3000/api/bookings/id/confirm/`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/gigs
  * Node Name: `https://host.docker.internal:3000/api/gigs ()({title,description,category,price})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/gigs/
  * Node Name: `https://host.docker.internal:3000/api/gigs/ ()({title,description,category,price})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://host.docker.internal:3000/computeMetadata/v1/
  * Node Name: `https://host.docker.internal:3000/computeMetadata/v1/ ()({email,password})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://host.docker.internal:3000/latest/meta-data/
  * Node Name: `https://host.docker.internal:3000/latest/meta-data/ ()({email,password})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://host.docker.internal:3000/metadata/instance
  * Node Name: `https://host.docker.internal:3000/metadata/instance ()({email,password})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://host.docker.internal:3000/metadata/v1
  * Node Name: `https://host.docker.internal:3000/metadata/v1 ()({email,password})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://host.docker.internal:3000/opc/v1/instance/
  * Node Name: `https://host.docker.internal:3000/opc/v1/instance/ ()({email,password})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://host.docker.internal:3000/opc/v2/instance/
  * Node Name: `https://host.docker.internal:3000/opc/v2/instance/ ()({email,password})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://host.docker.internal:3000/openstack/latest/meta_data.json
  * Node Name: `https://host.docker.internal:3000/openstack/latest/meta_data.json ()({email,password})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/gigs/id
  * Node Name: `https://host.docker.internal:3000/api/gigs/id ()({title,description,category,price})`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/gigs/id/
  * Node Name: `https://host.docker.internal:3000/api/gigs/id/ ()({title,description,category,price})`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``


Instances: 59

### Solution



### Reference



#### CWE Id: [ 388 ](https://cwe.mitre.org/data/definitions/388.html)


#### WASC Id: 20

#### Source ID: 4

### [ Authentication Request Identified ](https://www.zaproxy.org/docs/alerts/10111/)



##### Informational (High)

### Description

The given request has been identified as an authentication request. The 'Other Info' field contains a set of key=value lines which identify any relevant fields. If the request is in a context which has an Authentication Method set to "Auto-Detect" then this rule will change the authentication to match the request identified.

* URL: https://host.docker.internal:3000/api/auth/login
  * Node Name: `https://host.docker.internal:3000/api/auth/login ()({email,password})`
  * Method: `POST`
  * Parameter: `email`
  * Attack: ``
  * Evidence: `password`
  * Other Info: `userParam=email
userValue=zaproxy@example.com
passwordParam=password`


Instances: 1

### Solution

This is an informational alert rather than a vulnerability and so there is nothing to fix.

### Reference


* [ https://www.zaproxy.org/docs/desktop/addons/authentication-helper/auth-req-id/ ](https://www.zaproxy.org/docs/desktop/addons/authentication-helper/auth-req-id/)



#### Source ID: 3

### [ Non-Storable Content ](https://www.zaproxy.org/docs/alerts/10049/)



##### Informational (Medium)

### Description

The response contents are not storable by caching components such as proxy servers. If the response does not contain sensitive, personal or user-specific information, it may benefit from being stored and cached, to improve performance.

* URL: https://host.docker.internal:3000/api/auth/me
  * Node Name: `https://host.docker.internal:3000/api/auth/me`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/gigs/mine
  * Node Name: `https://host.docker.internal:3000/api/gigs/mine`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/auth/login
  * Node Name: `https://host.docker.internal:3000/api/auth/login ()({email,password})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/auth/register
  * Node Name: `https://host.docker.internal:3000/api/auth/register ()({name,email,password,role})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/gigs
  * Node Name: `https://host.docker.internal:3000/api/gigs ()({title,description,category,price})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `401`
  * Other Info: ``

Instances: Systemic


### Solution

The content may be marked as storable by ensuring that the following conditions are satisfied:
The request method must be understood by the cache and defined as being cacheable ("GET", "HEAD", and "POST" are currently defined as cacheable)
The response status code must be understood by the cache (one of the 1XX, 2XX, 3XX, 4XX, or 5XX response classes are generally understood)
The "no-store" cache directive must not appear in the request or response header fields
For caching by "shared" caches such as "proxy" caches, the "private" response directive must not appear in the response
For caching by "shared" caches such as "proxy" caches, the "Authorization" header field must not appear in the request, unless the response explicitly allows it (using one of the "must-revalidate", "public", or "s-maxage" Cache-Control response directives)
In addition to the conditions above, at least one of the following conditions must also be satisfied by the response:
It must contain an "Expires" header field
It must contain a "max-age" response directive
For "shared" caches such as "proxy" caches, it must contain a "s-maxage" response directive
It must contain a "Cache Control Extension" that allows it to be cached
It must have a status code that is defined as cacheable by default (200, 203, 204, 206, 300, 301, 404, 405, 410, 414, 501).

### Reference


* [ https://datatracker.ietf.org/doc/html/rfc7234 ](https://datatracker.ietf.org/doc/html/rfc7234)
* [ https://datatracker.ietf.org/doc/html/rfc7231 ](https://datatracker.ietf.org/doc/html/rfc7231)
* [ https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html ](https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html)


#### CWE Id: [ 524 ](https://cwe.mitre.org/data/definitions/524.html)


#### WASC Id: 13

#### Source ID: 3

### [ Re-examine Cache-control Directives ](https://www.zaproxy.org/docs/alerts/10015/)



##### Informational (Low)

### Description

The cache-control header has not been set properly or is missing, allowing the browser and proxies to cache content. For static assets like css, js, or image files this might be intended, however, the resources should be reviewed to ensure that no sensitive content will be cached.

* URL: https://host.docker.internal:3000/api/gigs
  * Node Name: `https://host.docker.internal:3000/api/gigs`
  * Method: `GET`
  * Parameter: `cache-control`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://host.docker.internal:3000/api/health
  * Node Name: `https://host.docker.internal:3000/api/health`
  * Method: `GET`
  * Parameter: `cache-control`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 2

### Solution

For secure content, ensure the cache-control HTTP header is set with "no-cache, no-store, must-revalidate". If an asset should be cached consider setting the directives "public, max-age, immutable".

### Reference


* [ https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#web-content-caching ](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#web-content-caching)
* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control)
* [ https://grayduck.mn/2021/09/13/cache-control-recommendations/ ](https://grayduck.mn/2021/09/13/cache-control-recommendations/)


#### CWE Id: [ 525 ](https://cwe.mitre.org/data/definitions/525.html)


#### WASC Id: 13

#### Source ID: 3

### [ Storable and Cacheable Content ](https://www.zaproxy.org/docs/alerts/10049/)



##### Informational (Medium)

### Description

The response contents are storable by caching components such as proxy servers, and may be retrieved directly from the cache, rather than from the origin server by the caching servers, in response to similar requests from other users. If the response data is sensitive, personal or user-specific, this may result in sensitive information being leaked. In some cases, this may even result in a user gaining complete control of the session of another user, depending on the configuration of the caching components in use in their environment. This is primarily an issue where "shared" caching servers such as "proxy" caches are configured on the local network. This configuration is typically found in corporate or educational environments, for instance.

* URL: https://host.docker.internal:3000/api/gigs
  * Node Name: `https://host.docker.internal:3000/api/gigs`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: `In the absence of an explicitly specified caching lifetime directive in the response, a liberal lifetime heuristic of 1 year was assumed. This is permitted by rfc7234.`
* URL: https://host.docker.internal:3000/api/gigs/id
  * Node Name: `https://host.docker.internal:3000/api/gigs/id`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: `In the absence of an explicitly specified caching lifetime directive in the response, a liberal lifetime heuristic of 1 year was assumed. This is permitted by rfc7234.`
* URL: https://host.docker.internal:3000/api/health
  * Node Name: `https://host.docker.internal:3000/api/health`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: `In the absence of an explicitly specified caching lifetime directive in the response, a liberal lifetime heuristic of 1 year was assumed. This is permitted by rfc7234.`


Instances: 3

### Solution

Validate that the response does not contain sensitive, personal or user-specific information. If it does, consider the use of the following HTTP response headers, to limit, or prevent the content being stored and retrieved from the cache by another user:
Cache-Control: no-cache, no-store, must-revalidate, private
Pragma: no-cache
Expires: 0
This configuration directs both HTTP 1.0 and HTTP 1.1 compliant caching servers to not store the response, and to not retrieve the response (without validation) from the cache, in response to a similar request.

### Reference


* [ https://datatracker.ietf.org/doc/html/rfc7234 ](https://datatracker.ietf.org/doc/html/rfc7234)
* [ https://datatracker.ietf.org/doc/html/rfc7231 ](https://datatracker.ietf.org/doc/html/rfc7231)
* [ https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html ](https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html)


#### CWE Id: [ 524 ](https://cwe.mitre.org/data/definitions/524.html)


#### WASC Id: 13

#### Source ID: 3


