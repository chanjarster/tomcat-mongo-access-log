package me.chanjar.tomcat.valves;

import java.io.File;

import org.apache.catalina.Globals;
import org.apache.catalina.Valve;
import org.apache.catalina.startup.Tomcat;
import org.apache.catalina.valves.AccessLogValve;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.junit.Test;

import me.chanjar.tomcat.util.PostGenerator;

public class AccessLogBenchmark extends AbstractValveTest {

  String accessLogDirectory = System.getProperty("tomcat.test.reports");
  
  @Override
  public void setUpValve(Tomcat tomcat) {
    // clear AccessLogValve
    for (Valve vl : tomcat.getHost().getPipeline().getValves()) {
      if (vl.getClass().equals(AccessLogValve.class)) {
        tomcat.getHost().getPipeline().removeValve(vl);
      }
    }
    
    if (accessLogDirectory == null) {
      accessLogDirectory = new File(getBuildDirectory(), "logs").toString();
    }
    AccessLogValve alv = new AccessLogValve();
    alv.setDirectory(accessLogDirectory);
    alv.setPattern("combined");

    tomcat.getHost().getPipeline().addValve(alv);
  }
  
  @Override
  public void tearDown() throws Exception {
    super.tearDown();
    // delete logs directory
    File dir = new File(accessLogDirectory);
    if (!dir.isAbsolute()) {
      dir = new File(System.getProperty(Globals.CATALINA_BASE_PROP), accessLogDirectory);
  }
    for(String f : dir.list()) {
      new File(dir.getAbsolutePath(), f).delete();
    }
    dir.delete();
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
      sb.append(iterations + " iterations using AccessLogValve took " + total + "ms").append("\n");
    }
    
  }

}
