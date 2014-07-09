package chanjarster.tomcat.valves;

import java.net.UnknownHostException;

import org.apache.catalina.Valve;
import org.apache.catalina.startup.Tomcat;
import org.apache.catalina.valves.AccessLogValve;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.junit.Test;

import chanjarster.tomcat.util.PostGenerator;

import com.mongodb.DB;
import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;

public class MongoLogBenchmark extends AbstractValveTest {

  String url = "mongodb://localhost";
  String dbName = "test_logs";
  String collName = "tomcat_access_logs";
  String pattern = "all";
  
  MongoClient mongoClient = null;
  DB db = null;
  
  @Override
  protected void setUpValve(Tomcat tomcat) throws UnknownHostException {
    // remove AccessLogValve
    for (Valve vl : tomcat.getHost().getPipeline().getValves()) {
      if (vl.getClass().equals(AccessLogValve.class)) {
        tomcat.getHost().getPipeline().removeValve(vl);
      }
    }
    
    mongoClient = new MongoClient(new MongoClientURI(url));
    db = mongoClient.getDB(dbName);
    
    MongoAccessLogValve mavl = new MongoAccessLogValve();
    mavl.setUri(url);
    mavl.setDbName(dbName);
    mavl.setCollName(collName);
    mavl.setPattern(pattern);
    
    tomcat.getHost().getPipeline().addValve(mavl);
  }
  
  @Override
  public void tearDown() throws Exception {
    super.tearDown();
    // drop collection
//    db.getCollection(collName).drop();
//    db.dropDatabase();
  }
  
  @Test
  public void benchmark() throws Exception {
    Tomcat tomcat = getTomcatInstance();
    tomcat.start();
    
    CloseableHttpClient httpclient = HttpClients.createDefault();
    
    int[] iterationsArray = {100/*, 1000, 10000, 100000*/};

    long total = 0;
    for(int iterations : iterationsArray) {
      for (int i = 0; i < iterations; i++) {
        HttpUriRequest post = PostGenerator.gen(tomcat.getConnector().getLocalPort());
        long start = System.currentTimeMillis();
        httpclient.execute(post).close();
        total += System.currentTimeMillis() - start;
      }
      sb.append(iterations + " iterations using MongoAccessLogValve took " + total + "ms").append("\n");
    }
    
  }

}
