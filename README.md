tomcat-mongo-access-log
=======================

Tomcat Mongo Access Log comes with two parts:

1. A java project you can build by yourself and plug the ``MongoAccessLogValve`` into your tomcat settings. 
The ``MongoAccessLogValve`` will log all the access log to mongodb.
2. A nodejs project provide some simple functionality to search access log produced by ``MongoAccessLogValve``
