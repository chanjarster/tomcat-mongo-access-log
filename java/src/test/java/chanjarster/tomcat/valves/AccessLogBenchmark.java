package chanjarster.tomcat.valves;

import java.io.File;
import java.io.IOException;
import java.net.URI;

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

public class AccessLogBenchmark extends TomcatBaseTest {


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
        req.getParameterNames();
        res.setContentType("text/plain; charset=ISO-8859-1");
        res.getWriter().write("OK");
        try {
          f();
        } catch ( Exception e) {
//          throw new RuntimeException(e);
        }
      }
      
      private void f() {
        throw new RuntimeException("sfaasfsdf");
      }
    });
    ctx.addServletMapping("/", "servlet");
    
    // clear AccessLogValve
    for (Valve vl : tomcat.getHost().getPipeline().getValves()) {
      if (vl.getClass().equals(AccessLogValve.class)) {
        tomcat.getHost().getPipeline().removeValve(vl);
      }
    }
    
    String accessLogDirectory = System.getProperty("tomcat.test.reports");
    if (accessLogDirectory == null) {
      accessLogDirectory = new File(getBuildDirectory(), "logs").toString();
    }
    AccessLogValve alv = new AccessLogValve();
    alv.setDirectory(accessLogDirectory);
    alv.setPattern("combined");

    tomcat.getHost().getPipeline().addValve(alv);
    
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
    

    int[] iterationsArray = {/*100, 1000,*/ 10000};

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
