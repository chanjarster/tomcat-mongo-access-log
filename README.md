Tomcat Mongo Access Log
=======================

This project is inspired by two articles:

1. [MongoDB is fantastic for logging](http://blog.mongodb.org/post/172254834/mongodb-is-fantastic-for-logging)
2. [MongoDB use case - storing log data](http://docs.mongodb.org/ecosystem/use-cases/storing-log-data/)


Tomcat Mongo Access Log comes with two parts:

1. A **java** project you can build by yourself and plug the ``MongoAccessLogValve`` into your tomcat settings to save all the access log to mongodb. Please see [README](java/README.md) in java folder for more details.
2. A **nodejs** project provide some simple functionality to search access log produced by ``MongoAccessLogValve``. Please see [README](nodejs/README.md) in nodejs folder for more details.

