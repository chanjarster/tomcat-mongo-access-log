package chanjarster.tomcat.valves;

import org.apache.catalina.Context;
import org.apache.catalina.deploy.FilterDef;
import org.apache.catalina.deploy.FilterMap;
import org.apache.catalina.startup.Tomcat;
import org.apache.catalina.startup.TomcatBaseTest;

import chanjarster.tomcat.util.FakeServlet;

public abstract class AbstractValveTest extends TomcatBaseTest {


  protected StringBuilder sb;
  
  @Override
  public void setUp() throws Exception {
    super.setUp();
    Tomcat tomcat = getTomcatInstance();
    
    tomcat.getConnector().setURIEncoding("UTF-8");
    Context ctx = tomcat.addContext("", getTemporaryDirectory().getAbsolutePath());
    
    Tomcat.addServlet(ctx, "servlet", new FakeServlet());
    ctx.addServletMapping("/", "servlet");

    FilterDef filterDef = new FilterDef();
    filterDef.setFilterClass("org.apache.catalina.filters.SetCharacterEncodingFilter");
    filterDef.setFilterName("setCharacterEncodingFilter");
    filterDef.addInitParameter("encoding", "UTF-8");
    filterDef.setAsyncSupported("true");
    ctx.addFilterDef(filterDef);
    
    FilterMap filterMap = new FilterMap();
    filterMap.setFilterName("setCharacterEncodingFilter");
    filterMap.addURLPattern("/*");
    ctx.addFilterMap(filterMap);
    
    this.sb = new StringBuilder();
    setUpValve(tomcat);
  }
  
  protected abstract void setUpValve(Tomcat tomcat) throws Exception;

  @Override
  public void tearDown() throws Exception {
    super.tearDown();
    System.out.println(sb.toString());
    sb = null;
  }
  
}
