package me.chanjar.tomcat.valves;

import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.List;

import org.apache.juli.logging.Log;
import org.apache.tomcat.util.res.StringManager;
import org.apache.tomcat.util.ExceptionUtils;

import com.mongodb.BasicDBObject;
import com.mongodb.BasicDBObjectBuilder;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.DBObject;
import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;

public class CollectionFactory {

  public static DBCollection getOrCreateCollection(
      String uri, String dbName, String collName, boolean capped, int capSize, Log log, StringManager sm) {
    
    MongoClient mongoClient = null;
    DB db = null;
    try {
      mongoClient = new MongoClient(new MongoClientURI(uri));
      db = mongoClient.getDB(dbName);
    } catch (UnknownHostException ex) {
      log.error(sm.getString("mongoAccessLogValve.openConnectionError", uri), ex);
      throw new RuntimeException(ex);
    }
    
    DBCollection coll = null;
    try {
      if (capped) {
        DBObject options = new BasicDBObject();
        options.put("capped", true);
        options.put("size", capSize * 1024 * 1024);
        coll = db.createCollection(collName, options);
        
        for(DBObject indexOption : getIndexOptions()) {
          coll.createIndex(indexOption);
        }
        
      } else {
        coll = db.getCollection(collName);
      }
    } catch (com.mongodb.CommandFailureException ex) {
      String errmsg = (String) ex.getCommandResult().get("errmsg");
      if ("collection already exists".equals(errmsg)) {
        log.info(sm.getString("mongoAccessLogValve.collectionExisted", collName));
        coll = db.getCollection(collName);
      }
      ExceptionUtils.handleThrowable(ex);
    } catch (Exception ex) {
      log.error(sm.getString(
          "mongoAccessLogValve.openConnectionError", uri), ex);
    }
    
    return coll;
  }
  
  protected static List<DBObject> getIndexOptions() {
    
    List<DBObject> options = new ArrayList<DBObject>();
    
    options.add(BasicDBObjectBuilder.start().add("sessionId", 1).get());
    options.add(BasicDBObjectBuilder.start().add("datetime", -1).get());
    options.add(BasicDBObjectBuilder.start().add("user", 1).get());
    options.add(BasicDBObjectBuilder.start().add("statusCode", 1).get());
    options.add(BasicDBObjectBuilder.start().add("elapsedSeconds", 1).get());
    options.add(BasicDBObjectBuilder.start().add("elapsedMilliseconds", 1).get());
    options.add(BasicDBObjectBuilder.start().add("bytesSent", 1).get());
    options.add(BasicDBObjectBuilder.start().add("url", 1).get());
    options.add(BasicDBObjectBuilder.start().add("method", 1).get());
    
    options.add(BasicDBObjectBuilder.start().add("url", 1).add("datetime", -1).get());
    
    options.add(BasicDBObjectBuilder.start().add("user", 1).add("statusCode", 1).get());
    options.add(BasicDBObjectBuilder.start().add("user", 1).add("datetime", -1).get());
    options.add(BasicDBObjectBuilder.start().add("user", 1).add("sessionId", 1).add("statusCode", 1).add("datetime", -1).get());
    options.add(BasicDBObjectBuilder.start().add("user", 1).add("sessionId", 1).add("url", 1).add("statusCode", 1).add("datetime", -1).get());
    
    options.add(BasicDBObjectBuilder.start().add("sessionId", 1).add("datetime", -1).get());
    options.add(BasicDBObjectBuilder.start().add("sessionId", 1).add("statusCode", 1).get());
    options.add(BasicDBObjectBuilder.start().add("sessionId", 1).add("statusCode", 1).add("datetime", -1).get());
    options.add(BasicDBObjectBuilder.start().add("sessionId", 1).add("url", 1).add("statusCode", 1).add("datetime", -1).get());

    return options;
    
  }
  
}
