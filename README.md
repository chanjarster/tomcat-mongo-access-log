tomcat-mongo-access-log
=======================

``MongoAccessLogValve`` is use to save tomcat access log to mongodb.

## Usage

``MongoAccessLogValve`` can be configured in ``${tomcat}/conf/server.xml``, ``${tomcat}/conf/context.xml`` or in a context file. Below is example:

```xml
<Valve 
    className="chanjarster.tomcat.valves.MongoAccessLogValve" 
    recordError="false"
    pattern="%a %l %u %t %r %s %b" />
```

## Attributes

``MongoAccessLogValve`` supports the following configuration attributes derived from [AccessLogValve](http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve) :
1. condition
1. resolveHosts
1. conditionIf
1. excludes
1. pattern. As same as ``AccessLogVavlve``'is pattern, but extends with a ``%P`` pattern, 
1. requestAttributesEnabled

And some attributes differs from ``AccessLogValve``:

| Attribute | Description |
|--------|--------|
|   host   |  MongoDB's host or ip address     |
|   port   |  MongoDB's port, default is 27017      |
|   dbName  |   MongoDB's db to store logs     |
|collName |  MongoDB's collection to store logs, default is ``tomcat_access_logs``      |
|   rotatable     |   If rotatable is on this MongoDBAccessLogValve will try to create a capped collection with the size of ``rotateCount``(default is 1024, in megabytes) if the collection is not exist     |
| rotateCount| Size of capped collection, in megabytes |
| recordError| When exception happends ``MongDBAccessLogValve`` will store exception information in ``error`` key |

## Patterns

Because mongodb is a key-value database, so ``MongoAccessLogValve`` stores the log in a JSON like form. You can use the pattern just like the document of ``AccessLogValve``.

| Pattern | Key | Description |
|--------|--------|-----------|
| %a | remoteIP | See AccessLogValve ([doc](http://http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %A | localIP  | See AccessLogValve ([doc](http://http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %b | bytesSent | See AccessLogValve ([doc](http://http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %B | bytesSent | See AccessLogValve ([doc](http://http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %h | remoteHost | See AccessLogValve ([doc](http://http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %H | protocol | See AccessLogValve ([doc](http://http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %l | user | See AccessLogValve ([doc](http://http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %m | method | See AccessLogValve ([doc](http://http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %p | localPort | See AccessLogValve ([doc](http://http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %q | queryString | See AccessLogValve ([doc](http://http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %r | line1st | See AccessLogValve ([doc](http://http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %s | statusCode | See AccessLogValve ([doc](http://http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %S | sessionId | See AccessLogValve ([doc](http://http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %t | datetime | See AccessLogValve ([doc](http://http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %t{format} | datetime | Same effective of %t | 
| %u | remoteUser | See AccessLogValve ([doc](http://http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %U | url | See AccessLogValve ([doc](http://http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %v | serverName | See AccessLogValve ([doc](http://http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %D | elapsedMillis | See AccessLogValve ([doc](http://http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %T | elapsedSeconds | See AccessLogValve ([doc](http://http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %I | thread | See AccessLogValve ([doc](http://http://tomcat.apache.org/tomcat-7.0-doc/config/valve.html#Access_Log_Valve)) | 
| %P | params | All the GET or POST parameters, value is in the form of ``{ param1 : value1, param2 : value2, params3 : [value1, value2, value3] }`` | 

### Shorthand patter

The shorthand patterns ``common`` and ``combined`` are also supported, and ``MongoAccessLogValve`` provide a ``default`` pattern which is equivalent to `` %a %b %l %m %s %S %t %U %T %P``