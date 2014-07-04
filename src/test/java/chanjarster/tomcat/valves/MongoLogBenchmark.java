package chanjarster.tomcat.valves;

import java.io.IOException;
import java.net.URI;
import java.net.UnknownHostException;

import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServlet;

import org.apache.catalina.Context;
import org.apache.catalina.Valve;
import org.apache.catalina.startup.Tomcat;
import org.apache.catalina.startup.TomcatBaseTest;
import org.apache.catalina.valves.AccessLogValve;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.client.methods.RequestBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.junit.Test;

import com.mongodb.DB;
import com.mongodb.MongoClient;

public class MongoLogBenchmark extends TomcatBaseTest {


  private StringBuilder sb;
  
  @Override
  public void setUp() throws Exception {
    super.setUp();
    Tomcat tomcat = getTomcatInstance();
    
    Context ctx = tomcat.addContext("", getTemporaryDirectory().getAbsolutePath());
    Tomcat.addServlet(ctx, "servlet", new HttpServlet() {
      private static final long serialVersionUID = 1L;
      
      @Override
      public void service(ServletRequest req, ServletResponse res) throws ServletException, IOException {
//        req.getParameterNames();
        res.setContentType("text/plain; charset=ISO-8859-1");
        res.getWriter().write("OK");
      }
      
    });
    ctx.addServletMapping("/", "servlet");
    
    /*
     * prepare MongoAccessLogValve
     */
    String host = "localhost";
    int port = 27017;
    String dbName = "test_logs";
    String collName = "tomcat_access_logs";
    
    // drop existed collection
    MongoClient mongoClient = null;
    DB db = null;
    try {
      mongoClient = new MongoClient(host, port);
      db = mongoClient.getDB(dbName);
      db.getCollection(collName).drop();
    } catch (UnknownHostException ex) {
      
    }
    
    MongoAccessLogValve mavl = new MongoAccessLogValve();
    mavl.setHost(host);
    mavl.setPort(port);
    mavl.setDbName(dbName);
    mavl.setCollName(collName);
    mavl.setPattern("%P");
    
    // remove AccessLogValve
    for (Valve vl : tomcat.getHost().getPipeline().getValves()) {
      if (vl.getClass().equals(AccessLogValve.class)) {
        tomcat.getHost().getPipeline().removeValve(vl);
      }
    }
    
    tomcat.getHost().getPipeline().addValve(mavl);
    
    this.sb = new StringBuilder();
  }
  

  @Override
  public void tearDown() throws Exception {
    super.tearDown();
    System.out.println(sb.toString());
    sb = null;
  }
  
  @Test
  public void testMongoAccessLogValve() throws Exception {
    Tomcat tomcat = getTomcatInstance();
    tomcat.start();
    
    CloseableHttpClient httpclient = HttpClients.createDefault();
    String uri = "http://localhost:" + tomcat.getConnector().getLocalPort() + "/";
    HttpUriRequest post = RequestBuilder.post()
        .setUri(new URI(uri))
        .addParameter("IDToken1", "username")
        .addParameter("IDToken2", "password")
        .addParameter("IDToken3", "password")
        .addParameter("IDToken4", "password")
        .addParameter("IDToken5", "password")
        .build();
    

    int[] iterationsArray = {/*100, 1000,*/ 1};

    for(int iterations : iterationsArray) {
      long start = System.currentTimeMillis();
      for (int i = 0; i < iterations; i++) {
        doRequest(httpclient, post);
      }
      long end = System.currentTimeMillis();
      sb.append(iterations + " iterations using MongoAccessLogValve took " + (end - start) + "ms").append("\n");
    }
    
  }

  private void doRequest(CloseableHttpClient httpclient, HttpUriRequest post) throws ClientProtocolException, IOException {
    httpclient.execute(post).close();
  }
  
}
