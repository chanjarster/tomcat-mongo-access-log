package me.chanjar.tomcat.valves;

public class Constants {
  public static final String Package = "me.chanjar.tomcat.valves";

  //Constants for the AccessLogValve class
  public static final class MongoAccessLog {
    
      public static final String DEFAULT_ALIAS = "default";
      public static final String DEFAULT_PATTERN = "%a %B %l %m %s %S %t %U %T %P %{Referer}i %{User-Agent}i";
      
      public static final String ALL_ALIAS = "all";
      public static final String ALL_PATTERN = "%a %A %b %B %h %H %l %m %p %q %r %s %S %t %u %U %v %D %T %I %P %{Referer}i %{User-Agent}i";
      
  }
  
}
