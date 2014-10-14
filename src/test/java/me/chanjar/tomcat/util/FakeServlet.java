package me.chanjar.tomcat.util;

import java.io.IOException;
import java.util.Random;

import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServlet;

public class FakeServlet  extends HttpServlet {


  private static final long serialVersionUID = 1L;
  
  protected static Random r = new Random();
  
  @Override
  public void service(ServletRequest req, ServletResponse res) throws ServletException, IOException {
    req.getParameterNames();
    if (r.nextBoolean()) {
      throw new RuntimeException("Exception for test");
    }
    res.setContentType("text/plain; charset=ISO-8859-1");
    res.getWriter().write("OK");
  }
  
  
}
