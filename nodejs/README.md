Tomcat Mongo Access Log Console
===================

This project is used to browse the logs save by ``MongoAccessLogValve``.

## Usage

Have a nodejs and npm installed. 

Copy ``config.default.json`` to ``config.json``. 

Modify ``config.json`` see [mongodb url](http://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html#the-url-connection-format) and collection name.

Run command: 

```bash
npm install
npm start
# or
./start
```
Open browser ``http://localhost:3000`` 
