Tomcat Mongo Access Log
=======================

Tomcat Mongo Access Log can be used to save tomcat access log to mongodb. 

The project comes with two subprojects:

1. A **java** project can be built by maven and plug the ``MongoAccessLogValve`` into your tomcat settings. Please see [README](java/README.md) in java folder for more details.
2. A **nodejs** project is a simple webapp you can search access logs saved by ``MongoAccessLogValve``. Please see [README](nodejs/README.md) in nodejs folder for more details.

