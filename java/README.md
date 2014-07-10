MongoAccessLogValve
=======================

``MongoAccessLogValve`` is use to save tomcat access log to mongodb.

This project is inspired by two articles:

1. [MongoDB is fantastic for logging](http://blog.mongodb.org/post/172254834/mongodb-is-fantastic-for-logging)
2. [MongoDB use case - storing log data](http://docs.mongodb.org/ecosystem/use-cases/storing-log-data/)

## Usage

Clone the code and built it with maven, copy the ``tomcat-mongo-access-log-${version}.jar`` to ``${TOMCAT_HOME}/lib``.

Configure ``MongoAccessLogValve`` in ``${tomcat}/conf/server.xml``, ``${tomcat}/conf/context.xml`` or in a context file. 

Example:

```xml
<Valve 
    className="chanjarster.tomcat.valves.MongoAccessLogValve" 
    uri="mongodb://localhost/tomcat"
    pattern="default" />
```

## Attributes

``MongoAccessLogValve`` supports the following configuration attributes of [AccessLogValve](http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve) :

1. condition
1. resolveHosts
1. conditionIf
1. excludes
1. pattern. A little different from ``AccessLogValve``, see below 
1. requestAttributesEnabled

And some attributes differs from ``AccessLogValve``:

| Attribute   | Description |
|-------------|-------------|
| uri         | MongoDB's uri (See [MongoClientURI API](http://api.mongodb.org/java/current/com/mongodb/MongoClientURI.html))     |
| dbName      | Which DB to store logs, default is ``tomcat`` |
| collName    | Which collection to store logs, default is ``tomcat_access_logs``      |
| excludes    | Default is ``".js,.css,jpg,.jpeg,.gif,.png,.bmp,.gif,.html,.htm"``. Don't log the URI request matches some pattern    |
| rotatable   | If rotatable is on, ``MongoDBAccessLogValve`` will try to create a capped collection with the size of ``capSize``(default is 1024, in megabytes) if the collection is not exist     |
| capSize     | The size of capped collection, in megabytes |
| rotateCount | **Not supported** |
| recordError | Default is true. ``MongoAccessLogValve`` will store exception stack traces in ``error`` key when exception throws |

### Collection Indexes

While it's hard to determine which fields should be indexed, but ``MongoAccessLogVavle`` provide the following indexes when it creates the Collection, so the query performance is not guaranteed. May be it's better to determine how to create index by yourself.  

```javascript
{ sessionId : 1}
{ datetime : -1}
{ user : 1}
{ statusCode : 1}
{ elapsedSeconds : 1}
{ elapsedMilliseconds : 1}
{ bytesSent : 1}
{ url : 1}
{ method : 1}

{ url : 1, datetime : -1}

{ user : 1, statusCode : 1}
{ user : 1, datetime : -1}
{ user : 1, sessionId : 1, statusCode : 1, datetime : -1}
{ user : 1, sessionId : 1, url : 1, statusCode : 1, datetime : -1}

{ sessionId : 1, datetime : -1}
{ sessionId : 1, statusCode : 1}
{ sessionId : 1, statusCode : 1, datetime : -1}
{ sessionId : 1, url : 1, statusCode : 1, datetime : -1}
```

## Patterns

All the pattern of ``AccessLogValve`` are supported while ``MongoAccessLogValve`` save them in a JSON form.

| Pattern    | Key            | Description |
|------------|----------------|-----------|
| %a         | remoteIP       | See AccessLogValve ([doc](http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %A         | localIP        | See AccessLogValve ([doc](http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %b         | bytesSent      | See AccessLogValve ([doc](http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %B         | bytesSent      | See AccessLogValve ([doc](http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %h         | remoteHost     | See AccessLogValve ([doc](http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %H         | protocol       | See AccessLogValve ([doc](http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %l         | user           | See AccessLogValve ([doc](http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %m         | method         | See AccessLogValve ([doc](http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %p         | localPort      | See AccessLogValve ([doc](http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %q         | queryString    | See AccessLogValve ([doc](http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %r         | line1st        | See AccessLogValve ([doc](http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %s         | statusCode     | See AccessLogValve ([doc](http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %S         | sessionId      | See AccessLogValve ([doc](http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %t         | datetime       | See AccessLogValve ([doc](http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %t{format} | datetime       | Same effect as ``%t`` | 
| %u         | remoteUser     | See AccessLogValve ([doc](http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %U         | url            | See AccessLogValve ([doc](http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %v         | serverName     | See AccessLogValve ([doc](http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %D         | elapsedMillis  | See AccessLogValve ([doc](http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %T         | elapsedSeconds | See AccessLogValve ([doc](http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %I         | thread         | See AccessLogValve ([doc](http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %P         | params         | All the GET and POST parameters, value is in the form of ``{ param1 : value1, param2 : value2, params3 : [value1, value2, value3] }`` | 
| %{xxx}i    | requestHeaders     | Request headers ``{ header1 : value1, header2 : value2}``. See AccessLogValve ([doc](http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) |
| %{xxx}o    | responseHeaders    | Response headers ``{ header1 : value1, header2 : value2}``. See AccessLogValve ([doc](http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) |
| %{xxx}c    | cookies            | Cookies ``{ cookie1 : value1, cookie2 : value2}``. See AccessLogValve ([doc](http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) |
| %{xxx}r    | requestAttrs       | Attributes in the ServletRequest ``{ attr1 : value1, attr2 : value2}``. See AccessLogValve ([doc](http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) |
| %{xxx}s    | sessionAttrs       | Attributes in the HttpSession ``{ attr1 : value1, attr2 : value2}``. See AccessLogValve ([doc](http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) |
| %{xxx}t    | **not supported**  |  |

### Shorthand pattern

The shorthand patterns ``common`` and ``combined`` are also supported.

And ``MongoAccessLogValve`` provides two more shorthand patterns:

1. ``default`` equivalent to `` %a %b %l %m %s %S %t %U %T %P %{Referer}i %{User-Agent}i``
2. ``all`` equivalent to ``%a %A %b %B %h %H %l %m %p %q %r %s %S %t %u %U %v %D %T %I %P %{Referer}i %{User-Agent}i``
